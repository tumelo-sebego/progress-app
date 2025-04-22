import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VUE_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.VUE_APP_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl); // Debug log
console.log("Supabase Key exists:", !!supabaseAnonKey); // Debug log safely

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase environment variables. Check your .env file.",
  );
}

// Create Supabase client with persistence enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable session persistence
    autoRefreshToken: true, // Enable automatic token refresh
    storageKey: "progress-app-auth", // Custom storage key
    storage: window.localStorage, // Use localStorage for persistence
  },
});
