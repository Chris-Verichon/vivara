/**
 * Resolve a Cloudflare R2 object key to its public URL.
 *
 * Required env var (exposed to the client):
 *   NEXT_PUBLIC_R2_PUBLIC_URL  Public base URL of the bucket.
 *   Examples:
 *     https://pub-<hash>.r2.dev          (Cloudflare's r2.dev subdomain)
 *     https://media.vivara.app           (custom domain wired to R2)
 */
export function getMediaUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""
  return `${base}/${storagePath}`
}
