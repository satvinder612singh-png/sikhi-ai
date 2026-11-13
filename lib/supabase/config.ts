/**
 * Supabase env access in one place. NEXT_PUBLIC_ vars are inlined at build
 * time, so they must be referenced literally (no dynamic process.env[key]).
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
