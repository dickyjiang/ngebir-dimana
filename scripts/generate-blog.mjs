/**
 * NDM Blog Generator
 * Generates SEO/AEO articles for ngopi.di-mana.com using Anthropic + Supabase.
 *
 * Required GitHub Secrets (Settings → Secrets → Actions):
 *   ANTHROPIC_API_KEY         — Anthropic API key
 *   SUPABASE_URL              — https://iblcxviqmqiutjzxnblx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — NDM Supabase service role key (from project settings)
 *   GMAIL_USER                — Gmail address for notifications
 *   GMAIL_APP_PASSWORD        — Gmail App Password (16-char, not your login password)
 *
 * Optional:
 *   DRY_RUN=true              — Skip API calls, use dummy content
 */

import { readFileSync, writeFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const QUEUE_PATH = join(__dirname, '..', 'blog-queue.json')

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const DRY_RUN = process.env.DRY_RUN === 'true'

const SITE_URL = 'https://ngopi.di-mana.com'
const ADMIN_REVIEW_URL = `${SITE_URL}/admin/review`
const MIN_WORD_COUNT = 800

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
}

function wordCount(html) {
  return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function currentYear() {
  return new Date().getFullYear()
}

/** 70% word overlap similarity check */
function isTooSimilar(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/))
  const wordsB = new Set(b.toLowerCase().split(/\s+/))
  const intersection = [...wordsA].filter(w => wordsB.has(w)).length
  const union = new Set([...wordsA, ...wordsB]).size
  return intersection / union >= 0.7
}

function parseDelimitedOutput(raw) {
  const extract = (tag, text) => {
    const re = new RegExp(`%%${tag}%%\\s*([\\s\\S]*?)(?=%%[A-Z_]+%%|$)`)
    const m = text.match(re)
    return m ? m[1].trim() : ''
  }
  return {
    title: extract('TITLE', raw),
    description: extract('DESCRIPTION', raw),
    meta_desc: extract('META_DESC', raw),
    category: extract('CATEGORY', raw),
    cover_image_url: extract('COVER_IMAGE_URL', raw),
    content: extract('CONTENT', raw).replace(/%%END%%.*$/s, '').trim(),
  }
}

// ─── Step 1: Queue Management ─────────────────────────────────────────────────

function readQueue() {
  return JSON.parse(readFileSync(QUEUE_PATH, 'utf8'))
}

function writeQueue(queue) {
  writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n')
}

async function refillCategory(category, anthropic) {
  console.log(`  Refilling "${category}" queue via Anthropic…`)
  if (DRY_RUN) {
    return Array.from({ length: 10 }, (_, i) => `${category} dummy keyword ${i + 1}`)
  }
  const prompt =
    category === 'cafe'
      ? 'Generate 10 unique Indonesian-language SEO keyword phrases for a cafe directory website (ngopi.di-mana.com) about cafes in Bandung. Focus on: WFC cafes, pet-friendly cafes, outdoor cafes, rooftop cafes, cafes for meetings, instagrammable cafes, cheap cafes near campus, breakfast cafes, live music cafes, cafe recommendations. Return ONLY a JSON array of strings, no explanation.'
      : 'Generate 10 unique Indonesian-language SEO/AEO keyword phrases for a cafe directory website about coffee knowledge and education. Focus on: specialty coffee, pour over, cold brew, single origin, coffee fermentation, Indonesian coffee regions, coffee brewing guides, FAQ-style questions starting with "apa itu" or "cara". Return ONLY a JSON array of strings, no explanation.'

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })
  const raw = msg.content[0].text.trim()
  try {
    const arr = JSON.parse(raw.replace(/^```json\n?/, '').replace(/\n?```$/, ''))
    if (Array.isArray(arr)) return arr.slice(0, 10)
  } catch {}
  // fallback: extract quoted strings
  return [...raw.matchAll(/"([^"]+)"/g)].map(m => m[1]).slice(0, 10)
}

