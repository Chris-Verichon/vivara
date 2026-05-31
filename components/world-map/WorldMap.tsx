"use client"

import { useState, useCallback } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
  type GeoFeature,
  type GeographiesChildrenProps,
} from "react-simple-maps"
import { CountryDrawer } from "./CountryDrawer"
import { alpha2ToNumeric } from "@/lib/iso-countries"
import { CENTROIDS } from "@/lib/centroids"
import type { Memory } from "@/lib/types"

const GEO_URL = "/world-110m.json"

type CountryStat = {
  code: string
  name: string
  count: number
  memories: Memory[]
  centroid: [number, number]
}

interface Props {
  countriesData: CountryStat[]
}

export function WorldMap({ countriesData }: Props) {
  const [selected, setSelected] = useState<CountryStat | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([0, 20])

  // Build a Set of numeric IDs for highlighted countries
  const highlightedNumerics = new Set(
    countriesData.map((c) => alpha2ToNumeric[c.code]).filter(Boolean)
  )
  const countryByNumeric = new Map(
    countriesData.map((c) => [alpha2ToNumeric[c.code], c])
  )

  const handleCountryClick = useCallback(
    (geoId: string) => {
      const stat = countryByNumeric.get(geoId)
      if (stat) setSelected(stat)
    },
    [countryByNumeric]
  )

  return (
    <div className="relative w-full">
      {/* Map container */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#060510] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 10] }}
          style={{ width: "100%", height: "auto" }}
          width={800}
          height={450}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={({ zoom: z, coordinates }: { zoom: number; coordinates: [number, number] }) => {
              setZoom(z)
              setCenter(coordinates)
            }}
          >
            {/* Ocean background */}
            <rect x="-400" y="-225" width="1600" height="900" fill="#060510" />

            <Geographies geography={GEO_URL}>
              {({ geographies }: GeographiesChildrenProps) =>
                geographies.map((geo: GeoFeature) => {
                  const geoId = String(geo.id)
                  const isHighlighted = highlightedNumerics.has(geoId)
                  const isHovered = hovered === geoId
                  const stat = countryByNumeric.get(geoId)

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(geoId)}
                      onMouseEnter={() => isHighlighted && setHovered(geoId)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        default: {
                          fill: isHighlighted
                            ? isHovered
                              ? "#C9748A"
                              : "#F4B8C1"
                            : "#1c1a2b",
                          stroke: "#0b0a14",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: isHighlighted ? "pointer" : "default",
                          transition: "fill 0.2s",
                        },
                        hover: {
                          fill: isHighlighted ? "#C9748A" : "#1c1a2b",
                          stroke: "#0b0a14",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: isHighlighted ? "pointer" : "default",
                        },
                        pressed: {
                          fill: isHighlighted ? "#b5637a" : "#1c1a2b",
                          stroke: "#0b0a14",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {/* Bubble markers for highlighted countries */}
            {countriesData.map((stat) => {
              const coord = CENTROIDS[stat.code]
              if (!coord) return null
              const isActive = hovered === alpha2ToNumeric[stat.code]

              return (
                <Marker
                  key={stat.code}
                  coordinates={coord}
                  onClick={() => setSelected(stat)}
                >
                  <circle
                    r={isActive ? 10 : 8}
                    fill="#C9748A"
                    stroke="#fdf6ec"
                    strokeWidth={1.5}
                    style={{ cursor: "pointer", transition: "r 0.15s" }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: "7px",
                      fill: "#fdf6ec",
                      fontWeight: "bold",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {stat.count}
                  </text>
                </Marker>
              )
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.5, 12))}
          className="w-8 h-8 rounded-lg bg-[#0b0a14]/80 backdrop-blur-md border border-white/10 text-[#fdf6ec]/70 hover:text-[#F4B8C1] transition-colors font-medium text-lg flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="w-8 h-8 rounded-lg bg-[#0b0a14]/80 backdrop-blur-md border border-white/10 text-[#fdf6ec]/70 hover:text-[#F4B8C1] transition-colors font-medium text-lg flex items-center justify-center"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([0, 20]) }}
          className="w-8 h-8 rounded-lg bg-[#0b0a14]/80 backdrop-blur-md border border-white/10 text-[#fdf6ec]/70 hover:text-[#F4B8C1] transition-colors text-xs flex items-center justify-center"
          title="Réinitialiser"
        >
          ↺
        </button>
      </div>

      {/* Country legend / hint */}
      {countriesData.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-[#fdf6ec]/55 text-sm">
          Aucun souvenir avec un pays renseigné.
        </p>
      )}

      {/* Drawer */}
      {selected && (
        <CountryDrawer
          countryName={selected.name}
          memories={selected.memories}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
