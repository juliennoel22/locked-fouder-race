import { createClient as createBrowserClient } from "@/lib/supabase/client";

/**
 * Generate a secure, time-limited signed URL for a private file stored in Supabase Storage.
 * 
 * @param path Storage file path (e.g. "user_id/174291823.jpg" or full public URL fallback)
 * @param expiresInSeconds Duration in seconds before the signed link expires (default: 3600 = 1 hour)
 * @returns Temporary signed URL
 */
export async function getSignedCourseUrl(
  path: string | null | undefined,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  if (!path) return null;

  // If path is already a base64 string or blob URL, return directly
  if (path.startsWith("data:") || path.startsWith("blob:")) {
    return path;
  }

  try {
    const supabase = createBrowserClient();
    
    // Extract storage relative path if full Supabase URL was passed
    let relativePath = path;
    if (path.includes("/course-scans/")) {
      relativePath = path.split("/course-scans/")[1] || path;
    }

    // Generate signed URL with 1-hour expiration
    const { data, error } = await supabase.storage
      .from("course-scans")
      .createSignedUrl(relativePath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.warn("Storage signed URL fallback to relative path:", error);
      return path;
    }

    return data.signedUrl;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return path;
  }
}

/**
 * Generate signed URLs for multiple scanned page photos in batch.
 */
export async function getSignedCourseUrls(
  paths: string[],
  expiresInSeconds: number = 3600
): Promise<string[]> {
  if (!paths || paths.length === 0) return [];
  const results = await Promise.all(
    paths.map((p) => getSignedCourseUrl(p, expiresInSeconds))
  );
  return results.filter((url): url is string => Boolean(url));
}
