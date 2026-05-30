import { createClient } from "@/lib/supabase/server"
import { ConstellationTimeline } from "@/components/timeline/ConstellationTimeline"
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
    <div className="flex h-[calc(100vh-65px)] flex-col bg-night">
      {/* En-tête */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4 md:px-8">
        <div>
          <h1
            className="text-2xl text-[#fdf6ec]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Ma Vie
          </h1>
          <p className="mt-0.5 text-sm text-[#fdf6ec]/55">
            {nodes.length - 1} années · {yearsWithMemories} avec des souvenirs
          </p>
        </div>
        <Link
          href="/memory/new"
          className="flex items-center gap-2 rounded-xl bg-[#C9748A] px-4 py-2 text-sm text-white transition-colors hover:bg-[#b5637a]"
        >
          <Plus size={16} />
          Ajouter
        </Link>
      </div>

      {/* Corde lumineuse immersive */}
      <div className="flex-1 overflow-hidden">
        <ConstellationTimeline nodes={nodes} />
      </div>

      {/* Légende */}
      <div className="flex shrink-0 items-center gap-6 border-t border-white/10 px-6 py-3 text-xs text-[#fdf6ec]/55">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#D4B896]" />
          Année vide
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#C9748A]" />
          Souvenirs
        </span>
        <span className="ml-auto hidden sm:block">
          Défiler pour naviguer · Clic sur une année · Clic droit pour ajouter
        </span>
      </div>
    </div>
  )
}

