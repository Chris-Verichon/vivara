"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { MediaFile } from "@/lib/types"

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

// ─── Update ──────────────────────────────────────────────────────────────────

interface UpdateMemoryInput {
  title: string
  description: string
  memoryDate: string
  countryCode: string
  countryName: string
  tags: string[]
  /** IDs of existing media_files to KEEP (all others will be deleted from DB + Storage) */
  keepMediaIds: string[]
  /** New media files to upload (already uploaded client-side, just DB records needed) */
  newMedia: MediaInput[]
  /** Existing media that needs to be deleted from Storage */
  removedStoragePaths: string[]
}

export async function updateMemory(
  memoryId: string,
  input: UpdateMemoryInput
): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Non authentifié." }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from("memories")
    .select("id, user_id, memory_date")
    .eq("id", memoryId)
    .single()
  if (fetchError || !existing) return { error: "Souvenir introuvable." }
  if (existing.user_id !== user.id) return { error: "Non autorisé." }

  // Update memory record
  const { error: updateError } = await supabase
    .from("memories")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      memory_date: input.memoryDate,
      country_code: input.countryCode || null,
      country_name: input.countryName || null,
      tags: input.tags.length > 0 ? input.tags : null,
    })
    .eq("id", memoryId)
  if (updateError) return { error: updateError.message }

  // Delete removed media from Storage
  if (input.removedStoragePaths.length > 0) {
    await supabase.storage.from("memories").remove(input.removedStoragePaths)
  }

  // Delete removed media_files records (any not in keepMediaIds)
  if (input.keepMediaIds.length > 0) {
    await supabase
      .from("media_files")
      .delete()
      .eq("memory_id", memoryId)
      .not("id", "in", `(${input.keepMediaIds.map((id) => `"${id}"`).join(",")})`)
  } else {
    // No media kept — delete all
    const { data: allMedia } = await supabase
      .from("media_files")
      .select("storage_path, thumbnail_path")
      .eq("memory_id", memoryId)
    if (allMedia && allMedia.length > 0) {
      const paths = (allMedia as Pick<MediaFile, "storage_path" | "thumbnail_path">[]).flatMap((m) =>
        m.thumbnail_path ? [m.storage_path, m.thumbnail_path] : [m.storage_path]
      )
      await supabase.storage.from("memories").remove(paths)
    }
    await supabase.from("media_files").delete().eq("memory_id", memoryId)
  }

  // Insert new media_files records
  if (input.newMedia.length > 0) {
    const { error: mediaError } = await supabase.from("media_files").insert(
      input.newMedia.map((m) => ({
        memory_id: memoryId,
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

  redirect(`/memory/${memoryId}`)
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteMemory(memoryId: string): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Non authentifié." }

  // Verify ownership + get year for redirect
  const { data: memory, error: fetchError } = await supabase
    .from("memories")
    .select("id, user_id, memory_date")
    .eq("id", memoryId)
    .single()
  if (fetchError || !memory) return { error: "Souvenir introuvable." }
  if (memory.user_id !== user.id) return { error: "Non autorisé." }

  // Fetch all media paths
  const { data: mediaFiles } = await supabase
    .from("media_files")
    .select("storage_path, thumbnail_path")
    .eq("memory_id", memoryId)

  if (mediaFiles && mediaFiles.length > 0) {
    const paths = (mediaFiles as Pick<MediaFile, "storage_path" | "thumbnail_path">[]).flatMap((m) =>
      m.thumbnail_path ? [m.storage_path, m.thumbnail_path] : [m.storage_path]
    )
    await supabase.storage.from("memories").remove(paths)
  }

  // Delete memory (cascades media_files via FK)
  const { error: deleteError } = await supabase
    .from("memories")
    .delete()
    .eq("id", memoryId)
  if (deleteError) return { error: deleteError.message }

  const year = (memory.memory_date as string).slice(0, 4)
  redirect(`/timeline/${year}`)
}
