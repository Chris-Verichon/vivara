/**
 * Cloudflare R2 helpers (server-only — never import from Client Components).
 * R2 is S3-compatible; we use the AWS SDK v3 with the R2 endpoint.
 *
 * Required env vars (server-side, never exposed to the client):
 *   R2_ACCOUNT_ID         Cloudflare account ID
 *   R2_ACCESS_KEY_ID      R2 API token key ID
 *   R2_SECRET_ACCESS_KEY  R2 API token secret
 *   R2_BUCKET_NAME        Name of the R2 bucket (e.g. "vivara-media")
 */

import {
  S3Client,
  DeleteObjectsCommand,
  PutObjectCommand,
  type ObjectIdentifier,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

function makeClient(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

// Module-level singleton (one client per server worker).
let _client: S3Client | null = null
function getClient(): S3Client {
  if (!_client) _client = makeClient()
  return _client
}

/**
 * Generate a presigned PUT URL that allows a client to upload a single object
 * directly to R2. The URL expires in 5 minutes by default.
 */
export async function r2PutPresigned(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(getClient(), cmd, { expiresIn })
}

/**
 * Delete one or more R2 objects by key.
 * Silently ignores an empty array.
 */
export async function r2DeleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  const objects: ObjectIdentifier[] = keys.map((Key) => ({ Key }))
  await getClient().send(
    new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Delete: { Objects: objects, Quiet: true },
    })
  )
}
