import { createClient } from "@supabase/supabase-js";
import type { LoveMomentRecord } from "@/services/loveMoments";

export async function listPublicLoveMoments(): Promise<LoveMomentRecord[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("PUBLIC_LOVE_MOMENTS_NOT_CONFIGURED");

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const { data, error } = await client
    .from("love_moments")
    .select("id, title, content, image_urls, date, is_active, created_at")
    .eq("is_active", true)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LoveMomentRecord[];
}
