import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus } from "lucide-react"
import { MemoryStoryRow } from "@/components/memory-card/MemoryStoryRow"
import type { MemoryWithMedia } from "@/lib/types"

type Props = {
  params: Promise<{ year: string }>
}

async function getYearData(year: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memories")
    .select("*, media_files(*)")
    .gte("memory_date", `${year}-01-01`)
    .lte("memory_date", `${year}-12-31`)
    .order("memory_date", { ascending: true })
    .order("position", { ascending: true, referencedTable: "media_files" })

  if (error) return null
  return (data ?? []) as unknown as MemoryWithMedia[]
}

async function getAdjacentYears(year: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("memories")
    .select("memory_date")

  if (!data || data.length === 0) return { prev: null, next: null }

  const years = [...new Set(data.map((r: { memory_date: string }) => new Date(r.memory_date).getFullYear()))].sort(
    (a, b) => a - b
  )
  const idx = years.indexOf(year)
  return {
    prev: idx > 0 ? years[idx - 1] : null,
    next: idx < years.length - 1 ? years[idx + 1] : null,
  }
}

export default async function YearPage({ params }: Props) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)

  if (isNaN(year) || year < 1900 || year > 2100) notFound()

  const [memories, adjacent] = await Promise.all([
    getYearData(year),
    getAdjacentYears(year),
  ])

  if (memories === null) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Back to timeline */}
      <Link
        href="/timeline"
        className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Retour à la timeline
      </Link>

      {/* Year header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-6xl md:text-8xl text-[#1A1A1A] leading-none"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {year}
          </h1>
          <p className="text-[#888888] mt-2 text-sm">
            {memories.length === 0
              ? "Aucun souvenir pour cette année"
              : `${memories.length} ${memories.length === 1 ? "souvenir" : "souvenirs"}`}
          </p>
        </div>

        {/* Prev / Next year */}
        <div className="flex items-center gap-3">
          {adjacent.prev && (
            <Link
              href={`/timeline/${adjacent.prev}`}
              className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors px-3 py-2 rounded-xl hover:bg-[#F4B8C1]/10"
            >
              <ArrowLeft size={14} />
              {adjacent.prev}
            </Link>
          )}
          {adjacent.next && (
            <Link
              href={`/timeline/${adjacent.next}`}
              className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-[#C9748A] transition-colors px-3 py-2 rounded-xl hover:bg-[#F4B8C1]/10"
            >
              {adjacent.next}
              <ArrowRight size={14} />
            </Link>
          )}
          <Link
            href={`/memory/new?year=${year}`}
            className="flex items-center gap-2 bg-[#C9748A] hover:bg-[#b5637a] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Memories story layout */}
      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-[#888888]">Pas encore de souvenirs pour {year}.</p>
          <Link
            href={`/memory/new?year=${year}`}
            className="text-sm text-[#C9748A] hover:underline"
          >
            Ajouter le premier
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {memories.map((memory, i) => (
            <div key={memory.id}>
              <MemoryStoryRow memory={memory} index={i} />
              {i < memories.length - 1 && (
                <div className="flex items-center gap-4 my-12 px-2">
                  <div className="flex-1 h-px bg-[#F4B8C1]/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F4B8C1]" />
                  <div className="flex-1 h-px bg-[#F4B8C1]/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
