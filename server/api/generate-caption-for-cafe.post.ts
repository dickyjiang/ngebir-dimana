import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const { cafe_id } = await readBody<{ cafe_id: number }>(event)
  if (!cafe_id) throw createError({ statusCode: 400, message: 'cafe_id required' })

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url
  const supabaseServiceKey = config.supabaseServiceKey
  const anthropicKey = config.anthropicApiKey

  const sbHeaders = {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
  }

  // Fetch the specific cafe
  const fields = 'id,name,slug_name,city,borough,description,business_type,photo,working_hours,rating,reviews'
  const cafeRes = await fetch(
    `${supabaseUrl}/rest/v1/cafes?select=${fields}&id=eq.${cafe_id}&is_published=eq.true&limit=1`,
    { headers: sbHeaders }
  )
  const cafes: any[] = await cafeRes.json()
  if (!cafes?.length) throw createError({ statusCode: 404, message: 'Cafe not found' })

  const cafe = cafes[0]

  // Build prompt
  const tags: string[] = Array.isArray(cafe.business_type) ? cafe.business_type : []
  let hours = ''
  try {
    const wh = typeof cafe.working_hours === 'string'
      ? JSON.parse(cafe.working_hours) : cafe.working_hours
    if (wh) hours = Object.entries(wh).map(([d, h]) => `${d}: ${h}`).join(', ')
  } catch {}

  const prompt = `Kamu adalah content creator Instagram untuk @ngebirdimana, direktori bar Indonesia. Buat caption IG casual, friendly, Bahasa Indonesia (boleh mix sedikit Inggris yang natural).

Data bar:
- Nama: ${cafe.name}
- Kota: ${cafe.city || 'Indonesia'}
- Area: ${cafe.borough || ''}
- Tipe: ${tags.join(', ') || 'bar'}
- Deskripsi: ${cafe.description || '-'}
- Jam buka: ${hours || '-'}
- Rating: ${cafe.rating || '-'} (${cafe.reviews || 0} ulasan)

Struktur caption:
1. Hook menarik (1-2 kalimat)
2. Deskripsi mengundang highlight tipe/keunikan bar (2-3 kalimat)
3. Info praktis singkat (lokasi, jam)
4. CTA: "Cari info lengkap di ngebir.di-mana.com"

Lalu tulis persis: HASHTAGS: [15-20 hashtag relevan, mix populer + niche, sesuai kota dan tipe bar]

Output HANYA caption + HASHTAGS. Tidak ada label, intro, atau penjelasan lain.`

  // Call Claude
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const claudeData = await claudeRes.json()
  const text: string = claudeData.content?.find((b: any) => b.type === 'text')?.text || ''

  const idx = text.indexOf('HASHTAGS:')
  const caption = (idx > -1 ? text.slice(0, idx) : text).trim()
  const hashtags = idx > -1 ? text.slice(idx + 9).trim() : ''

  const imageUrl = cafe.photo
    || `https://storage.di-mana.com/${cafe.slug_name}/${cafe.slug_name}.jpg`

  // Insert into ig_queue
  const insertRes = await fetch(`${supabaseUrl}/rest/v1/ig_queue`, {
    method: 'POST',
    headers: { ...sbHeaders, Prefer: 'return=representation' },
    body: JSON.stringify({
      cafe_id: cafe.id,
      cafe_name: cafe.name,
      city: cafe.city,
      image_url: imageUrl,
      caption,
      hashtags,
      status: 'pending',
    }),
  })

  if (!insertRes.ok) {
    const err = await insertRes.text()
    throw createError({ statusCode: 500, message: `Failed to insert: ${err}` })
  }

  return { result: 'ok', cafe: cafe.name }
})
