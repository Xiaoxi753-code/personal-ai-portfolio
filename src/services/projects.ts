import type { SupabaseClient } from "@supabase/supabase-js";

export type ProjectRecord = {
  id: number;
  title: string;
  description: string;
  url: string | null;
  is_active: boolean;
  created_at: string;
};

export type NewProject = Pick<ProjectRecord, "title" | "description" | "url">;
export type UpdateProjectInput = NewProject;

const PROJECT_FIELDS = "id, title, description, url, is_active, created_at";

export async function listProjects(client: SupabaseClient) {
  const { data, error } = await client
    .from("projects")
    .select(PROJECT_FIELDS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ProjectRecord[];
}

export async function createProject(client: SupabaseClient, input: NewProject) {
  const { data, error } = await client
    .from("projects")
    .insert(input)
    .select(PROJECT_FIELDS)
    .single();

  if (error) throw error;
  return data as ProjectRecord;
}

export async function updateProjectStatus(client: SupabaseClient, id: number, isActive: boolean) {
  const { data, error } = await client
    .from("projects")
    .update({ is_active: isActive })
    .eq("id", id)
    .select(PROJECT_FIELDS)
    .single();

  if (error) throw error;
  return data as ProjectRecord;
}

export async function updateProjectContent(
  client: SupabaseClient,
  id: number,
  input: UpdateProjectInput,
) {
  const { data, error } = await client
    .from("projects")
    .update(input)
    .eq("id", id)
    .select(PROJECT_FIELDS)
    .single();

  if (error) throw error;
  return data as ProjectRecord;
}

export async function deleteProject(client: SupabaseClient, id: number) {
  const { data, error } = await client
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .single();

  if (error) throw error;
  return data.id as number;
}
