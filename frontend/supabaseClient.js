import { createClient } from '@supabase/supabase-js'

// Your project's unique Supabase URL
const supabaseUrl = 'https://bczzlvhjaorneddwhisd.supabase.co'

// Your project's public anon key. This is safe to expose in a browser client.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjenpsdmhqYW9ybmVkZHdoaXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODQyNzYsImV4cCI6MjA3MzM2MDI3Nn0.ytP7-p-NZXiynHAY_ZSHiVcmvgltSMCt8P_rLpfVikg'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)