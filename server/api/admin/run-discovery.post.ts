export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.supabaseUrl || process.env.SUPABASE_URL!
  const serviceKey = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY!

  const res = await fetch(
    `${supabaseUrl}/functions/v1/discover-cafes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw createError({ statusCode: res.status, message: text })
  }

  return res.json()
})
