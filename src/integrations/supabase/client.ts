import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Only use localStorage in browser environment
    storage: isBrowser ? localStorage : undefined,
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
  }
});