"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react"
import dynamic from "next/dynamic"
import type { MediaFile, Memory } from "@/lib/types"
import { formatMemoryDate } from "@/lib/utils"
import { getMediaUrl } from "@/lib/media-url"

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false })

interface LightboxProps {
  media: MediaFile[]
  memory: Pick<Memory, "title" | "description" | "memory_date" | "country_name">
  initialIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function Lightbox({ media, memory, initialIndex, onClose, onNavigate }: LightboxProps) {
  const current = media[initialIndex]
  const hasPrev = initialIndex > 0
  const hasNext = initialIndex < media.length - 1

  const handlePrev = useCallback(() => { if (hasPrev) onNavigate(initialIndex - 1) }, [hasPrev, initialIndex, onNavigate])
  const handleNext = useCallback(() => { if (hasNext) onNavigate(initialIndex + 1) }, [hasNext, initialIndex, onNavigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose, handlePrev, handleNext])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  if (!current) return null

  const mediaUrl = getMediaUrl(current.storage_path)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={memory.title}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-white/60 text-sm">
          {initialIndex + 1} / {media.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Media area */}
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-12">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={!hasPrev}
          aria-label="Précédent"
          className="absolute left-2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Media */}
        <div className="relative w-full h-full flex items-center justify-center">
          {current.file_type === "video" ? (
            <div className="w-full max-w-4xl aspect-video">
              <ReactPlayer
                src={mediaUrl}
                width="100%"
                height="100%"
                controls
                playing
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={mediaUrl}
                alt={memory.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          )}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!hasNext}
          aria-label="Suivant"
          className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom info */}
      <div className="shrink-0 px-6 py-4 max-w-2xl mx-auto w-full text-center">
        <h2 className="text-white font-medium text-base" style={{ fontFamily: "var(--font-playfair)" }}>
          {memory.title}
        </h2>
        <div className="flex items-center justify-center gap-4 mt-1">
          <span className="flex items-center gap-1 text-white/50 text-xs">
            <Calendar size={11} />
            {formatMemoryDate(memory.memory_date)}
          </span>
          {memory.country_name && (
            <span className="flex items-center gap-1 text-white/50 text-xs">
              <MapPin size={11} />
              {memory.country_name}
            </span>
          )}
        </div>
        {memory.description && (
          <p className="text-white/40 text-xs mt-2 line-clamp-2">{memory.description}</p>
        )}
      </div>

      {/* Backdrop click to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  )
}
