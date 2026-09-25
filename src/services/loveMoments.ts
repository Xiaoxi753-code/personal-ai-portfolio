import type { SupabaseClient } from "@supabase/supabase-js";

export type LoveMomentRecord = {
  id: number;
  title: string;
  content: string;
  image_urls: string[];
  date: string;
  is_active: boolean;
  created_at: string;
};

export type LoveMomentInput = Pick<
  LoveMomentRecord,
  "title" | "content" | "image_urls" | "date"
>;

const LOVE_MOMENT_FIELDS =
  "id, title, content, image_urls, date, is_active, created_at";

export async function listLoveMoments(client: SupabaseClient) {
  const { data, error } = await client
    .from("love_moments")
    .select(LOVE_MOMENT_FIELDS)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as LoveMomentRecord[];
}

export async function createLoveMoment(
  client: SupabaseClient,
  input: LoveMomentInput,
) {
  const { data, error } = await client
    .from("love_moments")
    .insert(input)
    .select(LOVE_MOMENT_FIELDS)
    .single();

  if (error) throw error;
  return data as LoveMomentRecord;
}

export async function updateLoveMoment(
  client: SupabaseClient,
  id: number,
  input: LoveMomentInput,
) {
  const { data, error } = await client
    .from("love_moments")
    .update(input)
    .eq("id", id)
    .select(LOVE_MOMENT_FIELDS)
    .single();

  if (error) throw error;
  return data as LoveMomentRecord;
}

export async function updateLoveMomentStatus(
  client: SupabaseClient,
  id: number,
  isActive: boolean,
) {
  const { data, error } = await client
    .from("love_moments")
    .update({ is_active: isActive })
    .eq("id", id)
    .select(LOVE_MOMENT_FIELDS)
    .single();

  if (error) throw error;
  return data as LoveMomentRecord;
}

export async function deleteLoveMoment(client: SupabaseClient, id: number) {
  const { data, error } = await client
    .from("love_moments")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  return data.id as number;
}
