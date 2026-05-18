import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { AwsClient } from 'https://esm.sh/aws4fetch@1'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const CITIES = ['Bandung', 'Jakarta', 'Tangerang', 'Surabaya', 'Medan', 'Bali', 'Yogyakarta', 'Solo']
const MAX_NEW_PER_CITY = 1
const MAX_PHOTOS = 3
const PLACES_API_BASE = 'https://places.googleapis.com/v1/places:searchText'

interface PlacePhoto {
  name: string // e.g. "places/ChIJ.../photos/AXCi2Q..."
}

interface PlaceResult {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  editorialSummary?: { text: string }
  types?: string[]
  photos?: PlacePhoto[]
}

interface InsertedBar {
  name: string
  city: string
  google_place_id: string
  rating: number | null
  photos_saved: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[&]/g, 'and')
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
}

async function getUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  baseName: string,
  city: string
): Promise<string> {
  const baseSlug = `${slugify(baseName)}-${city.toLowerCase()}`
  let slug = baseSlug
  let attempt = 1

  while (true) {
    const { data } = await supabase
      .from('cafes')
      .select('id')
      .eq('slug_name', slug)
      .maybeSingle()

    if (!data) return slug

    attempt++
    slug = `${baseSlug}-${attempt}`
  }
}

function buildWorkingHoursJson(weekdayDescriptions: string[]): string {
  if (!weekdayDescriptions.length) return ''
  const obj: Record<string, string> = {}
  for (const entry of weekdayDescriptions) {
    const idx = entry.indexOf(':')
    if (idx > -1) {
      obj[entry.substring(0, idx).trim()] = entry.substring(idx + 1).trim()
    }
  }
  return JSON.stringify(obj)
}

