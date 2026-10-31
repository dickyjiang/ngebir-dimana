/**
 * SEO helpers for bar detail pages.
 * Builds meta descriptions from real data only (no invented facts).
 */

export function stripHtml(input: string | null | undefined): string {
  if (!input) return ''
  return String(input)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Descriptions in the database are Markdown (e.g. "# Name\n\nBody..."), so strip
 * Markdown as well as HTML. Heading lines are dropped (they usually repeat the
 * bar name; the name is re-added by buildBarMetaDescription when needed).
 */
export function stripMarkdown(input: string | null | undefined): string {
  if (!input) return ''
  const lines = String(input)
    .split(/\r?\n/)
    .filter((line) => !/^\s{0,3}#{1,6}\s/.test(line)) // drop heading lines
    .map((line) => {
      const isListItem = /^\s*(?:[-*+]|\d+[.)])\s+/.test(line)
      const cleaned = line
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '') // list markers
        .replace(/^\s*>\s?/, '') // blockquote
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
        .replace(/(\*|_)(.*?)\1/g, '$2') // italics
        .replace(/`([^`]*)`/g, '$1') // inline code
        .trim()
      // Keep list items readable once lines are joined into one sentence run
      return isListItem && cleaned && !/[.!?]$/.test(cleaned) ? `${cleaned}.` : cleaned
    })
  return stripHtml(lines.join(' '))
}

export function truncateAtBoundary(text: string, max = 155): string {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  // Prefer ending on a sentence boundary if it leaves a reasonably long snippet
  const sentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
  if (sentenceEnd >= 80) return slice.slice(0, sentenceEnd + 1)
  const lastSpace = slice.lastIndexOf(' ')
  return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(/[,;:\-–]+$/, '') + '…'
}

interface BarSeoInput {
  name?: string | null
  city?: string | null
  street?: string | null
  business_type?: string | null
  rating?: number | string | null
  description?: string | null
}

export function buildBarMetaDescription(
  bar: BarSeoInput,
  featureNames: string[] = [],
  max = 155,
): string {
  // 1) Prefer the real, per-bar description when it is substantial
  const description = stripMarkdown(bar.description)
  if (description.length >= 60) {
    const mentionsName = bar.name && description.toLowerCase().includes(String(bar.name).toLowerCase())
    const text = mentionsName || !bar.name ? description : `${bar.name}: ${description}`
    return truncateAtBoundary(text, max)
  }

  // 2) Otherwise compose from the fields that actually exist
  const type = (bar.business_type || 'bar').toLowerCase()
  const parts: string[] = []

  let intro = `${bar.name} adalah ${type}`
  if (bar.city) intro += ` di ${bar.city}`
  if (bar.street) intro += ` (${stripHtml(bar.street)})`
  parts.push(intro + '.')

  const rating = Number(bar.rating)
  if (Number.isFinite(rating) && rating > 0) parts.push(`Rating ${rating}.`)

  const features = featureNames.map(stripHtml).filter(Boolean).slice(0, 3)
  if (features.length) parts.push(`${features.join(', ')}.`)

  let text = parts.join(' ')
  if (text.length < 110) text += ' Lihat lokasi dan info lengkap di Ngebir Dimana?'
  return truncateAtBoundary(text, max)
}
