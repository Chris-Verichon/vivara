import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, MapPin, Calendar, Tag } from "lucide-react"
import { formatMemoryDate } from "@/lib/utils"
import type { MemoryWithMedia } from "@/lib/types"
import { MemoryMediaGallery } from "@/components/memory-card/MemoryMediaGallery"
import { DeleteMemoryButton } from "@/components/memory-card/DeleteMemoryButton"

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

export default async function MemoryDetailPage({ params }: Props) {
  const { id } = await params
  const memory = await getMemory(id)
  if (!memory) notFound()

  const year = memory.memory_date.slice(0, 4)

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link
          href={`/timeline/${year}`}
          className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors"
        >
          <ArrowLeft size={15} />
          {year}
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/memory/${memory.id}/edit`}
            className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors px-3 py-1.5 rounded-xl hover:bg-[#F4B8C1]/10"
          >
            <Pencil size={14} />
            Modifier
          </Link>
          <DeleteMemoryButton memoryId={memory.id} />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl md:text-5xl text-[#1A1A1A] leading-tight" style={{ fontFamily: "var(--font-playfair)" }}>
          {memory.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888]">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            {formatMemoryDate(memory.memory_date)}
          </span>
          {memory.country_name && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {memory.country_name}
            </span>
          )}
        </div>
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag size={13} className="text-[#AAAAAA]" />
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-[#F4B8C1]/20 text-[#C9748A]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      {memory.description && (
        <p className="text-[#444444] leading-relaxed text-base whitespace-pre-wrap">
          {memory.description}
        </p>
      )}

      {/* Media gallery with lightbox */}
      {memory.media_files.length > 0 && (
        <MemoryMediaGallery memory={memory} />
      )}
    </div>
  )
}
