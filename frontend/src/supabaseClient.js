import { createClient } from '@supabase/supabase-js'

// Your NEW violet book project's unique Supabase URL
const supabaseUrl = 'https://wgofqkisiqkygpnliuwl.supabase.co'

// Your NEW project's public anon key
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnb2Zxa2lzaXFreWdwbmxpdXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODE4MzEsImV4cCI6MjA3MzQ1NzgzMX0.DcqJ7XNAkMiOT-3Vnlmvua84wNqahgfd3JQ9wpTW-yg'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)