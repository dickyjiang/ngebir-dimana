import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(nuxtApp => {
  const supabaseUrl = 'https://iblcxviqmqiutjzxnblx.supabase.co'
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlibGN4dmlxbXFpdXRqenhuYmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4ODUyMDQsImV4cCI6MjA2MDQ2MTIwNH0.CFQupP7zz_6Skc330_URoP9G_TFqV5B_zibwQ9m-JZg'
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  nuxtApp.provide('supabase', supabase)
})
