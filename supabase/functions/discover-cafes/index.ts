import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CITIES = ['Bandung', 'Jakarta', 'Surabaya']
const MAX_NEW_PER_CITY = 3
const PLACES_API_BASE = 'https://places.googleapis.com/v1/places:searchText'

interface PlaceResult {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  editorialSummary?: { text: string }
  types?: string[]
  photos?: unknown[]
}

interface InsertedCafe {
  name: string
  city: string
  google_place_id: string
  rating: number | null
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

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const inserted: InsertedCafe[] = []
  const errors: string[] = []

  for (const city of CITIES) {
    console.log(`[discover-cafes] Processing city: ${city}`)

    // Fetch existing google_place_ids for this city
    const { data: existing, error: fetchError } = await supabase
      .from('cafes')
      .select('google_place_id')
      .not('google_place_id', 'is', null)

    if (fetchError) {
      console.error(`[discover-cafes] Failed to fetch existing cafes: ${fetchError.message}`)
      errors.push(`${city}: fetch error — ${fetchError.message}`)
      continue
    }

    const existingIds = new Set(
      (existing ?? []).map((r: { google_place_id: string }) => r.google_place_id)
    )

    // Call Google Places Text Search API (New)
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
          textQuery: `cafe in ${city}`,
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
      console.log(`[discover-cafes] ${city}: got ${places.length} results from Places API`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[discover-cafes] Places API error for ${city}: ${msg}`)
      errors.push(`${city}: Places API error — ${msg}`)
      continue
    }

    // Filter out already-known places
    const newPlaces = places.filter((p) => p.id && !existingIds.has(p.id))
    console.log(`[discover-cafes] ${city}: ${newPlaces.length} new places after dedup`)

    const toInsert = newPlaces.slice(0, MAX_NEW_PER_CITY)

    for (const place of toInsert) {
      const name = place.displayName?.text ?? 'Unknown Cafe'
      const slug = await getUniqueSlug(supabase, name, city)

      const row = {
        name,
        full_address: place.formattedAddress ?? '',
        city,
        slug_name: slug,
        google_place_id: place.id,
        rating: place.rating ?? null,
        reviews: place.userRatingCount ?? null,
        description: place.editorialSummary?.text ?? '',
        working_hours: place.regularOpeningHours?.weekdayDescriptions?.join('\n') ?? '',
        source: 'auto-discovered',
        is_published: false,
      }

      const { error: insertError } = await supabase.from('cafes').insert(row)

      if (insertError) {
        console.error(`[discover-cafes] Insert failed for "${name}": ${insertError.message}`)
        errors.push(`${city}/${name}: insert error — ${insertError.message}`)
      } else {
        console.log(`[discover-cafes] Inserted: "${name}" (${city}) slug="${slug}"`)
        inserted.push({
          name,
          city,
          google_place_id: place.id,
          rating: place.rating ?? null,
        })
      }
    }
  }

  const body = {
    success: errors.length === 0,
    inserted_count: inserted.length,
    cafes: inserted,
    errors: errors.length > 0 ? errors : undefined,
  }

  console.log(`[discover-cafes] Done. Inserted ${inserted.length} cafe(s).`)

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
