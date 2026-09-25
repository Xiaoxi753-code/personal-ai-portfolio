import type { SupabaseClient } from "@supabase/supabase-js";

export const LOVE_IMAGES_BUCKET = "love_images";
export const MAX_LOVE_IMAGES = 9;
export const MAX_LOVE_IMAGE_BYTES = 5 * 1024 * 1024;

function fileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const safeExtension = extension?.replace(/[^a-z0-9]/g, "").slice(0, 10);
  return safeExtension || "image";
}

export async function uploadLoveImages(
  client: SupabaseClient,
  files: File[],
  onProgress?: (completed: number, total: number) => void,
) {
  const uploaded: Array<{ path: string; url: string }> = [];
  const folder = new Date().toISOString().slice(0, 7);

  for (const [index, file] of files.entries()) {
    const path = `moments/${folder}/${crypto.randomUUID()}.${fileExtension(file)}`;
    const { error } = await client.storage
      .from(LOVE_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      if (uploaded.length > 0) {
        await client.storage
          .from(LOVE_IMAGES_BUCKET)
          .remove(uploaded.map((item) => item.path));
      }
      throw error;
    }

    const { data } = client.storage
      .from(LOVE_IMAGES_BUCKET)
      .getPublicUrl(path);
    uploaded.push({ path, url: data.publicUrl });
    onProgress?.(index + 1, files.length);
  }

  return uploaded;
}

export async function removeLoveImagesByPaths(
  client: SupabaseClient,
  paths: string[],
) {
  if (paths.length === 0) return;
  const { error } = await client.storage.from(LOVE_IMAGES_BUCKET).remove(paths);
  if (error) throw error;
}

export function loveImagePathFromPublicUrl(publicUrl: string) {
  try {
    const pathname = new URL(publicUrl).pathname;
    const marker = `/storage/v1/object/public/${LOVE_IMAGES_BUCKET}/`;
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function removeLoveImagesByUrls(
  client: SupabaseClient,
  urls: string[],
) {
  const paths = urls
    .map(loveImagePathFromPublicUrl)
    .filter((path): path is string => Boolean(path));
  await removeLoveImagesByPaths(client, paths);
}
