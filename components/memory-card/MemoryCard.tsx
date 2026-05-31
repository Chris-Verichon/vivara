"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, FileText, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MemoryWithMedia } from "@/lib/types"
import { getMediaUrl } from "@/lib/media-url"

interface MemoryCardProps {
  memory: MemoryWithMedia
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const firstMedia = memory.media_files[0] ?? null
  const variant: "photo" | "video" | "text" = firstMedia
    ? firstMedia.file_type === "video"
      ? "video"
      : "photo"
    : "text"

  const mediaSrc =
    firstMedia
      ? variant === "video" && firstMedia.thumbnail_path
        ? getMediaUrl(firstMedia.thumbnail_path)
        : variant !== "text"
          ? getMediaUrl(firstMedia.storage_path)
          : null
      : null

  return (
    <motion.div
      whileHover={{ scale: 1.025, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="rounded-2xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] break-inside-avoid"
    >
      <Link href={`/memory/${memory.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9748A] rounded-2xl">
        {/* Media area */}
        <div className="relative w-full aspect-[4/3] bg-[#FAF7F2]">
          {mediaSrc ? (
            <Image
              src={mediaSrc}
              alt={memory.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-10 h-10 text-[#C9748A] opacity-40" />
            </div>
          )}

          {/* Video play overlay */}
          {variant === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow">
                <Play className="w-5 h-5 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">
          {/* Date */}
          <p className="text-xs text-[#888888] font-[Inter]">{formatDate(memory.memory_date)}</p>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[#1A1A1A] font-[Playfair_Display] leading-snug line-clamp-2">
            {memory.title}
          </h3>

          {/* Description */}
          {memory.description && (
            <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
              {memory.description}
            </p>
          )}

          {/* Country + Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {memory.country_name && (
              <Badge variant="secondary" className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-[#FAF7F2] text-[#888888] border-0">
                <MapPin className="w-2.5 h-2.5" />
                {memory.country_name}
              </Badge>
            )}
            {memory.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 bg-[#F4B8C1]/20 text-[#C9748A] border-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
