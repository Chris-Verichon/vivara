import { createClient } from "@/lib/supabase/server"
import { GalleryClient } from "@/components/gallery/GalleryClient"
import type { MemoryWithMedia } from "@/lib/types"

async function getAllMemories(): Promise<MemoryWithMedia[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("memories")
    .select("*, media_files(*)")
    .order("memory_date", { ascending: false })
    .order("position", { ascending: true, referencedTable: "media_files" })

  if (error || !data) return []
  return data as unknown as MemoryWithMedia[]
}

export default async function GalleryPage() {
  const memories = await getAllMemories()

  // Derive filter options from the data
  const years = [
    ...new Set(memories.map((m) => new Date(m.memory_date).getFullYear())),
  ].sort((a, b) => b - a)

  const countriesMap = new Map<string, string>()
  for (const m of memories) {
    if (m.country_code && m.country_name) {
      countriesMap.set(m.country_code, m.country_name)
    }
  }
  const countries = [...countriesMap.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-4xl md:text-5xl text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Galerie
        </h1>
        <p className="mt-2 text-[#888888] text-sm">
          Tous les souvenirs, à travers le temps et les pays.
        </p>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
          <p className="text-[#888888]">Aucun souvenir pour l&apos;instant.</p>
        </div>
      ) : (
        <GalleryClient memories={memories} years={years} countries={countries} />
      )}
    </div>
  )
}
