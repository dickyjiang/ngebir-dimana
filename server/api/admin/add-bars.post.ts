import { serverSupabaseServiceRole } from '#supabase/server'

const MAX_QUERIES = 15
const MAX_PHOTOS = 3
const CITY = 'Bandung'
const BANDUNG_CENTER = { latitude: -6.9175, longitude: 107.6191 }
const PLACES_BASE = 'https://places.googleapis.com/v1'

type PreviewStatus = 'new' | 'duplicate' | 'not_found' | 'not_bandung' | 'error'

interface PlaceSummary {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
}

interface PlaceDetail extends PlaceSummary {
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  editorialSummary?: { text: string }
  types?: string[]
  photos?: { name: string }[]
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

function normalizeName(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '')
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

function isBandung(address: string | undefined): boolean {
  return (address ?? '').toLowerCase().includes('bandung')
}

async function isDuplicate(client: any, placeId: string, name: string): Promise<boolean> {
  const baseSlug = `${slugify(name)}-bandung`

  const { data: byPlace } = await client
    .from('cafes')
    .select('id')
    .eq('google_place_id', placeId)
    .limit(1)
  if (byPlace?.length) return true

  const { data: bySlug } = await client
    .from('cafes')
    .select('id')
    .ilike('slug_name', `${baseSlug}%`)
    .limit(1)
  if (bySlug?.length) return true

  const { data: sameCity } = await client
    .from('cafes')
    .select('name')
    .ilike('city', `%${CITY}%`)
  const target = normalizeName(name)
  return (sameCity ?? []).some((c: { name: string }) => normalizeName(c.name) === target)
}

async function getUniqueSlug(client: any, name: string): Promise<string> {
  const baseSlug = `${slugify(name)}-bandung`
  let slug = baseSlug
  let attempt = 1

  while (true) {
    const { data } = await client.from('cafes').select('id').eq('slug_name', slug).maybeSingle()
    if (!data) return slug
    attempt++
    slug = `${baseSlug}-${attempt}`
  }
}

async function fetchAndUploadPhoto(
  googleApiKey: string,
  photoName: string,
  r2Key: string
): Promise<string | null> {
  try {
    const res = await fetch(`${PLACES_BASE}/${photoName}/media?key=${googleApiKey}&maxHeightPx=1200`)
    if (!res.ok) {
      console.warn(`[admin/add-bars] Photo fetch failed: HTTP ${res.status}`)
      return null
    }
    const bytes = Buffer.from(await res.arrayBuffer())
    return await uploadToR2(bytes, r2Key, res.headers.get('content-type') ?? 'image/jpeg')
  } catch (err) {
    console.warn(`[admin/add-bars] Photo error: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

async function generateDescription(place: PlaceDetail, name: string): Promise<string> {
  const editorialSummary = place.editorialSummary?.text ?? ''
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return editorialSummary

  try {
    const typeLabels = (place.types ?? [])
      .filter((t) => !['establishment', 'point_of_interest', 'food'].includes(t))
      .map((t) => t.replace(/_/g, ' '))
      .slice(0, 3)
      .join(', ')

    const prompt = [
      `Buatkan deskripsi singkat (2–3 kalimat) dalam Bahasa Indonesia yang menarik dan kasual untuk sebuah bar bernama "${name}" yang berlokasi di ${CITY}.`,
      editorialSummary ? `Deskripsi dari Google: "${editorialSummary}".` : '',
      typeLabels ? `Tipe tempat: ${typeLabels}.` : '',
      place.rating
        ? `Rating: ${place.rating}/5 dari ${place.userRatingCount?.toLocaleString() ?? '?'} ulasan.`
        : '',
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
      console.warn(`[admin/add-bars] Anthropic API error: ${res.status}`)
      return editorialSummary
    }

    const json = await res.json()
    return json.content?.[0]?.text?.trim() ?? editorialSummary
  } catch (err) {
    console.warn(`[admin/add-bars] generateDescription error: ${err instanceof Error ? err.message : err}`)
    return editorialSummary
  }
}

async function searchPlace(query: string): Promise<PlaceSummary | null> {
  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount',
    },
    body: JSON.stringify({
      textQuery: `${query} ${CITY}`,
      languageCode: 'id',
      maxResultCount: 1,
      locationBias: { circle: { center: BANDUNG_CENTER, radius: 25000 } },
    }),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json()
  return json.places?.[0] ?? null
}

async function preview(client: any, rawQueries: unknown) {
  const queries = (Array.isArray(rawQueries) ? rawQueries : [])
    .map((q) => String(q).trim())
    .filter(Boolean)

  if (!queries.length || queries.length > MAX_QUERIES) {
    throw createError({ statusCode: 400, message: `Masukkan 1-${MAX_QUERIES} nama bar` })
  }

  const searched = await Promise.all(
    queries.map(async (query) => {
      try {
        return { query, place: await searchPlace(query), error: null as string | null }
      } catch (err) {
        return { query, place: null, error: err instanceof Error ? err.message : String(err) }
      }
    })
  )

  const seen = new Set<string>()
  const results = []

  for (const { query, place, error } of searched) {
    const base = { query, placeId: '', name: '', address: '', rating: null as number | null, reviews: null as number | null }
    let status: PreviewStatus
    let reason: string | undefined

    if (error) {
      results.push({ ...base, status: 'error' as PreviewStatus, reason: error })
      continue
    }
    if (!place) {
      results.push({ ...base, status: 'not_found' as PreviewStatus })
      continue
    }

    const name = place.displayName?.text ?? query
    const row = {
      ...base,
      placeId: place.id,
      name,
      address: place.formattedAddress ?? '',
      rating: place.rating ?? null,
      reviews: place.userRatingCount ?? null,
    }

    if (!isBandung(place.formattedAddress)) {
      status = 'not_bandung'
    } else if (seen.has(place.id)) {
      status = 'duplicate'
      reason = 'Sudah ada di daftar input'
    } else if (await isDuplicate(client, place.id, name)) {
      status = 'duplicate'
      reason = 'Sudah ada di database'
    } else {
      status = 'new'
    }

    seen.add(place.id)
    results.push({ ...row, status, reason })
  }

  return { results }
}

async function commit(client: any, placeId: unknown) {
  if (typeof placeId !== 'string' || !placeId) {
    throw createError({ statusCode: 400, message: 'placeId wajib diisi' })
  }

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY!
  const res = await fetch(`${PLACES_BASE}/places/${placeId}?languageCode=id`, {
    headers: {
      'X-Goog-Api-Key': googleApiKey,
      'X-Goog-FieldMask':
        'id,displayName,formattedAddress,rating,userRatingCount,regularOpeningHours,editorialSummary,types,photos',
    },
  })
  if (!res.ok) {
    throw createError({ statusCode: 502, message: `Places API error: HTTP ${res.status}` })
  }
  const place: PlaceDetail = await res.json()
  const name = place.displayName?.text ?? 'Unknown Bar'

  if (!isBandung(place.formattedAddress)) {
    throw createError({ statusCode: 400, message: 'Bar ini bukan di Bandung' })
  }
  if (await isDuplicate(client, placeId, name)) {
    throw createError({ statusCode: 409, message: 'Bar ini sudah ada di database' })
  }

  const slug = await getUniqueSlug(client, name)

  const photoUrls: string[] = []
  const photosToFetch = (place.photos ?? []).slice(0, MAX_PHOTOS)
  for (let i = 0; i < photosToFetch.length; i++) {
    const url = await fetchAndUploadPhoto(googleApiKey, photosToFetch[i].name, `cafes/${placeId}/${i}.jpg`)
    if (url) photoUrls.push(url)
  }

  const { data: inserted, error: insertError } = await client
    .from('cafes')
    .insert({
      name,
      full_address: place.formattedAddress ?? '',
      city: CITY,
      slug_name: slug,
      google_place_id: placeId,
      rating: place.rating ?? null,
      reviews: place.userRatingCount ?? null,
      description: await generateDescription(place, name),
      working_hours: buildWorkingHoursJson(place.regularOpeningHours?.weekdayDescriptions ?? []),
      photo: photoUrls[0] ?? null,
      source: 'manual',
      is_published: true,
    })
    .select('id')
    .single()

  if (insertError) throw createError({ statusCode: 500, message: insertError.message })

  const extraPhotos = photoUrls.slice(1)
  if (extraPhotos.length > 0) {
    const { error: picsError } = await client
      .from('cafe_pics')
      .insert(extraPhotos.map((url) => ({ cafe_id: inserted.id, url })))
    if (picsError) console.warn(`[admin/add-bars] cafe_pics insert error: ${picsError.message}`)
  }

  return { ok: true, id: inserted.id, name, slug, photos_saved: photoUrls.length }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const client = serverSupabaseServiceRole(event)
  const body = await readBody(event)
  // body: { action: 'preview', queries: string[] } | { action: 'commit', placeId: string }

  if (body?.action === 'preview') return preview(client, body.queries)
  if (body?.action === 'commit') return commit(client, body.placeId)

  throw createError({ statusCode: 400, message: 'Invalid payload' })
})
