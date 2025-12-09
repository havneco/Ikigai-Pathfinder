import { createClient } from '@supabase/supabase-js';

// Derived from your connection string
const supabaseUrl = 'https://rbhmmtllgamvjscsjutg.supabase.co';

// ------------------------------------------------------------------
// PASTE YOUR SUPABASE 'ANON PUBLIC' KEY BELOW
// Find it in Supabase Dashboard -> Project Settings -> API
// ------------------------------------------------------------------
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiaG1tdGxsZ2FtdmpzY3NqdXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNTU0NTQsImV4cCI6MjA4MDgzMTQ1NH0.yBNM6vy6YTsrXjHn8kkFKTsIkrUwuUKKYoNmb53fnRA'; 

if (!supabaseAnonKey) {
  console.warn('⚠️ Supabase Anon Key is missing. The app will not be able to login or save data.');
  console.warn('Please paste it into lib/supabaseClient.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);