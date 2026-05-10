import { createClient } from "@/lib/supabase/server"
import { WorldMap } from "@/components/world-map/WorldMap"
import type { Memory } from "@/lib/types"

type CountryRow = {
  country_code: string
  country_name: string
}

async function getMemoriesByCountry() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("memories")
    .select("id, user_id, title, description, memory_date, country_code, country_name, tags, created_at, updated_at")
    .not("country_code", "is", null)
    .order("memory_date", { ascending: false })

  if (error || !data) return []
  return data as Memory[]
}

export default async function WorldPage() {
  const memories = await getMemoriesByCountry()

  // Group by country
  const countryMap = new Map<
    string,
    { code: string; name: string; memories: Memory[] }
  >()

  for (const memory of memories) {
    if (!memory.country_code || !memory.country_name) continue
    const existing = countryMap.get(memory.country_code)
    if (existing) {
      existing.memories.push(memory)
    } else {
      countryMap.set(memory.country_code, {
        code: memory.country_code,
        name: memory.country_name,
        memories: [memory],
      })
    }
  }

  const countriesData = [...countryMap.values()].map((c) => ({
    ...c,
    count: c.memories.length,
    centroid: [0, 0] as [number, number], // centroids handled client-side
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1
          className="text-4xl md:text-5xl text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Carte du monde
        </h1>
        <p className="mt-2 text-[#888888] text-sm">
          {countriesData.length === 0
            ? "Renseigne un pays sur tes souvenirs pour les voir apparaître ici."
            : `${countriesData.length} pays visité${countriesData.length > 1 ? "s" : ""} · ${memories.length} souvenir${memories.length > 1 ? "s" : ""}`}
        </p>
      </div>

      <WorldMap countriesData={countriesData} />

      {/* Country list below map */}
      {countriesData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
          {countriesData
            .sort((a, b) => b.count - a.count)
            .map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-black/8 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                <span className="text-sm text-[#1A1A1A] truncate">{c.name}</span>
                <span className="ml-2 shrink-0 text-xs font-semibold text-[#C9748A] bg-[#F4B8C1]/20 px-2 py-0.5 rounded-full">
                  {c.count}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
