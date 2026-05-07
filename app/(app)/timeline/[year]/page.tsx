import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Plus, MapPin, Calendar } from "lucide-react"
import { formatMemoryDate } from "@/lib/utils"
import type { Memory } from "@/lib/types"

type MemoryPreview = Pick<
  Memory,
  "id" | "title" | "description" | "memory_date" | "country_name"
>

type Props = {
  params: Promise<{ year: string }>
}

async function getYearData(year: number) {
  const supabase = await createClient()

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data, error } = await supabase
    .from("memories")
    .select("id, title, description, memory_date, country_name")
    .gte("memory_date", startDate)
    .lte("memory_date", endDate)
    .order("memory_date", { ascending: true })

  if (error) return null
  return (data ?? []) as MemoryPreview[]
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
            href="/memories/new"
            className="flex items-center gap-2 bg-[#C9748A] hover:bg-[#b5637a] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={15} />
            Ajouter
          </Link>
        </div>
      </div>

      {/* Memories grid */}
      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-[#888888]">Pas encore de souvenirs pour {year}.</p>
          <Link
            href="/memories/new"
            className="text-sm text-[#C9748A] hover:underline"
          >
            Ajouter le premier
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memories.map((memory) => (
            <Link
              key={memory.id}
              href={`/memories/${memory.id}`}
              className="group rounded-2xl bg-white border border-black/5 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col gap-3 hover:shadow-[0_4px_32px_rgba(201,116,138,0.18)] transition-shadow duration-200"
            >
              {/* Type badge */}
              <span className="text-[10px] uppercase tracking-widest text-[#C9748A] font-medium">
                souvenir
              </span>

              {/* Title */}
              <h2
                className="text-base font-medium text-[#1A1A1A] leading-snug group-hover:text-[#C9748A] transition-colors line-clamp-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {memory.title}
              </h2>

              {/* Description excerpt */}
              {memory.description && (
                <p className="text-sm text-[#888888] leading-relaxed line-clamp-3">
                  {memory.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 mt-auto pt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-[#AAAAAA]">
                  <Calendar size={11} />
                  {formatMemoryDate(memory.memory_date)}
                </span>
                {memory.country_name && (
                  <span className="flex items-center gap-1 text-xs text-[#AAAAAA]">
                    <MapPin size={11} />
                    {memory.country_name}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
