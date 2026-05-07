"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface MediaInput {
  storagePath: string
  thumbnailPath: string | null
  fileType: "image" | "video"
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  position: number
}

interface CreateMemoryInput {
  title: string
  description: string
  memoryDate: string // YYYY-MM-DD
  countryCode: string
  countryName: string
  tags: string[]
  media: MediaInput[]
}

export async function createMemory(input: CreateMemoryInput): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Non authentifié." }

  const { data: memory, error: insertError } = await supabase
    .from("memories")
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      description: input.description.trim() || null,
      memory_date: input.memoryDate,
      country_code: input.countryCode || null,
      country_name: input.countryName || null,
      tags: input.tags.length > 0 ? input.tags : null,
    })
    .select("id")
    .single()

  if (insertError || !memory) return { error: insertError?.message ?? "Erreur lors de la création." }

  if (input.media.length > 0) {
    const { error: mediaError } = await supabase.from("media_files").insert(
      input.media.map((m) => ({
        memory_id: memory.id,
        storage_path: m.storagePath,
        thumbnail_path: m.thumbnailPath,
        file_type: m.fileType,
        mime_type: m.mimeType,
        size_bytes: m.sizeBytes,
        width: m.width,
        height: m.height,
        position: m.position,
      }))
    )
    if (mediaError) return { error: mediaError.message }
  }

  redirect(`/memory/${memory.id}`)
}
