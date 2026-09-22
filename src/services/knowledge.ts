import type { SupabaseClient } from "@supabase/supabase-js";

export type KnowledgeRecord = {
  id: number;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  created_at: string;
};

export type CreateKnowledgeInput = Pick<
  KnowledgeRecord,
  "title" | "category" | "content"
>;

const KNOWLEDGE_FIELDS =
  "id, title, category, content, is_active, created_at";

export async function listKnowledgeRecords(client: SupabaseClient) {
  const { data, error } = await client
    .from("knowledge")
    .select(KNOWLEDGE_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as KnowledgeRecord[];
}

export async function createKnowledgeRecord(
  client: SupabaseClient,
  input: CreateKnowledgeInput,
) {
  const { data, error } = await client
    .from("knowledge")
    .insert({
      title: input.title.trim(),
      category: input.category.trim(),
      content: input.content.trim(),
    })
    .select(KNOWLEDGE_FIELDS)
    .single();

  if (error) throw error;
  return data as KnowledgeRecord;
}
