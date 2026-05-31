"use client"

import { useState, useMemo, useCallback } from "react"
import { MemoryCard } from "@/components/memory-card/MemoryCard"
import { SlidersHorizontal, X, ChevronDown } from "lucide-react"
import type { MemoryWithMedia } from "@/lib/types"

type MediaType = "all" | "photo" | "video" | "text"
type SortOrder = "chrono" | "anti-chrono" | "random"

interface Props {
  memories: MemoryWithMedia[]
  years: number[]
  countries: { code: string; name: string }[]
}

const PAGE_SIZE = 12

function getVariant(memory: MemoryWithMedia): "photo" | "video" | "text" {
  const first = memory.media_files[0]
  if (!first) return "text"
  return first.file_type === "video" ? "video" : "photo"
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function GalleryClient({ memories, years, countries }: Props) {
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [mediaType, setMediaType] = useState<MediaType>("all")
  const [sort, setSort] = useState<SortOrder>("anti-chrono")
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = memories

    if (selectedYears.length > 0) {
      result = result.filter((m) =>
        selectedYears.includes(new Date(m.memory_date).getFullYear())
      )
    }

    if (selectedCountries.length > 0) {
      result = result.filter(
        (m) => m.country_code && selectedCountries.includes(m.country_code)
      )
    }

    if (mediaType !== "all") {
      result = result.filter((m) => getVariant(m) === mediaType)
    }

    return result
  }, [memories, selectedYears, selectedCountries, mediaType])

  const sorted = useMemo(() => {
    if (sort === "chrono") {
      return [...filtered].sort(
        (a, b) => new Date(a.memory_date).getTime() - new Date(b.memory_date).getTime()
      )
    }
    if (sort === "anti-chrono") {
      return [...filtered].sort(
        (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
      )
    }
    return shuffleArray(filtered)
  }, [filtered, sort])

  const visible = sorted.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < sorted.length

  const activeFiltersCount =
    selectedYears.length + selectedCountries.length + (mediaType !== "all" ? 1 : 0)

  const resetFilters = useCallback(() => {
    setSelectedYears([])
    setSelectedCountries([])
    setMediaType("all")
    setPage(1)
  }, [])

  function toggleYear(year: number) {
    setPage(1)
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    )
  }

  function toggleCountry(code: string) {
    setPage(1)
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Filter / sort bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Toggle filter panel */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors ${
            showFilters || activeFiltersCount > 0
              ? "border-[#C9748A] text-[#F4B8C1] bg-[#F4B8C1]/10"
              : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C9748A] text-[10px] text-white font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Reset */}
        {activeFiltersCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-[#fdf6ec]/55 hover:text-[#F4B8C1] transition-colors"
          >
            <X size={13} />
            Réinitialiser
          </button>
        )}

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-[#fdf6ec]/55 hidden sm:block">Trier :</label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOrder); setPage(1) }}
              className="appearance-none text-sm bg-white/5 border border-white/15 rounded-xl pl-3 pr-8 py-2 text-[#fdf6ec] cursor-pointer focus:outline-none focus:border-[#F4B8C1] hover:border-[#F4B8C1] transition-colors"
            >
              <option value="anti-chrono" className="bg-[#0b0a14] text-[#fdf6ec]">Plus récents</option>
              <option value="chrono" className="bg-[#0b0a14] text-[#fdf6ec]">Plus anciens</option>
              <option value="random" className="bg-[#0b0a14] text-[#fdf6ec]">Aléatoire</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#fdf6ec]/55" />
          </div>
        </div>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex flex-col gap-5">
          {/* Type */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-[#fdf6ec]/80 uppercase tracking-wide">Type</p>
            <div className="flex flex-wrap gap-2">
              {(["all", "photo", "video", "text"] as MediaType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setMediaType(t); setPage(1) }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    mediaType === t
                      ? "bg-[#C9748A] border-[#C9748A] text-white"
                      : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
                  }`}
                >
                  {t === "all" ? "Tout" : t === "photo" ? "Photos" : t === "video" ? "Vidéos" : "Texte"}
                </button>
              ))}
            </div>
          </div>

          {/* Years */}
          {years.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#fdf6ec]/80 uppercase tracking-wide">Années</p>
              <div className="flex flex-wrap gap-2">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedYears.includes(year)
                        ? "bg-[#C9748A] border-[#C9748A] text-white"
                        : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Countries */}
          {countries.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[#fdf6ec]/80 uppercase tracking-wide">Pays</p>
              <div className="flex flex-wrap gap-2">
                {countries.map(({ code, name }) => (
                  <button
                    key={code}
                    onClick={() => toggleCountry(code)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedCountries.includes(code)
                        ? "bg-[#C9748A] border-[#C9748A] text-white"
                        : "border-white/15 text-[#fdf6ec]/60 hover:border-[#F4B8C1] hover:text-[#F4B8C1]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Result count ── */}
      <p className="text-sm text-[#fdf6ec]/55">
        {sorted.length === 0
          ? "Aucun souvenir"
          : `${sorted.length} souvenir${sorted.length > 1 ? "s" : ""}`}
        {activeFiltersCount > 0 && " (filtrés)"}
      </p>

      {/* ── Masonry grid ── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-2">
          <p className="text-[#fdf6ec]/55">Aucun souvenir ne correspond aux filtres.</p>
          <button onClick={resetFilters} className="text-sm text-[#F4B8C1] hover:underline">
            Voir tous les souvenirs
          </button>
        </div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {visible.map((memory) => (
              <div key={memory.id} className="mb-4 break-inside-avoid">
                <MemoryCard memory={memory} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 rounded-xl border border-[#C9748A] text-[#F4B8C1] text-sm font-medium hover:bg-[#F4B8C1]/10 transition-colors"
              >
                Voir plus ({sorted.length - visible.length} restants)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
