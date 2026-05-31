import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { r2PutPresigned } from "@/lib/r2"

// Restrict uploads to safe MIME types.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
  "video/webm",
])

// Allowlist characters for memoryId (UUID) and suffix (filename-like string).
const SAFE_UUID = /^[0-9a-f-]{36}$/i
const SAFE_SUFFIX = /^[a-zA-Z0-9_.+-]+$/

/**
 * POST /api/r2/presign
 *
 * Body: { memoryId: string; suffix: string; contentType: string }
 *   - memoryId  UUID used as the folder name inside the user's R2 prefix
 *   - suffix    Filename portion, e.g. "0_1717000000000.jpg"
 *   - contentType  MIME type of the file to be uploaded
 *
 * Returns: { url: string; key: string }
 *   - url   Presigned PUT URL (valid 5 min) — client uploads the raw file body here
 *   - key   The R2 object key to store as storage_path in the DB
 */
export async function POST(req: NextRequest) {
  // Verify the user is authenticated via Supabase.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = (await req.json()) as {
    memoryId?: string
    suffix?: string
    contentType?: string
  }
  const { memoryId, suffix, contentType } = body

  if (!memoryId || !suffix || !contentType) {
    return NextResponse.json(
      { error: "memoryId, suffix and contentType are required" },
      { status: 400 }
    )
  }

  // Validate inputs to prevent path traversal and unsupported types.
  if (!SAFE_UUID.test(memoryId)) {
    return NextResponse.json({ error: "Invalid memoryId" }, { status: 400 })
  }
  if (!SAFE_SUFFIX.test(suffix)) {
    return NextResponse.json({ error: "Invalid suffix" }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
  }

  // Build the object key: <userId>/<memoryId>/<suffix>
  // The userId prefix ensures objects are always scoped to the owner.
  const key = `${user.id}/${memoryId}/${suffix}`

  const url = await r2PutPresigned(key, contentType)
  return NextResponse.json({ url, key })
}
