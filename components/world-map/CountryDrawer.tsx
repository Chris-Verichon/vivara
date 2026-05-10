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
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside className="fixed bottom-0 left-0 right-0 md:right-0 md:left-auto md:top-0 md:bottom-0 md:w-96 z-50 flex flex-col bg-[#FAF7F2] shadow-2xl rounded-t-2xl md:rounded-none overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/8">
          <div>
            <h2
              className="text-xl text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {countryName}
            </h2>
            <p className="text-xs text-[#888888] mt-0.5">
              {memories.length} souvenir{memories.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 rounded-xl hover:bg-black/5 transition-colors text-[#888888] hover:text-[#1A1A1A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Year filter */}
        {years.length > 1 && (
          <div className="px-6 py-3 border-b border-black/8 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedYear(null)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedYear === null
                  ? "bg-[#C9748A] border-[#C9748A] text-white"
                  : "border-black/10 text-[#888888] hover:border-[#C9748A] hover:text-[#C9748A]"
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
                    : "border-black/10 text-[#888888] hover:border-[#C9748A] hover:text-[#C9748A]"
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
              className="group flex flex-col gap-1 p-4 rounded-xl bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow"
            >
              <p className="text-xs text-[#888888]">{formatDate(memory.memory_date)}</p>
              <h3
                className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#C9748A] transition-colors leading-snug"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {memory.title}
              </h3>
              {memory.description && (
                <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed">
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