async function pickKeyword(queue, anthropic) {
  // Alternate categories
  const nextCategory = queue.lastCategory === 'cafe' ? 'kopi' : 'cafe'
  let category = nextCategory
  let arr = queue[category]

  // Auto-refill if empty
  if (!arr || arr.length === 0) {
    queue[category] = await refillCategory(category, anthropic)
    arr = queue[category]
  }

  // If still empty (e.g. DRY_RUN dummy), try the other category
  if (!arr || arr.length === 0) {
    category = category === 'cafe' ? 'kopi' : 'cafe'
    arr = queue[category]
    if (!arr || arr.length === 0) throw new Error('Both queue categories are empty')
  }

  const keyword = arr.shift()
  queue.lastCategory = category
  return { keyword, category }
}

// ─── Step 2: Dedup Check ──────────────────────────────────────────────────────

async function isDuplicate(keyword, supabase) {
  const { data, error } = await supabase
    .from('blogs')
    .select('title')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.warn('  Dedup query failed:', error.message)
    return false
  }

  for (const row of data || []) {
    if (isTooSimilar(keyword, row.title)) {
      console.log(`  Skipping "${keyword}" — too similar to existing: "${row.title}"`)
      return true
    }
  }
  return false
}

// ─── Step 3: Query Relevant Cafes for Backlinks ───────────────────────────────

async function getRelevantCafes(keyword, supabase) {
  const kw = keyword.toLowerCase()

  // Determine feature slug to filter by
  let featureSlug = null
  if (kw.includes('wfc') || kw.includes('work from')) featureSlug = 'wfc'
  else if (kw.includes('pet') || kw.includes('anjing') || kw.includes('kucing')) featureSlug = 'pet'
  else if (kw.includes('outdoor')) featureSlug = 'outdoor'

  // Keyword-based about/subtype filter (no feature table needed)
  let aboutFilter = null
  if (kw.includes('roastery')) aboutFilter = 'roastery'
  else if (kw.includes('specialty')) aboutFilter = 'specialty'

  let cafeIds = null

  if (featureSlug) {
    // Step 3a: resolve feature IDs
    const { data: featureData } = await supabase
      .from('features')
      .select('id')
      .ilike('feature_slug', `%${featureSlug}%`)

    if (featureData && featureData.length > 0) {
      const featureIds = featureData.map(f => f.id)

      // Step 3b: get cafe IDs that have those features
      const { data: cfData } = await supabase
        .from('cafe_features')
        .select('cafe_id')
        .in('feature_id', featureIds)

      if (cfData && cfData.length > 0) {
        cafeIds = [...new Set(cfData.map(cf => cf.cafe_id))]
      }
    }
  }

  // Base cafe query — use neq(false) to include rows where is_published is null
  const baseQuery = () =>
    supabase
      .from('cafes')
      .select('name, slug_name, borough, city, rating_num, about, photo')
      .ilike('city', '%bandung%')
      .neq('is_published', false)
      .order('rating_num', { ascending: false })
      .limit(8)

  let q = baseQuery()

  if (cafeIds && cafeIds.length > 0) {
    q = q.in('id', cafeIds)
  } else if (aboutFilter) {
    q = q.ilike('subtypes', `%${aboutFilter}%`)
  }

  let { data, error } = await q

  // Fallback: if filtered query returned nothing, just grab top cafes by rating
  if ((!data || data.length === 0) && (cafeIds || aboutFilter)) {
    console.log('  Filtered query returned 0 cafes — falling back to top rated')
    ;({ data, error } = await baseQuery())
  }

  if (error) {
    console.warn('  Cafe query failed:', error.message)
    return []
  }

  return (data || []).map(c => ({
    name: c.name || '',
    slug: c.slug_name || '',
    location_area: c.borough || c.city || '',
    rating: c.rating_num || 0,
    about: typeof c.about === 'string' ? c.about : (c.about ? JSON.stringify(c.about) : ''),
    photo: c.photo || '',
  }))
}

