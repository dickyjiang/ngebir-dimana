/**
 * schema.org helpers for bar detail pages.
 * Converts the free-form `working_hours` column into valid OpeningHoursSpecification.
 */

const DAY_MAP: Record<string, string> = {
  senin: 'Monday', monday: 'Monday', mon: 'Monday',
  selasa: 'Tuesday', tuesday: 'Tuesday', tue: 'Tuesday',
  rabu: 'Wednesday', wednesday: 'Wednesday', wed: 'Wednesday',
  kamis: 'Thursday', thursday: 'Thursday', thu: 'Thursday',
  jumat: 'Friday', "jum'at": 'Friday', friday: 'Friday', fri: 'Friday',
  sabtu: 'Saturday', saturday: 'Saturday', sat: 'Saturday',
  minggu: 'Sunday', sunday: 'Sunday', sun: 'Sunday',
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// "17.00–01.00", "17:00 - 01:00", "8am-10pm", "11.00–14.00, 17.00–22.00"
const RANGE_RE =
  /(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)?\s*(?:–|—|-|to|sampai|s\/d)\s*(\d{1,2})(?:[.:](\d{2}))?\s*(am|pm)?/gi

function toHHMM(hour: string, minute: string | undefined, meridiem: string | undefined): string | null {
  let h = Number(hour)
  const m = minute === undefined ? 0 : Number(minute)
  if (!Number.isFinite(h) || !Number.isFinite(m) || m > 59) return null
  const mer = meridiem?.toLowerCase()
  if (mer === 'pm' && h < 12) h += 12
  if (mer === 'am' && h === 12) h = 0
  if (h === 24) h = 0
  if (h > 23) return null
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseDayHours(value: string): Array<{ opens: string; closes: string }> {
  const text = value.trim()
  if (!text) return []
  if (/^(tutup|closed|libur)/i.test(text)) return []
  if (/24\s*(jam|hours?|hrs?)/i.test(text)) return [{ opens: '00:00', closes: '23:59' }]

  const ranges: Array<{ opens: string; closes: string }> = []
  for (const match of text.matchAll(RANGE_RE)) {
    const opens = toHHMM(match[1], match[2], match[3])
    const closes = toHHMM(match[4], match[5], match[6])
    if (opens && closes) ranges.push({ opens, closes })
  }
  return ranges
}

function toEntries(raw: unknown): Array<[string, string]> {
  if (!raw) return []
  if (typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')])
  }
  const str = String(raw).trim()
  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object') return toEntries(parsed)
  } catch {
    /* not JSON: fall through to plain text */
  }
  // Plain text: "Senin: 08.00–22.00" per line
  const entries: Array<[string, string]> = []
  for (const line of str.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx > -1) entries.push([line.slice(0, idx), line.slice(idx + 1)])
  }
  return entries
}

/**
 * Returns schema.org OpeningHoursSpecification objects. Days with identical hours
 * are grouped into one entry. Days that cannot be parsed are skipped (never guessed).
 */
export function buildOpeningHoursSpecification(raw: unknown) {
  const byHours = new Map<string, { opens: string; closes: string; days: Set<string> }>()

  for (const [dayLabel, value] of toEntries(raw)) {
    const day = DAY_MAP[dayLabel.trim().toLowerCase()]
    if (!day) continue
    for (const { opens, closes } of parseDayHours(value)) {
      const key = `${opens}-${closes}`
      const entry = byHours.get(key) ?? { opens, closes, days: new Set<string>() }
      entry.days.add(day)
      byHours.set(key, entry)
    }
  }

  return [...byHours.values()].map(({ opens, closes, days }) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: DAY_ORDER.filter((d) => days.has(d)),
    opens,
    closes,
  }))
}
