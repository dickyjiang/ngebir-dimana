import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(nuxtApp => {
  const supabaseUrl = 'https://iblcxviqmqiutjzxnblx.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibGN4dmlxbXFpdXRqenhuYmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDI0MzMsImV4cCI6MjA1NDgxODQzM30._f73-K4lEoe3WmvDQcuXLZPzoPNafhSjQXdsbV4sNbU'
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  nuxtApp.provide('supabase', supabase)
})
