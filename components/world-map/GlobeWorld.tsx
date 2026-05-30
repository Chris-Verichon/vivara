"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { useWebGLSupport } from "@/components/three/useWebGLSupport"
import { WorldMap } from "./WorldMap"
import { CountryDrawer } from "./CountryDrawer"
import type { Memory } from "@/lib/types"

const Globe3D = dynamic(
  () => import("./Globe3D").then((m) => m.Globe3D),
  { ssr: false }
)

export type WorldCountry = {
  code: string
  name: string
  count: number
  memories: Memory[]
  centroid: [number, number]
}

interface Props {
  countriesData: WorldCountry[]
}

/**
 * World view that renders an interactive 3D globe when WebGL is available, and
 * gracefully falls back to the 2D map on unsupported / low-tier devices.
 * Clicking a country (a memory star) opens the nocturnal country drawer.
 */
export function GlobeWorld({ countriesData }: Props) {
  const { ready, enabled, tier } = useWebGLSupport()
  const [selected, setSelected] = useState<string | null>(null)

  const byCode = useMemo(() => {
    const map = new Map<string, WorldCountry>()
    for (const c of countriesData) map.set(c.code, c)
    return map
  }, [countriesData])

  const selectedCountry = selected ? byCode.get(selected) ?? null : null

  // Before client detection resolves, render a quiet placeholder to avoid
  // layout shift and hydration mismatch.
  if (!ready) {
    return (
      <div className="w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl bg-[#060510] border border-white/10" />
    )
  }

  if (!enabled) {
    return <WorldMap countriesData={countriesData} />
  }

  return (
    <>
      <div className="w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden bg-[#060510] border border-white/10">
        <Globe3D
          tier={tier}
          countries={countriesData.map((c) => ({
            code: c.code,
            name: c.name,
            count: c.count,
          }))}
          onSelect={setSelected}
        />
      </div>

      {selectedCountry && (
        <CountryDrawer
          countryName={selectedCountry.name}
          memories={selectedCountry.memories}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
