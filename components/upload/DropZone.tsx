"use client"

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react"
import Image from "next/image"
import { X, GripVertical, ImageIcon, Video } from "lucide-react"
import imageCompression from "browser-image-compression"

export interface UploadFile {
  id: string
  file: File
  previewUrl: string
  fileType: "image" | "video"
  thumbnailUrl?: string // extracted first frame for video
}

interface DropZoneProps {
  files: UploadFile[]
  onChange: (files: UploadFile[]) => void
  maxImages?: number // default unlimited
  maxVideoSizeMB?: number // default 200
}

const IMAGE_MAX_OUTPUT_MB = 10
const ACCEPTED = "image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime,video/webm"

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: IMAGE_MAX_OUTPUT_MB,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
  })
}

async function extractVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    video.src = url
    video.currentTime = 1

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) ctx.drawImage(video, 0, 0)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL("image/jpeg", 0.8))
    }, { once: true })

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url)
      resolve("")
    }, { once: true })
  })
}

export function DropZone({ files, onChange, maxVideoSizeMB = 200 }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const dragOverIndexRef = useRef<number | null>(null)
  const dragFileIdRef = useRef<string | null>(null)

  const processFiles = useCallback(async (rawFiles: FileList | File[]) => {
    setProcessing(true)
    const arr = Array.from(rawFiles)
    const newItems: UploadFile[] = []

    for (const raw of arr) {
      const isVideo = raw.type.startsWith("video/")
      const isImage = raw.type.startsWith("image/")
      if (!isVideo && !isImage) continue

      if (isVideo && raw.size > maxVideoSizeMB * 1024 * 1024) {
        alert(`La vidéo "${raw.name}" dépasse la limite de ${maxVideoSizeMB} Mo.`)
        continue
      }

      let finalFile = raw
      let previewUrl = ""
      let thumbnailUrl: string | undefined

      if (isImage) {
        finalFile = await compressImage(raw)
        previewUrl = URL.createObjectURL(finalFile)
      } else {
        previewUrl = URL.createObjectURL(raw)
        thumbnailUrl = await extractVideoThumbnail(raw)
      }

      newItems.push({
        id: crypto.randomUUID(),
        file: finalFile,
        previewUrl,
        fileType: isVideo ? "video" : "image",
        thumbnailUrl,
      })
    }

    onChange([...files, ...newItems])
    setProcessing(false)
  }, [files, onChange, maxVideoSizeMB])

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
      e.target.value = ""
    }
  }

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id))
  }

  // Drag-to-reorder
  const onDragStartItem = (id: string) => { dragFileIdRef.current = id }
  const onDragEnterItem = (index: number) => { dragOverIndexRef.current = index }
  const onDropItem = () => {
    const fromId = dragFileIdRef.current
    const toIndex = dragOverIndexRef.current
    if (fromId === null || toIndex === null) return
    const fromIndex = files.findIndex((f) => f.id === fromId)
    if (fromIndex === toIndex) return
    const reordered = [...files]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    onChange(reordered)
    dragFileIdRef.current = null
    dragOverIndexRef.current = null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zone de dépôt de fichiers"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
          ${isDragging ? "border-[#C9748A] bg-[#F4B8C1]/10" : "border-black/10 hover:border-[#C9748A]/50 bg-[#FAF7F2]"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <div className="flex gap-3 text-[#C9748A]">
          <ImageIcon className="w-6 h-6" />
          <Video className="w-6 h-6" />
        </div>
        <p className="text-sm text-[#888888] text-center">
          {processing
            ? "Traitement en cours…"
            : "Glissez des photos ou vidéos ici, ou cliquez pour sélectionner"}
        </p>
        <p className="text-xs text-[#AAAAAA]">
          Images jusqu'à {IMAGE_MAX_OUTPUT_MB} Mo · Vidéos jusqu'à {maxVideoSizeMB} Mo
        </p>
      </div>

      {/* Previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {files.map((f, index) => (
            <div
              key={f.id}
              draggable
              onDragStart={() => onDragStartItem(f.id)}
              onDragEnter={() => onDragEnterItem(index)}
              onDragEnd={onDropItem}
              onDragOver={(e) => e.preventDefault()}
              className="relative group rounded-xl overflow-hidden aspect-square bg-[#FAF7F2] border border-black/5 cursor-grab active:cursor-grabbing"
            >
              <Image
                src={f.fileType === "video" && f.thumbnailUrl ? f.thumbnailUrl : f.previewUrl}
                alt={f.file.name}
                fill
                sizes="200px"
                className="object-cover"
                unoptimized
              />
              {f.fileType === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Video className="w-6 h-6 text-white drop-shadow" />
                </div>
              )}
              {/* Drag handle */}
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow" />
              </div>
              {/* Remove */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(f.id) }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Supprimer"
              >
                <X className="w-3 h-3 text-white" />
              </button>
              {/* Position badge */}
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-[#C9748A] text-white px-1.5 py-0.5 rounded-full font-medium">
                  Couverture
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
