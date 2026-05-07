import { createClient } from "@/lib/supabase/server"
import { RopeTimeline } from "@/components/timeline/RopeTimeline"
import Link from "next/link"
import { Plus } from "lucide-react"

async function getTimelineData() {
  const supabase = await createClient()

  const [memoriesResult, configResult] = await Promise.all([
    supabase.from("memories").select("memory_date"),
    supabase.from("site_config").select("key, value"),
  ])

  const config: Record<string, string> = {}
  configResult.data?.forEach(({ key, value }) => {
    if (value) config[key] = value
  })

  const currentYear = new Date().getFullYear()
  const birthYear = config["birth_year"]
    ? parseInt(config["birth_year"])
    : currentYear - 10

  const yearsWithMemories = new Set<number>(
    (memoriesResult.data ?? []).map((m: { memory_date: string }) =>
      new Date(m.memory_date).getFullYear()
    )
  )

  const nodes = []
  for (let year = birthYear; year <= currentYear; year++) {
    nodes.push({ year, hasMemories: yearsWithMemories.has(year) })
  }

  return { nodes }
}

export default async function TimelinePage() {
  const { nodes } = await getTimelineData()
  const yearsWithMemories = nodes.filter((n) => n.hasMemories).length

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      {/* En-tête */}
      <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-black/5 shrink-0">
        <div>
          <h1
            className="text-2xl text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ma Vie
          </h1>
          <p className="text-sm text-[#888888] mt-0.5">
            {nodes.length} années · {yearsWithMemories} avec des souvenirs
          </p>
        </div>
        <Link
          href="/memory/new"
          className="flex items-center gap-2 bg-[#C9748A] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#b5637a] transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </Link>
      </div>

      {/* Corde interactive */}
      <div className="flex-1 overflow-hidden">
        <RopeTimeline nodes={nodes} />
      </div>

      {/* Légende */}
      <div className="flex items-center gap-6 px-6 py-3 border-t border-black/5 text-xs text-[#888888] shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D4B896] border border-[#8B5E3C] inline-block" />
          Année vide
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C9748A] border border-[#8B5E3C] inline-block" />
          Souvenirs
        </span>
        <span className="ml-auto hidden sm:block">
          Molette pour zoomer · Glisser pour naviguer · Clic droit sur un nœud pour ajouter
        </span>
      </div>
    </div>
  )
}

