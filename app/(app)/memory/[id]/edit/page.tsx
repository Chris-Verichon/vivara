import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { MemoryWithMedia } from "@/lib/types"
import { EditMemoryForm } from "@/components/memory-card/EditMemoryForm"

type Props = { params: Promise<{ id: string }> }

async function getMemory(id: string): Promise<MemoryWithMedia | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("memories")
    .select("*, media_files(*)")
    .eq("id", id)
    .order("position", { ascending: true, referencedTable: "media_files" })
    .single()
  if (error || !data) return null
  return data as unknown as MemoryWithMedia
}

export default async function EditMemoryPage({ params }: Props) {
  const { id } = await params
  const memory = await getMemory(id)
  if (!memory) notFound()

  return <EditMemoryForm memory={memory} />
}
