import { createClient } from "@/lib/supabase/server"
import { FlowerHero } from "@/components/hero/FlowerHero"
import Link from "next/link"
import { Clock, Globe, ImageIcon } from "lucide-react"
import { formatMemoryDate } from "@/lib/utils"
import type { Memory } from "@/lib/types"

type MemoryPreview = Pick<Memory, "id" | "title" | "memory_date" | "country_name">

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getHomeData() {
  const supabase = await createClient()

  const { data: configRows } = await supabase.from("site_config").select("key, value")
  const memoriesResult = await supabase
    .from("memories")
    .select("id, title, memory_date, country_name")
    .order("memory_date", { ascending: false })
    .limit(3)

  const config: Record<string, string> = {}
  configRows?.forEach(({ key, value }) => {
    if (value) config[key] = value
  })

  const memories = (memoriesResult.data ?? []) as MemoryPreview[]
  return { config, memories }
}

// ---------------------------------------------------------------------------
// Entry cards — static navigation shortcuts
// ---------------------------------------------------------------------------

const ENTRY_CARDS = [
  {
    href: "/timeline",
    Icon: Clock,
    label: "Timeline",
    description: "Parcourez vos souvenirs dans l'ordre du temps",
  },
  {
    href: "/world",
    Icon: Globe,
    label: "Carte du monde",
    description: "Découvrez les endroits qui ont marqué votre vie",
  },
  {
    href: "/gallery",
    Icon: ImageIcon,
    label: "Galerie",
    description: "Toutes vos photos et vidéos au même endroit",
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
  const { config, memories } = await getHomeData()
  const ownerName = config["owner_name"] ?? "Vivàra"
  const welcomeMessage = config["welcome_message"] ?? "Bienvenue"

  return (
    <>
      {/* Full-viewport flower video hero */}
      <FlowerHero />

      {/* Content below the fold */}
      <div className="max-w-4xl mx-auto px-6 py-16 flex flex-col gap-14">
        {/* Section title */}
        <section className="text-center flex flex-col items-center gap-2">
          <h1
            className="text-3xl md:text-4xl text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {welcomeMessage},{" "}
            <span className="text-[#C9748A]">{ownerName}</span>
          </h1>
          <p className="text-[#888888] text-base">
            Votre journal de vie, pour toujours.
          </p>
        </section>

        {/* Entry cards */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ENTRY_CARDS.map(({ href, Icon, label, description }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl bg-white border border-[#F4B8C1]/20 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col gap-3 hover:shadow-[0_4px_32px_rgba(201,116,138,0.18)] transition-shadow duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4B8C1]/20 flex items-center justify-center group-hover:bg-[#F4B8C1]/40 transition-colors">
                  <Icon size={20} className="text-[#C9748A]" />
                </div>
                <div>
                  <p
                    className="font-medium text-[#1A1A1A]"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {label}
                  </p>
                  <p className="text-sm text-[#888888] mt-1 leading-snug">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Last 3 memories */}
        {memories.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2
              className="text-xl text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Derniers souvenirs
            </h2>
            <div className="flex flex-col gap-3">
              {memories.map((memory) => (
                <Link
                  key={memory.id}
                  href={`/memories/${memory.id}`}
                  className="rounded-2xl bg-white border border-[#F4B8C1]/20 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4 hover:shadow-[0_4px_32px_rgba(201,116,138,0.18)] transition-shadow duration-200"
                >
                  <div className="min-w-0">
                    <p
                      className="font-medium text-[#1A1A1A] truncate"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {memory.title}
                    </p>
                    <p className="text-sm text-[#888888] mt-0.5">
                      {formatMemoryDate(memory.memory_date)}
                      {memory.country_name && ` · ${memory.country_name}`}
                    </p>
                  </div>
                  <span className="text-[#F4B8C1] shrink-0 text-lg">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
