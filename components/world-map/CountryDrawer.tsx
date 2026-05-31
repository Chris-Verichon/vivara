"use client"

import Link from "next/link"
import { X, MapPin, ChevronDown } from "lucide-react"
import { useState } from "react"
import type { Memory } from "@/lib/types"

interface Props {
  countryName: string
  memories: Memory[]
  onClose: () => void
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate))
}

export function CountryDrawer({ countryName, memories, onClose }: Props) {
  const years = [...new Set(memories.map((m) => new Date(m.memory_date).getFullYear()))].sort(
    (a, b) => b - a
  )
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const filtered = selectedYear
    ? memories.filter((m) => new Date(m.memory_date).getFullYear() === selectedYear)
    : memories

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside className="fixed bottom-0 left-0 right-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-96 z-50 flex flex-col bg-[#0b0a14]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl rounded-t-2xl md:rounded-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2
              className="text-xl text-[#fdf6ec]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {countryName}
            </h2>
            <p className="text-xs text-[#fdf6ec]/55 mt-0.5">
              {memories.length} souvenir{memories.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-[#fdf6ec]/60 hover:text-[#fdf6ec]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Year filter */}
        {years.length > 1 && (
          <div className="px-6 py-3 border-b border-white/10 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedYear(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedYear === null
                  ? "bg-[#C9748A] border-[#C9748A] text-white"
                  : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
              }`}
            >
              Tout
            </button>
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedYear === year
                    ? "bg-[#C9748A] border-[#C9748A] text-white"
                    : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Memory list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {sorted.map((memory) => (
            <Link
              key={memory.id}
              href={`/memory/${memory.id}`}
              onClick={onClose}
              className="group flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <p className="text-xs text-[#fdf6ec]/45">{formatDate(memory.memory_date)}</p>
              <h3
                className="text-sm font-medium text-[#fdf6ec] group-hover:text-[#F4B8C1] transition-colors leading-snug"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {memory.title}
              </h3>
              {memory.description && (
                <p className="text-xs text-[#fdf6ec]/50 line-clamp-2 leading-relaxed">
                  {memory.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  )
}
