"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Play, FileText, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { MemoryWithMedia } from "@/lib/types"

interface Props {
  memory: MemoryWithMedia
  index: number
}

function getMediaUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${base}/storage/v1/object/public/memories/${storagePath}`
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

export function MemoryStoryRow({ memory, index }: Props) {
  const isReversed = index % 2 !== 0

  const firstMedia = memory.media_files[0] ?? null
  const variant: "photo" | "video" | "text" = firstMedia
    ? firstMedia.file_type === "video"
      ? "video"
      : "photo"
    : "text"

  const mediaSrc = firstMedia
    ? variant === "video" && firstMedia.thumbnail_path
      ? getMediaUrl(firstMedia.thumbnail_path)
      : getMediaUrl(firstMedia.storage_path)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/memory/${memory.id}`}
        className={`group flex flex-col sm:flex-row items-center gap-8 lg:gap-14 ${
          isReversed ? "sm:flex-row-reverse" : ""
        } focus:outline-none`}
      >
        {/* ── Media ── */}
        <div className="w-full sm:w-[46%] shrink-0">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#F4B8C1]/10 shadow-[0_4px_24px_rgba(0,0,0,0.07)] group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-shadow duration-300">
            {mediaSrc ? (
              <Image
                src={mediaSrc}
                alt={memory.title}
                fill
                sizes="(max-width: 640px) 100vw, 46vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-14 h-14 text-[#C9748A] opacity-30" />
              </div>
            )}

            {variant === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-14 h-14 rounded-full bg-white/85 flex items-center justify-center shadow-md">
                  <Play className="w-6 h-6 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Text ── */}
        <div className={`w-full sm:w-[54%] flex flex-col gap-3 ${isReversed ? "sm:items-end sm:text-right" : ""}`}>
          {/* Date */}
          <p className="text-sm text-[#fdf6ec]/50">{formatDate(memory.memory_date)}</p>

          {/* Title */}
          <h2
            className="text-2xl md:text-3xl text-[#fdf6ec] leading-snug group-hover:text-[#F4B8C1] transition-colors duration-200"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {memory.title}
          </h2>

          {/* Country */}
          {memory.country_name && (
            <p className="flex items-center gap-1.5 text-sm text-[#fdf6ec]/55" style={isReversed ? { justifyContent: "flex-end" } : {}}>
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {memory.country_name}
            </p>
          )}

          {/* Description */}
          {memory.description && (
            <p className="text-[#fdf6ec]/65 leading-relaxed line-clamp-4 text-sm">
              {memory.description}
            </p>
          )}

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 ${isReversed ? "sm:justify-end" : ""}`}>
              {memory.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[11px] px-2.5 py-0.5 bg-[#F4B8C1]/20 text-[#C9748A] border-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Read more hint */}
          <span className="text-xs text-[#C9748A] opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
            Voir le souvenir →
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
