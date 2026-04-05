import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function generateDescription(
  anthropicKey: string,
  name: string,
  city: string,
  subtypes: string,
  rating: number | null,
  reviews: number | null
): Promise<string | null> {
  try {
    const typeLabels = (subtypes ?? '')
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => !['establishment', 'point_of_interest', 'food', 'cafe', 'coffee shop'].includes(t.toLowerCase()))
      .slice(0, 3)
      .join(', ')

    const prompt = [
      `Buatkan deskripsi singkat (2–3 kalimat) dalam Bahasa Indonesia yang menarik dan kasual untuk sebuah kafe bernama "${name}" yang berlokasi di ${city}.`,
      typeLabels ? `Tipe tempat: ${typeLabels}.` : '',
      rating ? `Rating: ${rating}/5 dari ${reviews?.toLocaleString() ?? '?'} ulasan.` : '',
      `Gaya penulisan: hangat, mengundang, seperti rekomendasi teman — bukan iklan. Jangan mulai dengan kata "Kafe ini". Tidak perlu menyebut nama kafe lagi di kalimat pertama.`,
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
      console.warn(`[backfill-descriptions] Anthropic API error: ${res.status}`)
      return null
    }

    const json = await res.json()
    return json.content?.[0]?.text?.trim() ?? null
  } catch (err) {
    console.warn(`[backfill-descriptions] generateDescription error: ${err instanceof Error ? err.message : err}`)
    return null
  }
}

Deno.serve(async (_req: Request): Promise<Response> => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY') ?? ''

  if (!anthropicKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch cafes with no description
  const { data: cafes, error } = await supabase
    .from('cafes')
    .select('id, name, city, subtypes, rating_num, reviews')
    .or('description.is.null,description.eq.')
    .not('name', 'is', null)
    .not('city', 'is', null)
    .limit(10)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log(`[backfill-descriptions] Found ${cafes.length} cafes to backfill`)

  const results = { updated: 0, failed: 0, skipped: 0 }

  for (const cafe of cafes) {
    if (!cafe.name || !cafe.city) {
      results.skipped++
      continue
    }

    const description = await generateDescription(
      anthropicKey,
      cafe.name,
      cafe.city,
      cafe.subtypes ?? '',
      cafe.rating_num,
      cafe.reviews
    )

    if (!description) {
      results.failed++
      continue
    }

    const { error: updateError } = await supabase
      .from('cafes')
      .update({ description })
      .eq('id', cafe.id)

    if (updateError) {
      console.warn(`[backfill-descriptions] Failed to update cafe ${cafe.id}: ${updateError.message}`)
      results.failed++
    } else {
      console.log(`[backfill-descriptions] Updated cafe ${cafe.id} (${cafe.name})`)
      results.updated++
    }
  }

  return new Response(JSON.stringify({ ...results, total: cafes.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
