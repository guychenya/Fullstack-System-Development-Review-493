import { createClient } from '@supabase/supabase-js'

// Project ID will be auto-injected during deployment
const SUPABASE_URL = 'https://nnkosgxcxvatydrwjeew.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua29zZ3hjeHZhdHlkcndqZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTkwMDgsImV4cCI6MjA2ODc3NTAwOH0.96VwupZIyI3FSDjNXHchsHAtU3yYKl8DFNPjojsU4NE'

if(SUPABASE_URL == 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY == '<ANON_KEY>'){
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})