// ─── Step 4: Generate Article via Anthropic ───────────────────────────────────

function buildSystemPrompt() {
  return `Hari ini adalah ${today()}. Tahun saat ini adalah ${currentYear()}.
Kamu adalah penulis konten SEO dan AEO (Answer Engine Optimization) ahli untuk ngopi.di-mana.com — direktori cafe terlengkap di Indonesia.

Tulis artikel dalam Bahasa Indonesia yang praktis dan berguna untuk pencari cafe di Indonesia.

Setiap artikel harus:
- Minimum 1000 kata
- HTML formatting: <h2>, <h3>, <p>, <ul>, <strong>
- Sertakan minimal 1 FAQ section dengan format <h2>FAQ</h2> dan <h3>pertanyaan</h3><p>jawaban</p> untuk AEO optimization
- Sertakan backlink ke cafe relevan dari data yang diberikan, format: <a href="${SITE_URL}/cafe/[slug]">[name]</a>
- Sertakan CTA box di tengah dan akhir artikel:
  <div class="cta-box"><strong>[ajakan]</strong><br><a href="${SITE_URL}/cafes?[filter]">Temukan Cafe di Direktori →</a></div>
- JANGAN sertakan <html>, <head>, <body>, <style>
- Mulai langsung dengan konten

Format output pakai delimiter (BUKAN JSON):
%%TITLE%%
[SEO title max 60 karakter]
%%DESCRIPTION%%
[1-2 kalimat ringkasan]
%%META_DESC%%
[SEO meta description max 155 karakter]
%%CATEGORY%%
[Tips atau Kopi]
%%COVER_IMAGE_URL%%
[URL foto dari kolom photo salah satu cafe yang paling relevan dari data yang diberikan]
%%CONTENT%%
[full HTML article]
%%END%%`
}

function buildUserPrompt(keyword, cafes) {
  const cafeContext =
    cafes.length > 0
      ? `\n\nData cafe relevan untuk backlink:\n${cafes
          .map(
            c =>
              `- ${c.name} | slug: ${c.slug} | area: ${c.location_area} | rating: ${c.rating} | foto: ${c.photo}\n  tentang: ${c.about.slice(0, 200)}`
          )
          .join('\n')}`
      : '\n\n(Tidak ada data cafe spesifik — gunakan referensi umum ke direktori)'

  return `Tulis artikel SEO/AEO lengkap untuk keyword: "${keyword}"${cafeContext}

Pastikan:
1. Artikel sangat berguna dan informatif untuk pembaca yang mencari ${keyword}
2. Sertakan semua backlink cafe di atas dengan format yang benar
3. Gunakan foto cafe (kolom photo) yang paling relevan untuk %%COVER_IMAGE_URL%%
4. Tambahkan FAQ section yang menjawab pertanyaan umum tentang topik ini`
}