async function fetchAndUploadPhoto(
  aws: InstanceType<typeof AwsClient>,
  googleApiKey: string,
  r2Endpoint: string,
  r2Bucket: string,
  r2PublicUrl: string,
  photoName: string,
  r2Key: string
): Promise<string | null> {
  try {
    // Fetch photo bytes from Google Places (follows redirect to CDN)
    const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${googleApiKey}&maxHeightPx=1200`
    const imgRes = await fetch(photoUrl)
    if (!imgRes.ok) {
      console.warn(`[discover-bars] Photo fetch failed: HTTP ${imgRes.status}`)
      return null
    }

    const imgBytes = await imgRes.arrayBuffer()
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg'

    // Upload to Cloudflare R2
    const uploadUrl = `${r2Endpoint}/${r2Bucket}/${r2Key}`
    const uploadRes = await aws.fetch(uploadUrl, {
      method: 'PUT',
      body: imgBytes,
      headers: { 'Content-Type': contentType },
    })

    if (!uploadRes.ok) {
      const body = await uploadRes.text()
      console.warn(`[discover-bars] R2 upload failed: ${uploadRes.status} ${body}`)
      return null
    }

    return `${r2PublicUrl}/${r2Key}`
  } catch (err) {
    console.warn(`[discover-bars] Photo error: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

async function generateDescription(
  anthropicKey: string,
  name: string,
  city: string,
  editorialSummary: string,
  types: string[],
  rating: number | undefined,
  reviews: number | undefined
): Promise<string> {
  try {
    const typeLabels = (types ?? [])
      .filter((t) => !['establishment', 'point_of_interest', 'food'].includes(t))
      .map((t) => t.replace(/_/g, ' '))
      .slice(0, 3)
      .join(', ')

    const prompt = [
      `Buatkan deskripsi singkat (2–3 kalimat) dalam Bahasa Indonesia yang menarik dan kasual untuk sebuah bar bernama "${name}" yang berlokasi di ${city}.`,
      editorialSummary ? `Deskripsi dari Google: "${editorialSummary}".` : '',
      typeLabels ? `Tipe tempat: ${typeLabels}.` : '',
      rating ? `Rating: ${rating}/5 dari ${reviews?.toLocaleString() ?? '?'} ulasan.` : '',
      `Gaya penulisan: hangat, mengundang, seperti rekomendasi teman — bukan iklan. Jangan mulai dengan kata "Bar ini". Tidak perlu menyebut nama bar lagi di kalimat pertama.`,
    ]
      .filter(Boolean)
      .join(' ')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.warn(`[discover-bars] Anthropic API error: ${res.status}`)
      return editorialSummary
    }

    const json = await res.json()
    return json.content?.[0]?.text?.trim() ?? editorialSummary
  } catch (err) {
    console.warn(`[discover-bars] generateDescription error: ${err instanceof Error ? err.message : err}`)
    return editorialSummary
  }
}

async function sendSummaryEmail(
  gmailPassword: string,
  inserted: InsertedBar[],
  errors: string[]
): Promise<void> {
  if (!gmailPassword) return

  const date = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Jakarta',
  })

  const barList = inserted.length > 0
    ? inserted.map((c) => `- ${c.name} (${c.city}) ★${c.rating ?? '?'} · ${c.photos_saved} foto`).join('\n')
    : 'Tidak ada bar baru ditemukan.'

  const errorSection = errors.length > 0
    ? `\n\nErrors:\n${errors.join('\n')}`
    : ''

  const body = [
    `🍺 NDM Daily Discovery — ${date}`,
    ``,
    `${inserted.length} bar baru menunggu review:`,
    `https://ngebir.di-mana.com/admin/review`,
    ``,
    barList,
    errorSection,
  ].join('\n')

  try {
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: 'dickyjuwono@gmail.com',
          password: gmailPassword,
        },
      },
    })
    await client.send({
      from: 'dickyjuwono@gmail.com',
      to: 'dickyjuwono@gmail.com',
      subject: `🍺 NDM: ${inserted.length} bar baru ditemukan — ${date}`,
      content: body,
    })
    await client.close()
    console.log('[discover-bars] Summary email sent')
  } catch (err) {
    console.warn(`[discover-bars] Email error: ${err instanceof Error ? err.message : err}`)
  }
}

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')!
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
  const r2AccessKey = Deno.env.get('CLOUDFLARE_R2_ACCESS_KEY_ID')!
  const r2SecretKey = Deno.env.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY')!
  const r2Bucket = Deno.env.get('CLOUDFLARE_R2_BUCKET')!
  const r2Endpoint = Deno.env.get('CLOUDFLARE_R2_ENDPOINT')!
  const r2PublicUrl = Deno.env.get('CLOUDFLARE_R2_PUBLIC_URL')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const aws = new AwsClient({
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
    service: 's3',
  })

  const inserted: InsertedBar[] = []
  const errors: string[] = []

  for (const city of CITIES) {
    console.log(`[discover-bars] Processing city: ${city}`)

    const { data: existing, error: fetchError } = await supabase
      .from('cafes')
      .select('google_place_id')
      .not('google_place_id', 'is', null)
      .eq('city', city)

    if (fetchError) {
      console.error(`[discover-bars] Failed to fetch existing bars: ${fetchError.message}`)
      errors.push(`${city}: fetch error — ${fetchError.message}`)
      continue
    }

    const existingIds = new Set(
      (existing ?? []).map((r: { google_place_id: string }) => r.google_place_id)
    )

    let places: PlaceResult[] = []
    try {
      const response = await fetch(PLACES_API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.rating',
            'places.userRatingCount',
            'places.regularOpeningHours',
            'places.editorialSummary',
            'places.types',
            'places.photos',
          ].join(','),
        },
        body: JSON.stringify({
          textQuery: `bar in ${city}`,
          languageCode: 'id',
          maxResultCount: 20,
        }),
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(`HTTP ${response.status}: ${body}`)
      }

      const json = await response.json()
      places = json.places ?? []
      console.log(`[discover-bars] ${city}: got ${places.length} results from Places API`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[discover-bars] Places API error for ${city}: ${msg}`)
      errors.push(`${city}: Places API error — ${msg}`)
      continue
    }

    const newPlaces = places.filter((p) => p.id && !existingIds.has(p.id))
    console.log(`[discover-bars] ${city}: ${newPlaces.length} new places after dedup`)

    const toInsert = newPlaces.slice(0, MAX_NEW_PER_CITY)

    for (const place of toInsert) {
      const name = place.displayName?.text ?? 'Unknown Bar'
      const slug = await getUniqueSlug(supabase, name, city)
      const placeId = place.id

      // ── Upload photos to R2 ────────────────────────────────────────────
      const photoUrls: string[] = []
      const photosToFetch = (place.photos ?? []).slice(0, MAX_PHOTOS)

      for (let i = 0; i < photosToFetch.length; i++) {
        const r2Key = `cafes/${placeId}/${i}.jpg`
        const url = await fetchAndUploadPhoto(
          aws, googleApiKey, r2Endpoint, r2Bucket, r2PublicUrl,
          photosToFetch[i].name, r2Key
        )
        if (url) {
          photoUrls.push(url)
          console.log(`[discover-bars] Photo ${i + 1}/${photosToFetch.length} uploaded: ${url}`)
        }
      }

      const mainPhoto = photoUrls[0] ?? null

      // ── Insert bar row ─────────────────────────────────────────────────
      const row = {
        name,
        full_address: place.formattedAddress ?? '',
        city,
        slug_name: slug,
        google_place_id: placeId,
        rating: place.rating ?? null,
        reviews: place.userRatingCount ?? null,
        description: await generateDescription(
          anthropicKey,
          name,
          city,
          place.editorialSummary?.text ?? '',
          place.types ?? [],
          place.rating,
          place.userRatingCount
        ),
        working_hours: buildWorkingHoursJson(
          place.regularOpeningHours?.weekdayDescriptions ?? []
        ),
        photo: mainPhoto,
        source: 'auto-discovered',
        is_published: false,
      }

      const { data: insertedRow, error: insertError } = await supabase
        .from('cafes')
        .insert(row)
        .select('id')
        .single()

      if (insertError) {
        console.error(`[discover-bars] Insert failed for "${name}": ${insertError.message}`)
        errors.push(`${city}/${name}: insert error — ${insertError.message}`)
        continue
      }

      // ── Insert additional photos into cafe_pics ────────────────────────
      const extraPhotos = photoUrls.slice(1)
      if (extraPhotos.length > 0 && insertedRow?.id) {
        const picRows = extraPhotos.map((url) => ({
          cafe_id: insertedRow.id,
          url,
        }))
        const { error: picsError } = await supabase.from('cafe_pics').insert(picRows)
        if (picsError) {
          console.warn(`[discover-bars] cafe_pics insert error: ${picsError.message}`)
        }
      }

      console.log(
        `[discover-bars] Inserted: "${name}" (${city}) slug="${slug}" photos=${photoUrls.length}`
      )
      inserted.push({
        name,
        city,
        google_place_id: placeId,
        rating: place.rating ?? null,
        photos_saved: photoUrls.length,
      })
    }
  }

  const body = {
    success: errors.length === 0,
    inserted_count: inserted.length,
    bars: inserted,
    errors: errors.length > 0 ? errors : undefined,
  }

  console.log(`[discover-bars] Done. Inserted ${inserted.length} bar(s).`)

  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD') ?? ''
  await sendSummaryEmail(gmailPassword, inserted, errors)

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
