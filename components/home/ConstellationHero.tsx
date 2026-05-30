"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { useFrame } from "@react-three/fiber"
import dynamic from "next/dynamic"
import { useWebGLSupport } from "@/components/three/useWebGLSupport"
import { Starfield } from "@/components/three/Starfield"
import { DriftParticles } from "@/components/three/DriftParticles"
import { MemoryStar } from "@/components/three/MemoryStar"
import { getSceneTuning, NIGHT_COLORS } from "@/components/three/constellation"
import { scrollState } from "@/components/three/scrollState"
import { FlowerHero } from "@/components/hero/FlowerHero"
import type { DeviceTier } from "@/lib/device"

// Load the canvas only on the client; three.js has no SSR output.
const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false }
)

export interface HeroMemory {
  id: string
  title: string
  memory_date: string
  country_name: string | null
}

interface ConstellationHeroProps {
  memories: HeroMemory[]
  ownerName: string
  welcomeMessage: string
}

const GOLDEN_ANGLE = 2.399963229728653
const STAR_SPACING = 5

interface PlacedStar extends HeroMemory {
  position: [number, number, number]
  phase: number
}

function placeStars(memories: HeroMemory[]): PlacedStar[] {
  return memories.map((m, i) => {
    const angle = i * GOLDEN_ANGLE
    const radius = 2.4 + (i % 5) * 0.85
    return {
      ...m,
      phase: i * 0.7,
      position: [
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.65,
        2 - i * STAR_SPACING,
      ],
    }
  })
}

// ---------------------------------------------------------------------------
// Camera rig — flies forward through the constellation as the page scrolls
// ---------------------------------------------------------------------------

function CameraRig({ depth }: { depth: number }) {
  useFrame((state) => {
    const p = scrollState.progress
    const targetZ = 14 - p * depth
    const cam = state.camera
    cam.position.z += (targetZ - cam.position.z) * 0.08
    cam.position.x += (scrollState.pointerX * 1.6 - cam.position.x) * 0.04
    cam.position.y += (scrollState.pointerY * 1.0 - cam.position.y) * 0.04
    cam.lookAt(0, 0, cam.position.z - 10)
  })
  return null
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function HeroScene({
  stars,
  tier,
  onSelect,
}: {
  stars: PlacedStar[]
  tier: DeviceTier
  onSelect: (id: string) => void
}) {
  const tuning = getSceneTuning(tier)
  const depth = stars.length * STAR_SPACING + 16

  return (
    <>
      <Starfield count={tuning.ambientStars} />
      <DriftParticles count={tuning.particles} spread={18} />
      <CameraRig depth={depth} />
      {stars.map((s) => (
        <MemoryStar
          key={s.id}
          position={s.position}
          color={NIGHT_COLORS.starRose}
          size={0.18}
          phase={s.phase}
          label={s.title}
          onSelect={() => onSelect(s.id)}
        />
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Hero (client entry point with fallback)
// ---------------------------------------------------------------------------

export function ConstellationHero({
  memories,
  ownerName,
  welcomeMessage,
}: ConstellationHeroProps) {
  const { ready, enabled, tier } = useWebGLSupport()
  const router = useRouter()
  const stars = useMemo(() => placeStars(memories), [memories])

  // No WebGL / reduced motion / weak device → keep the original 2D flower hero.
  if (ready && !enabled) {
    return <FlowerHero />
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-night">
      {/* Fixed 3D backdrop spanning the whole page */}
      {ready && enabled && (
        <div className="fixed inset-0 z-0">
          <SceneCanvas tier={tier} cameraPosition={[0, 0, 14]} fogFar={70}>
            <HeroScene
              stars={stars}
              tier={tier}
              onSelect={(id) => router.push(`/memory/${id}`)}
            />
          </SceneCanvas>
        </div>
      )}

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
        <p
          className="animate-night-fade-in text-sm uppercase tracking-[0.4em] text-[#f4b8c1]/80"
          style={{ animationDelay: "0.2s" }}
        >
          {welcomeMessage}
        </p>
        <h1
          className="animate-night-fade-in mt-4 text-5xl text-[#fdf6ec] md:text-7xl"
          style={{ fontFamily: "var(--font-playfair), serif", animationDelay: "0.4s" }}
        >
          {ownerName}
        </h1>
        <p
          className="animate-night-fade-in mt-5 max-w-md text-base text-[#fdf6ec]/70"
          style={{ animationDelay: "0.6s" }}
        >
          Votre constellation de souvenirs. Faites défiler pour voyager à travers le temps.
        </p>

        <div
          className="animate-scroll-cue absolute bottom-10 flex flex-col items-center gap-2 text-[#fdf6ec]/60"
        >
          <span className="text-xs uppercase tracking-[0.3em]">Défiler</span>
          <span className="h-10 w-px bg-gradient-to-b from-[#fdf6ec]/60 to-transparent" />
        </div>
      </div>
    </section>
  )
}