async function generateArticle(keyword, cafes, anthropic) {
  if (DRY_RUN) {
    console.log('  [DRY RUN] Skipping Anthropic API call')
    const dummyTitle = `Panduan ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`
    return {
      title: dummyTitle,
      description: `Panduan lengkap tentang ${keyword} di Bandung untuk tahun ${currentYear()}.`,
      meta_desc: `Temukan informasi terlengkap tentang ${keyword}. Panduan praktis untuk coffee lovers di Indonesia.`,
      category: 'Tips',
      cover_image_url: cafes[0]?.photo || '',
      content: `<h2>Panduan ${keyword}</h2><p>${'Lorem ipsum '.repeat(100)}</p><h2>FAQ</h2><h3>Apa itu ${keyword}?</h3><p>Jawaban dummy.</p><div class="cta-box"><strong>Temukan cafe terbaik!</strong><br><a href="${SITE_URL}/cafes">Temukan Cafe di Direktori →</a></div>`,
    }
  }

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: buildUserPrompt(keyword, cafes) }],
  })

  const article = parseDelimitedOutput(msg.content[0].text)

  // If model didn't inject backlinks, append a cafe recommendation section
  if (cafes.length > 0 && !article.content.includes(`${SITE_URL}/cafe/`)) {
    console.log('  Model skipped backlinks — injecting cafe section programmatically')
    const cafeLinks = cafes
      .filter(c => c.slug)
      .map(c => `<li><a href="${SITE_URL}/cafe/${c.slug}">${c.name}</a> — ${c.location_area}${c.rating ? ` (⭐ ${c.rating})` : ''}</li>`)
      .join('\n')

    const cafeSection = `
<h2>Rekomendasi Cafe di Bandung</h2>
<p>Ingin mencicipi specialty coffee langsung di cafe terbaik Bandung? Berikut beberapa pilihan yang bisa kamu kunjungi:</p>
<ul>
${cafeLinks}
</ul>
<div class="cta-box"><strong>Temukan lebih banyak cafe specialty di Bandung!</strong><br><a href="${SITE_URL}/cafes?city=bandung">Lihat Semua Cafe di Direktori →</a></div>`

    article.content = article.content + cafeSection
  }

  return article
}

// ─── Step 5: Quality Checks ───────────────────────────────────────────────────

function qualityCheck(article, keyword) {
  const errors = []
  const wc = wordCount(article.content)

  if (wc < MIN_WORD_COUNT) errors.push(`Word count too low: ${wc} (min ${MIN_WORD_COUNT})`)

  const kwLower = keyword.toLowerCase()
  const contentLower = article.content.toLowerCase()
  const kwOccurrences = (contentLower.match(new RegExp(kwLower.split(' ')[0], 'g')) || []).length
  if (kwOccurrences < 3) errors.push(`Keyword "${kwLower.split(' ')[0]}" appears only ${kwOccurrences}× (min 3)`)

  if (!article.content.includes(`${SITE_URL}/cafe/`)) {
    errors.push('Missing backlink to /cafe/')
  }

  if (!article.content.includes('cta-box')) {
    errors.push('Missing cta-box element')
  }

  return { wc, errors }
}

// ─── Step 6: Save to Supabase ─────────────────────────────────────────────────

