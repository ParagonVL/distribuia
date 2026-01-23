import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase config:", {
      url: supabaseUrl,
      keyLength: supabaseAnonKey?.length,
    });
    throw new Error(
      `Missing Supabase environment variables. URL: ${supabaseUrl ? "set" : "missing"}, Key: ${supabaseAnonKey ? "set" : "missing"}`
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
