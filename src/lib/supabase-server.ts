import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Server-side Supabase client for use in API routes
 * This is separate from the client-side instance to ensure proper security
 */
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
