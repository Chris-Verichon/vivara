"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { Lightbox } from "@/components/lightbox/Lightbox"
import type { MemoryWithMedia } from "@/lib/types"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getMediaUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/memories/${storagePath}`
}

interface MemoryMediaGalleryProps {
  memory: MemoryWithMedia
}

export function MemoryMediaGallery({ memory }: MemoryMediaGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { media_files } = memory

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {media_files.map((file, idx) => {
          const thumbPath = file.file_type === "video" && file.thumbnail_path
            ? file.thumbnail_path
            : file.storage_path
          const url = getMediaUrl(thumbPath)

          return (
            <button
              key={file.id}
              onClick={() => setLightboxIndex(idx)}
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#F5F0EA] group focus-visible:ring-2 focus-visible:ring-[#C9748A] outline-none"
              aria-label={`Ouvrir media ${idx + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {file.file_type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center">
                    <Play size={18} className="text-[#1A1A1A] ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          media={media_files}
          memory={memory}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  )
}
