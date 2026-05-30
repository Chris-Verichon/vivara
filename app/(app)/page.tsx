import { createClient } from "@/lib/supabase/server"
import { ConstellationHero, type HeroMemory } from "@/components/home/ConstellationHero"
import { SmoothScrollProvider } from "@/components/three/SmoothScrollProvider"
import Link from "next/link"
import { Clock, Globe, ImageIcon } from "lucide-react"
import { formatMemoryDate } from "@/lib/utils"

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
    .limit(60)

  const config: Record<string, string> = {}
  configRows?.forEach(({ key, value }) => {
    if (value) config[key] = value
  })

  const memories = (memoriesResult.data ?? []) as HeroMemory[]
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
  const recent = memories.slice(0, 3)

  return (
    <SmoothScrollProvider>
      {/* Immersive nocturnal constellation hero (fixed 3D backdrop) */}
      <ConstellationHero
        memories={memories}
        ownerName={ownerName}
        welcomeMessage={welcomeMessage}
      />

      {/* Content below the fold — floats over the constellation */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-14 px-6 py-20">
        <section className="flex flex-col items-center gap-2 text-center">
          <h2
            className="text-3xl leading-tight text-[#fdf6ec] md:text-4xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {welcomeMessage}, <span className="text-[#F4B8C1]">{ownerName}</span>
          </h2>
          <p className="text-base text-[#fdf6ec]/60">
            Votre journal de vie, pour toujours.
          </p>
        </section>

        {/* Entry cards */}
        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {ENTRY_CARDS.map(({ href, Icon, label, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-colors duration-200 hover:border-[#F4B8C1]/40 hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4B8C1]/15 transition-colors group-hover:bg-[#F4B8C1]/30">
                  <Icon size={20} className="text-[#F4B8C1]" />
                </div>
                <div>
                  <p
                    className="font-medium text-[#fdf6ec]"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {label}
                  </p>
                  <p className="mt-1 text-sm leading-snug text-[#fdf6ec]/55">
                    {description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Last 3 memories */}
        {recent.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2
              className="text-xl text-[#fdf6ec]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Derniers souvenirs
            </h2>
            <div className="flex flex-col gap-3">
              {recent.map((memory) => (
                <Link
                  key={memory.id}
                  href={`/memory/${memory.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-colors duration-200 hover:border-[#F4B8C1]/40 hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p
                      className="truncate font-medium text-[#fdf6ec]"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {memory.title}
                    </p>
                    <p className="mt-0.5 text-sm text-[#fdf6ec]/55">
                      {formatMemoryDate(memory.memory_date)}
                      {memory.country_name && ` · ${memory.country_name}`}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg text-[#F4B8C1]">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </SmoothScrollProvider>
  )
}
