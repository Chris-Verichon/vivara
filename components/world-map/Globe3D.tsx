"use client"

import { useEffect, useMemo, useState } from "react"
import { OrbitControls } from "@react-three/drei"
import type { ThreeEvent } from "@react-three/fiber"
import ThreeGlobe from "three-globe"
import { feature } from "topojson-client"
import type { Topology, GeometryCollection } from "topojson-specification"
import type { Feature } from "geojson"
import { MeshPhongMaterial, Color, type Object3D } from "three"
import { SceneCanvas } from "@/components/three/SceneCanvas"
import { Starfield } from "@/components/three/Starfield"
import { NIGHT_COLORS, getSceneTuning } from "@/components/three/constellation"
import { alpha2ToNumeric } from "@/lib/iso-countries"
import type { DeviceTier } from "@/lib/device"

const GEO_URL = "/world-110m.json"
const GLOBE_SCALE = 0.045

export type GlobeCountry = {
  code: string
  name: string
  count: number
}

interface Globe3DProps {
  tier: DeviceTier
  countries: GlobeCountry[]
  onSelect: (code: string) => void
}

/**
 * Interactive nocturnal globe wrapped in a rose atmosphere. Every country is an
 * outlined polygon; those that hold a memory are filled in rose and are directly
 * clickable. The camera orbits freely (drag) and drifts on its own.
 */
export function Globe3D({ tier, countries, onSelect }: Globe3DProps) {
  const tuning = getSceneTuning(tier)

  return (
    <SceneCanvas
      tier={tier}
      cameraPosition={[0, 0, 11]}
      cameraFov={52}
      className="h-full w-full"
    >
      <Starfield count={tuning.ambientStars} />
      <GlobeScene countries={countries} onSelect={onSelect} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        autoRotate
        autoRotateSpeed={0.35}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        minDistance={6.5}
        maxDistance={16}
      />
    </SceneCanvas>
  )
}

interface GlobeSceneProps {
  countries: GlobeCountry[]
  onSelect: (code: string) => void
}

/** Shape three-globe stamps onto each polygon Object3D via its data binding. */
type PolygonObject = Object3D & { __data?: { data?: Feature } }

function GlobeScene({ countries, onSelect }: GlobeSceneProps) {
  const [features, setFeatures] = useState<Feature[]>([])

  // numeric ISO id -> alpha-2 code, for visited countries only.
  const numericToCode = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of countries) {
      const num = alpha2ToNumeric[c.code]
      if (num) map.set(String(Number(num)), c.code)
    }
    return map
  }, [countries])

  // The three-globe instance is created once; data is loaded asynchronously.
  const globe = useMemo(() => {
    const g = new ThreeGlobe()
    g.showGlobe(true)
    g.showAtmosphere(true)
    g.atmosphereColor(NIGHT_COLORS.starRose)
    g.atmosphereAltitude(0.15)

    const mat = g.globeMaterial() as MeshPhongMaterial
    mat.color = new Color("#0d0b1a")
    mat.emissive = new Color("#0a0916")
    mat.emissiveIntensity = 0.25
    mat.shininess = 0.6

    // All countries are drawn as filled polygons (earcut triangulation). We
    // deliberately avoid three-globe's hex layer: h3-js polygonToCells throws
    // on pole-wrapping / antimeridian-crossing countries (Antarctica, Fiji,
    // Russia...), which aborts the whole render. Faint caps outline every
    // country (so Europe & co. stay visible); the colours are refined per
    // feature in the data effect below.
    g.showGraticules(false)
    g.polygonStrokeColor(() => "rgba(253, 246, 236, 0.28)")
    return g
  }, [])

  // Load countries topology, convert to GeoJSON features.
  useEffect(() => {
    let cancelled = false
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        const topo = json as unknown as Topology
        const collection = feature(
          topo,
          topo.objects.countries as GeometryCollection
        )
        setFeatures(collection.features as Feature[])
      })
      .catch(() => {
        if (!cancelled) setFeatures([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Feed the globe: every country as a polygon. Visited ones glow rose and sit
  // slightly higher; the rest stay as faint outlined fills so the whole world
  // is readable. Colour/altitude accessors are (re)bound here because they
  // depend on which countries are visited.
  useEffect(() => {
    if (features.length === 0) return
    const isVisited = (f: Feature) =>
      f.id != null && numericToCode.has(String(f.id))

    globe
      .polygonCapColor((d) =>
        isVisited(d as Feature)
          ? "rgba(244, 184, 193, 0.92)"
          : "rgba(120, 112, 160, 0.16)"
      )
      .polygonSideColor((d) =>
        isVisited(d as Feature)
          ? "rgba(201, 116, 138, 0.85)"
          : "rgba(120, 112, 160, 0.05)"
      )
      .polygonAltitude((d) => (isVisited(d as Feature) ? 0.014 : 0.006))
      .polygonsData(features)
  }, [globe, features, numericToCode])

  // Resolve which visited country (if any) was clicked.
  const resolveCode = (object: Object3D | null): string | null => {
    let node: Object3D | null = object
    while (node) {
      const data = (node as PolygonObject).__data?.data
      if (data?.id != null) {
        return numericToCode.get(String(data.id)) ?? null
      }
      node = node.parent
    }
    return null
  }

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const code = resolveCode(e.object)
    if (code) {
      e.stopPropagation()
      onSelect(code)
    }
  }

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    document.body.style.cursor = resolveCode(e.object) ? "pointer" : "auto"
  }

  const handleOut = () => {
    document.body.style.cursor = "auto"
  }

  return (
    <group scale={GLOBE_SCALE}>
      <primitive
        object={globe}
        onClick={handleClick}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
      />
    </group>
  )
}
