// server/api/ig-generate.post.ts
// Called by Cloudflare Cron Worker every day at 08:00 WIB
// Protected by a secret token to prevent unauthorized access

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Simple auth — Cloudflare Worker sends this header
  const token = getHeader(event, 'x-cron-secret')
  if (token !== config.cronSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const supabaseUrl = config.public.supabase.url
  const supabaseServiceKey = config.supabaseServiceKey
  console.log('[ig-generate] supabaseUrl:', supabaseUrl)
  console.log('[ig-generate] serviceKey exists:', !!supabaseServiceKey)
  const anthropicKey = config.anthropicApiKey

  const sbHeaders = {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    'Content-Type': 'application/json',
  }

  // 1. Get cafe IDs already in queue (exclude skipped)
  const queuedRes = await fetch(
    `${supabaseUrl}/rest/v1/ig_queue?select=cafe_id&status=neq.skipped`,
    { headers: sbHeaders }
  )
  console.log('[ig] queuedRes status:', queuedRes.status)
  console.log('[ig] queued raw:', JSON.stringify(await queuedRes.clone().json()))
  const queued: { cafe_id: number }[] = await queuedRes.json()
  const queuedIds = queued.map(q => q.cafe_id)

  // 2. Fetch a random published cafe not yet in queue
  const fields = 'id,name,slug_name,city,borough,description,business_type,photo,working_hours,rating,reviews'
  let cafeUrl = `${supabaseUrl}/rest/v1/cafes?select=${fields}&is_published=eq.true&limit=500`
  if (queuedIds.length > 0) {
    cafeUrl += `&id=not.in.(${queuedIds.join(',')})`
  }

  const cafeRes = await fetch(cafeUrl, { headers: sbHeaders })
  const allCafes: any[] = await cafeRes.json()
  // Pick random one server-side since Supabase REST doesn't support order=random()
  const cafes = allCafes.length > 0
    ? [allCafes[Math.floor(Math.random() * allCafes.length)]]
    : []
  console.log('[ig] cafeUrl:', cafeUrl)
  console.log('[ig] cafes:', JSON.stringify(cafes))
  console.log('[ig] queuedIds:', queuedIds)

  if (!cafes || cafes.length === 0) {
    return { result: 'no_cafes', message: 'Semua bar sudah pernah diqueue. Reset skipped entries jika perlu.' }
  }

  const cafe = cafes[0]

  // 3. Build prompt
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
4. CTA: "Cari info lengkap di ngebir-dimana.com 🔗"

Lalu tulis persis: HASHTAGS: [15-20 hashtag relevan, mix populer + niche, sesuai kota dan tipe bar]

Output HANYA caption + HASHTAGS. Tidak ada label, intro, atau penjelasan lain.`

  // 4. Call Claude API (Haiku — cheap, fast, good enough for captions)
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

  // 5. Image URL
  const imageUrl = cafe.photo
    || `https://storage.di-mana.com/${cafe.slug_name}/${cafe.slug_name}.jpg`

  // 6. Insert into ig_queue
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

  return { result: 'ok', cafe: cafe.name, city: cafe.city }
})