async function saveDraft(article, keyword, supabase) {
  if (DRY_RUN) {
    console.log('  [DRY RUN] Skipping Supabase insert')
    return { id: 'dry-run-id' }
  }

  const baseSlug = slugify(article.title)
  const slug = `${baseSlug}-${Date.now()}`

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      title: article.title,
      slug,
      description: article.description,
      content: article.content,
      cover_image_url: article.cover_image_url || null,
      category: article.category || 'Tips',
      published_at: today(),
      is_published: false,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Supabase insert failed: ${error.message}`)
  return data
}

// ─── Step 7: Email Notification ───────────────────────────────────────────────

async function sendEmail({ title, keyword, wc, draftId, queueWarning, cafes }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log('  Email skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set')
    return
  }
  if (DRY_RUN) {
    console.log('  [DRY RUN] Skipping email notification')
    return
  }

  const cafeList =
    cafes.length > 0
      ? cafes.map(c => `  • ${c.name} (${c.location_area}) — ${SITE_URL}/cafe/${c.slug}`).join('\n')
      : '  (none)'

  const imagePrompt = `Buat gambar foto-realistis untuk artikel "${title}":
- Suasana: cafe modern di Bandung, Indonesia
- Gaya: editorial food photography, cinematic lighting
- Elemen: minuman kopi specialty, interior cafe estetik
- Rasio: 16:9 landscape
- Platform: Freepik AI Image Generator atau Midjourney`

  const body = `
📝 Draft artikel NDM baru siap review

Judul   : ${title}
Keyword : ${keyword}
Jumlah kata : ${wc}
ID Draft    : ${draftId}

🔍 Review di:
${ADMIN_REVIEW_URL}

${queueWarning ? `⚠️  PERHATIAN: Sisa keyword di queue < 5. Tambahkan keyword baru segera.\n` : ''}

🔗 Cafe yang di-backlink:
${cafeList}

🎨 Image Generation Prompt:
${imagePrompt}

📡 Setelah approve & publish:
1. Upload cover image dari Freepik/Midjourney ke Supabase Storage
2. Update cover_image_url di Supabase dashboard
3. Ping Google Search Console: https://search.google.com/search-console → URL Inspection → Request Indexing

---
NDM Blog Generator · ${today()}
`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from: GMAIL_USER,
    to: GMAIL_USER,
    subject: `📝 Draft artikel NDM siap review: ${title}`,
    text: body,
  })

  console.log(`  Email sent to ${GMAIL_USER}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 NDM Blog Generator — ${today()}${DRY_RUN ? ' [DRY RUN]' : ''}`)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  if (!ANTHROPIC_API_KEY && !DRY_RUN) throw new Error('Missing ANTHROPIC_API_KEY')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const anthropic = DRY_RUN ? null : new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  // Step 1 — Read queue
  console.log('\n[1/7] Reading queue…')
  const queue = readQueue()
  const { keyword, category } = await pickKeyword(queue, anthropic)
  console.log(`  Keyword: "${keyword}" (${category})`)

  const cafeRemaining = (queue.cafe || []).length
  const kopiRemaining = (queue.kopi || []).length
  const totalRemaining = cafeRemaining + kopiRemaining
  const queueWarning = totalRemaining < 5
  console.log(`  Queue remaining: cafe=${cafeRemaining}, kopi=${kopiRemaining}`)

  // Step 2 — Dedup check
  console.log('\n[2/7] Checking for duplicates…')
  if (!DRY_RUN && (await isDuplicate(keyword, supabase))) {
    console.log('  Duplicate found — aborting. Saving queue.')
    writeQueue(queue)
    process.exit(0)
  }
  console.log('  No duplicate found.')

  // Step 3 — Query relevant cafes
  console.log('\n[3/7] Querying relevant cafes for backlinks…')
  const cafes = DRY_RUN ? [] : await getRelevantCafes(keyword, supabase)
  console.log(`  Found ${cafes.length} cafes`)
  if (cafes.length > 0) {
    cafes.forEach(c => console.log(`    • ${c.name} (${c.location_area})`))
  }

  // Step 4 — Generate article
  console.log('\n[4/7] Generating article via Anthropic…')
  const article = await generateArticle(keyword, cafes, anthropic)
  console.log(`  Title: "${article.title}"`)

  // Step 5 — Quality checks
  console.log('\n[5/7] Running quality checks…')
  const { wc, errors } = qualityCheck(article, keyword)
  console.log(`  Word count: ${wc}`)
  if (errors.length > 0) {
    console.warn('  Quality issues:')
    errors.forEach(e => console.warn(`    ⚠  ${e}`))
    if (!DRY_RUN) {
      console.warn('  Saving queue and aborting due to quality check failure.')
      writeQueue(queue)
      process.exit(1)
    }
    console.warn('  [DRY RUN] Continuing despite quality issues.')
  } else {
    console.log('  All checks passed.')
  }

  // Step 6 — Save to Supabase
  console.log('\n[6/7] Saving draft to Supabase…')
  const draft = await saveDraft(article, keyword, supabase)
  console.log(`  Draft saved. ID: ${draft.id}`)

  // Step 7 — Email notification
  console.log('\n[7/7] Sending email notification…')
  await sendEmail({ title: article.title, keyword, wc, draftId: draft.id, queueWarning, cafes })

  // Persist updated queue
  writeQueue(queue)
  console.log('\n✅ Done. Queue saved.')
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
