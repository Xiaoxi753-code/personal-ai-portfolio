import { createClient } from "@supabase/supabase-js";
import type { ProjectRecord } from "@/services/projects";

export async function listPublicProjects(): Promise<ProjectRecord[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("PUBLIC_PROJECTS_NOT_CONFIGURED");

  // 不携带管理员 Cookie，RLS 按 anon 身份只放行已启用项目。
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client
    .from("projects")
    .select("id, title, description, url, is_active, created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProjectRecord[];
}
