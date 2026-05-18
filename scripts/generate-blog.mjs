/**
 * NDM Blog Generator
 * Generates SEO/AEO articles for ngebir.di-mana.com using Anthropic + Supabase.
 *
 * Required GitHub Secrets (Settings → Secrets → Actions):
 *   ANTHROPIC_API_KEY         — Anthropic API key
 *   SUPABASE_URL              — your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (from project settings)
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

const SITE_URL = 'https://ngebir.di-mana.com'
// FIX: updated to /bars/ to match Nuxt route structure
const BAR_PATH = '/bars/'
const ADMIN_REVIEW_URL = `${SITE_URL}/admin/blog-review`
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

  // FIX: added city variety (Bandung, Jakarta, Bali) and bar-specific topics
  const prompt =
    category === 'bar'
      ? 'Generate 10 unique Indonesian-language SEO keyword phrases for a bar directory website (ngebir.di-mana.com) covering bars in Bandung, Jakarta, and Bali. Mix of cities. Focus on: rooftop bar, sports bar, craft beer bar, bar live musik, bar buat nongkrong, bar instagrammable, bar murah dekat kampus, bar dengan makanan enak, cocktail bar, rekomendasi bar terbaik. Return ONLY a JSON array of strings, no explanation.'
      : 'Generate 10 unique Indonesian-language SEO/AEO keyword phrases for a bar directory website about beer knowledge and education in Indonesia. Focus on: craft beer Indonesia, jenis bir IPA stout lager, cara bikin bir rumahan, merek bir Indonesia, panduan cicip bir, FAQ style starting with "apa itu" or "cara", bir terbaik di Bali, bir lokal vs impor. Return ONLY a JSON array of strings, no explanation.'

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
  const nextCategory = queue.lastCategory === 'bar' ? 'bir' : 'bar'
  let category = nextCategory
  let arr = queue[category]

  // Auto-refill if empty
  if (!arr || arr.length === 0) {
    queue[category] = await refillCategory(category, anthropic)
    arr = queue[category]
  }

  // If still empty (e.g. DRY_RUN dummy), try the other category
  if (!arr || arr.length === 0) {
    category = category === 'bar' ? 'bir' : 'bar'
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

// ─── Step 3: Query Relevant Bars for Backlinks ────────────────────────────────

async function getRelevantBars(keyword, supabase) {
  const kw = keyword.toLowerCase()

  // FIX: bar-specific feature detection (removed cafe-specific ones)
  let featureSlug = null
  if (kw.includes('rooftop')) featureSlug = 'rooftop'
  else if (kw.includes('live musik') || kw.includes('live music') || kw.includes('musik')) featureSlug = 'live_music'
  else if (kw.includes('sports') || kw.includes('nonton bola')) featureSlug = 'sports'
  else if (kw.includes('craft beer') || kw.includes('bir craft')) featureSlug = 'craft_beer'
  else if (kw.includes('outdoor')) featureSlug = 'outdoor'
  else if (kw.includes('cocktail')) featureSlug = 'cocktail'
  else if (kw.includes('karaoke')) featureSlug = 'karaoke'

  // Keyword-based subtype filter
  let aboutFilter = null
  if (kw.includes('sports bar')) aboutFilter = 'sports'
  else if (kw.includes('rooftop')) aboutFilter = 'rooftop'
  else if (kw.includes('jazz')) aboutFilter = 'jazz'

  // FIX: detect city from keyword to broaden coverage beyond Bandung only
  let cityFilter = '%bandung%'
  if (kw.includes('jakarta') || kw.includes('jkt')) cityFilter = '%jakarta%'
  else if (kw.includes('bali') || kw.includes('seminyak') || kw.includes('canggu') || kw.includes('ubud')) cityFilter = '%bali%'

  let barIds = null

  if (featureSlug) {
    // Step 3a: resolve feature IDs
    const { data: featureData } = await supabase
      .from('features')
      .select('id')
      .ilike('feature_slug', `%${featureSlug}%`)

    if (featureData && featureData.length > 0) {
      const featureIds = featureData.map(f => f.id)

      // Step 3b: get bar IDs that have those features
      const { data: cfData } = await supabase
        .from('cafe_features')
        .select('cafe_id')
        .in('feature_id', featureIds)

      if (cfData && cfData.length > 0) {
        barIds = [...new Set(cfData.map(cf => cf.cafe_id))]
      }
    }
  }

  // Base bar query
  const baseQuery = () =>
    supabase
      .from('cafes')
      .select('name, slug_name, borough, city, rating_num, about, photo')
      .ilike('city', cityFilter)
      .neq('is_published', false)
      .order('rating_num', { ascending: false })
      .limit(8)

  let q = baseQuery()

  if (barIds && barIds.length > 0) {
    q = q.in('id', barIds)
  } else if (aboutFilter) {
    q = q.ilike('subtypes', `%${aboutFilter}%`)
  }

  let { data, error } = await q

  // Fallback: if filtered query returned nothing, just grab top bars by rating
  if ((!data || data.length === 0) && (barIds || aboutFilter)) {
    console.log('  Filtered query returned 0 bars — falling back to top rated')
    ;({ data, error } = await baseQuery())
  }

  if (error) {
    console.warn('  Bar query failed:', error.message)
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
  // FIX: updated all copy — removed "coffee lovers", fixed CTA URLs to /bars
  return `Hari ini adalah ${today()}. Tahun saat ini adalah ${currentYear()}.
Kamu adalah penulis konten SEO dan AEO (Answer Engine Optimization) ahli untuk ngebir.di-mana.com — direktori bar dan tempat minum bir terlengkap di Indonesia.

Tulis artikel dalam Bahasa Indonesia yang praktis dan berguna untuk pencari bar di Indonesia.

Setiap artikel harus:
- Minimum 1000 kata
- HTML formatting: <h2>, <h3>, <p>, <ul>, <strong>
- Sertakan minimal 1 FAQ section dengan format <h2>FAQ</h2> dan <h3>pertanyaan</h3><p>jawaban</p> untuk AEO optimization
- Sertakan backlink ke bar relevan dari data yang diberikan, format: <a href="${SITE_URL}${BAR_PATH}[slug]" class="bar-backlink"><img src="[foto]" alt="[name]" class="bar-thumb" />[name]</a>
- Sertakan CTA box di tengah dan akhir artikel:
  <div class="cta-box"><strong>[ajakan]</strong><br><a href="${SITE_URL}/bars?[filter]">Temukan Bar di Direktori →</a></div>
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
[Tips atau Bir]
%%COVER_IMAGE_URL%%
[URL foto dari kolom photo salah satu bar yang paling relevan dari data yang diberikan]
%%CONTENT%%
[full HTML article]
%%END%%`
}

function buildUserPrompt(keyword, bars) {
  // FIX: renamed cafes → bars throughout
  const barContext =
    bars.length > 0
      ? `\n\nData bar relevan untuk backlink (gunakan link HTML persis seperti di bawah):\n${bars
          .map(
            c =>
              `- <a href="${SITE_URL}${BAR_PATH}${c.slug}">${c.name}</a> | area: ${c.location_area} | rating: ${c.rating} | foto: ${c.photo}\n  tentang: ${c.about.slice(0, 200)}`
          )
          .join('\n')}`
      : '\n\n(Tidak ada data bar spesifik — gunakan referensi umum ke direktori saja, tidak perlu backlink ke bar individual)'

  const backlinkInstruction = bars.length > 0
    ? `2. Sertakan semua backlink bar di atas — copy-paste tag <a> persis seperti yang diberikan\n3. Gunakan foto bar (kolom photo) yang paling relevan untuk %%COVER_IMAGE_URL%%`
    : '2. Tidak ada backlink bar — fokus pada konten informatif dan CTA ke direktori\n3. Gunakan URL gambar placeholder kosong untuk %%COVER_IMAGE_URL%%'

  return `Tulis artikel SEO/AEO lengkap untuk keyword: "${keyword}"${barContext}

Pastikan:
1. Artikel sangat berguna dan informatif untuk pembaca yang mencari ${keyword}
${backlinkInstruction}
4. Tambahkan FAQ section yang menjawab pertanyaan umum tentang topik ini`
}

async function generateArticle(keyword, bars, anthropic) {
  if (DRY_RUN) {
    console.log('  [DRY RUN] Skipping Anthropic API call')
    const dummyTitle = `Panduan ${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`
    return {
      title: dummyTitle,
      description: `Panduan lengkap tentang ${keyword} di Indonesia untuk tahun ${currentYear()}.`,
      meta_desc: `Temukan informasi terlengkap tentang ${keyword}. Panduan praktis untuk pecinta bir di Indonesia.`,
      category: 'Tips',
      cover_image_url: bars[0]?.photo || '',
      // FIX: DRY_RUN dummy uses /bars/ path and correct copy
      content: `<h2>Panduan ${keyword}</h2><p>${'Lorem ipsum '.repeat(100)}</p><h2>FAQ</h2><h3>Apa itu ${keyword}?</h3><p>Jawaban dummy.</p><div class="cta-box"><strong>Temukan bar terbaik!</strong><br><a href="${SITE_URL}/bars">Temukan Bar di Direktori →</a></div><a href="${SITE_URL}${BAR_PATH}dummy-slug" class="bar-backlink">Dummy Bar</a>`,
    }
  }

  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: buildUserPrompt(keyword, bars) }],
  })

  const article = parseDelimitedOutput(msg.content[0].text)

  // If model didn't inject backlinks, append a bar recommendation section
  if (bars.length > 0 && !article.content.includes(`${SITE_URL}${BAR_PATH}`)) {
    console.log('  Model skipped backlinks — injecting bar section programmatically')
    const barLinks = bars
      .filter(c => c.slug)
      .map(c => `<li><a href="${SITE_URL}${BAR_PATH}${c.slug}">${c.name}</a> — ${c.location_area}${c.rating ? ` (⭐ ${c.rating})` : ''}</li>`)
      .join('\n')

    const barSection = `
<h2>Rekomendasi Bar Terbaik</h2>
<p>Ingin langsung menemukan bar terbaik di kotamu? Berikut beberapa pilihan yang bisa kamu kunjungi:</p>
<ul>
${barLinks}
</ul>
<div class="cta-box"><strong>Temukan lebih banyak bar!</strong><br><a href="${SITE_URL}/bars">Lihat Semua Bar di Direktori →</a></div>`

    article.content = article.content + barSection
  }

  return article
}

// ─── Step 5: Quality Checks ───────────────────────────────────────────────────

function qualityCheck(article, keyword, hasBars) {
  const errors = []
  const warnings = []
  const wc = wordCount(article.content)

  if (wc < MIN_WORD_COUNT) errors.push(`Word count too low: ${wc} (min ${MIN_WORD_COUNT})`)

  const kwLower = keyword.toLowerCase()
  const contentLower = article.content.toLowerCase()
  // FIX: skip generic Indonesian stop words — check first meaningful word instead
  const stopWords = new Set(['tips', 'cara', 'apa', 'itu', 'di', 'dan', 'yang', 'untuk', 'tentang', 'panduan', 'rekomendasi', 'daftar', 'list'])
  const meaningfulWord = kwLower.split(' ').find(w => w.length > 3 && !stopWords.has(w)) || kwLower.split(' ')[0]
  const kwOccurrences = (contentLower.match(new RegExp(meaningfulWord, 'g')) || []).length
  if (kwOccurrences < 3) errors.push(`Keyword "${meaningfulWord}" appears only ${kwOccurrences}× (min 3)`)

  // FIX: missing backlinks is now always a WARNING, never a hard error.
  // The programmatic injection in generateArticle() already handles this case.
  if (!article.content.includes(`${SITE_URL}${BAR_PATH}`)) {
    if (hasBars) {
      warnings.push('Backlinks to /bars/ missing after generation — check programmatic injection')
    } else {
      warnings.push('No backlinks to /bars/ (no bar data was available — expected)')
    }
  }

  if (!article.content.includes('cta-box')) {
    errors.push('Missing cta-box element')
  }

  return { wc, errors, warnings }
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

async function sendEmail({ title, keyword, wc, draftId, queueWarning, bars }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.log('  Email skipped — GMAIL_USER or GMAIL_APP_PASSWORD not set')
    return
  }
  if (DRY_RUN) {
    console.log('  [DRY RUN] Skipping email notification')
    return
  }

  // FIX: email uses /bars/ path
  const barList =
    bars.length > 0
      ? bars.map(c => `  • ${c.name} (${c.location_area}) — ${SITE_URL}${BAR_PATH}${c.slug}`).join('\n')
      : '  (none)'

  const imagePrompt = `Buat gambar foto-realistis untuk artikel "${title}":
- Suasana: bar modern di Indonesia (Bandung / Jakarta / Bali)
- Gaya: editorial photography, cinematic lighting, warm amber tones
- Elemen: bir craft di meja bar, interior bar estetik, bokeh lights
- Rasio: 16:9 landscape
- Platform: Freepik AI Image Generator atau Midjourney`

  const body = `
📝 Draft artikel ngebir.di-mana baru siap review

Judul   : ${title}
Keyword : ${keyword}
Jumlah kata : ${wc}
ID Draft    : ${draftId}

🔍 Review di:
${ADMIN_REVIEW_URL}

${queueWarning ? `⚠️  PERHATIAN: Sisa keyword di queue < 5. Tambahkan keyword baru segera.\n` : ''}\
🔗 Bar yang di-backlink:
${barList}

🎨 Image Generation Prompt:
${imagePrompt}

📡 Setelah approve & publish:
1. Upload cover image dari Freepik/Midjourney ke Supabase Storage
2. Update cover_image_url di Supabase dashboard
3. Ping Google Search Console: https://search.google.com/search-console → URL Inspection → Request Indexing

---
ngebir-dimana Blog Generator · ${today()}
`

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  })

  await transporter.sendMail({
    from: GMAIL_USER,
    to: GMAIL_USER,
    subject: `📝 Draft artikel ngebir-dimana siap review: ${title}`,
    text: body,
  })

  console.log(`  Email sent to ${GMAIL_USER}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 ngebir-dimana Blog Generator — ${today()}${DRY_RUN ? ' [DRY RUN]' : ''}`)

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  if (!ANTHROPIC_API_KEY && !DRY_RUN) throw new Error('Missing ANTHROPIC_API_KEY')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const anthropic = DRY_RUN ? null : new Anthropic({ apiKey: ANTHROPIC_API_KEY })

  // Step 1 — Read queue
  console.log('\n[1/7] Reading queue…')
  const queue = readQueue()
  const { keyword, category } = await pickKeyword(queue, anthropic)
  console.log(`  Keyword: "${keyword}" (${category})`)

  const barRemaining = (queue.bar || []).length
  const birRemaining = (queue.bir || []).length
  const totalRemaining = barRemaining + birRemaining
  const queueWarning = totalRemaining < 5
  console.log(`  Queue remaining: bar=${barRemaining}, bir=${birRemaining}`)

  // Step 2 — Dedup check
  console.log('\n[2/7] Checking for duplicates…')
  if (!DRY_RUN && (await isDuplicate(keyword, supabase))) {
    console.log('  Duplicate found — aborting. Saving queue.')
    writeQueue(queue)
    process.exit(0)
  }
  console.log('  No duplicate found.')

  // Step 3 — Query relevant bars
  console.log('\n[3/7] Querying relevant bars for backlinks…')
  const bars = DRY_RUN ? [] : await getRelevantBars(keyword, supabase)
  console.log(`  Found ${bars.length} bars`)
  if (bars.length > 0) {
    bars.forEach(c => console.log(`    • ${c.name} (${c.location_area})`))
  } else {
    console.warn('  ⚠️ No bars found — article will use generic CTA instead of backlinks')
  }

  // Step 4 — Generate article
  console.log('\n[4/7] Generating article via Anthropic…')
  const article = await generateArticle(keyword, bars, anthropic)
  console.log(`  Title: "${article.title}"`)

  // Step 5 — Quality checks
  console.log('\n[5/7] Running quality checks…')
  const { wc, errors, warnings } = qualityCheck(article, keyword, bars.length > 0)
  console.log(`  Word count: ${wc}`)

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`    ⚠️  ${w}`))
  }

  if (errors.length > 0) {
    console.warn('  Quality issues found:')
    errors.forEach(e => console.warn(`    ✖  ${e}`))
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
  await sendEmail({ title: article.title, keyword, wc, draftId: draft.id, queueWarning, bars })

  // Persist updated queue
  writeQueue(queue)
  console.log('\n✅ Done. Queue saved.')
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message)
  process.exit(1)
})
