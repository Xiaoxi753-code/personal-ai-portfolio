import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
const globalForSupabase = globalThis as typeof globalThis & {
  __personalAiPortfolioSupabaseClient?: SupabaseClient;
};

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = globalForSupabase.__personalAiPortfolioSupabaseClient ?? null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      isSingleton: true,
      cookieOptions: {
        secure: false,
      },
    });
    globalForSupabase.__personalAiPortfolioSupabaseClient = browserClient;
  }

  return browserClient;
}
