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
import type { Memory } from "@/lib/types"

const GEO_URL = "/world-110m.json"

type CountryStat = {
  code: string
  name: string
  count: number
  memories: Memory[]
  centroid: [number, number]
}

// Approximate centroids for countries (lon, lat)
const CENTROIDS: Record<string, [number, number]> = {
  FR: [2.2, 46.2], US: [-96, 38], GB: [-2, 54], DE: [10.4, 51.2],
  IT: [12.6, 42.8], ES: [-3.7, 40.4], JP: [138, 36.2], CN: [104, 35],
  AU: [133, -27], BR: [-51, -14.2], CA: [-96, 60], RU: [100, 60],
  IN: [79, 22], MX: [-102, 24], AR: [-64, -34], ZA: [25, -29],
  NG: [8, 10], KE: [37.9, 0.02], MA: [-6, 32], EG: [30, 26],
  TH: [101, 15], VN: [108, 16], ID: [120, -4], PH: [122, 13],
  TR: [35, 39], SA: [44, 24], AE: [54, 24], SG: [104, 1.3],
  HK: [114, 22.4], TW: [121, 24], KR: [128, 36], PT: [-8, 39.6],
  BE: [4.5, 50.5], NL: [5.3, 52.1], CH: [8.2, 46.8], AT: [14.5, 47.5],
  SE: [18, 62], NO: [10, 62], DK: [10, 56], FI: [27, 64], PL: [20, 52],
  CZ: [15.5, 49.8], HU: [19, 47], RO: [25, 46], GR: [22, 39],
  HR: [15.5, 45.1], RS: [21, 44], SK: [19, 48.7], SI: [14.8, 46.1],
  BG: [25, 43], UA: [32, 49], BY: [28, 53.5], LT: [24, 56],
  LV: [25, 57], EE: [25, 59], IS: [-18, 65], IE: [-8, 53],
  NZ: [172, -42], CL: [-71, -35], PE: [-76, -10], CO: [-74, 4],
  VE: [-66, 8], EC: [-78, -2], BO: [-64, -17], PY: [-58, -23],
  UY: [-56, -33], TN: [9, 34], DZ: [3, 28], LY: [17, 27],
  SD: [30, 16], ET: [40, 9], GH: [-2, 8], CI: [-6, 8],
  CM: [12.5, 6], SN: [-14, 14], ML: [-2, 17], NE: [8.1, 17],
  TZ: [35, -6], MZ: [35, -18], ZM: [28, -15], ZW: [30, -20],
  AO: [18, -12], MG: [47, -20], PK: [70, 30], BD: [90, 24],
  LK: [81, 8], MM: [97, 18], NP: [84, 28], KZ: [67, 49],
  UZ: [63, 42], AZ: [47.6, 40.3], GE: [43.4, 42.3], AM: [45, 40],
  IQ: [44, 33], IR: [53, 33], SY: [38, 35], JO: [36, 31],
  LB: [35.5, 33.9], IL: [34.8, 31.5], PS: [35.2, 31.9],
  KW: [47.5, 29.3], QA: [51.2, 25.4], BH: [50.5, 26.2],
  OM: [57, 22], YE: [48, 16], AF: [67, 34], TM: [58, 40],
  TJ: [71, 39], KG: [75, 42], MN: [103, 47], LA: [103, 18],
  KH: [105, 12], MY: [110, 4], BN: [115, 4.5],
  PG: [145, -7], FJ: [178, -18], WS: [-172, -14],
  TO: [-175, -20], VU: [167, -16], SB: [160, -9],
  CU: [-79, 22], DO: [-70.1, 18.7], HT: [-72.3, 19],
  JM: [-77.3, 18.1], PR: [-66.6, 18.2], TT: [-61.2, 10.7],
  GT: [-90.2, 15.8], BZ: [-88.5, 17.2], HN: [-87, 15],
  SV: [-88.9, 13.8], NI: [-85.2, 13], CR: [-84, 10], PA: [-80, 9],
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
      <div className="w-full rounded-2xl overflow-hidden border border-black/8 bg-[#e8f4f8] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
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
            <rect x="-400" y="-225" width="1600" height="900" fill="#e8f4f8" />

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
                            : "#d1ccc5",
                          stroke: "#FAF7F2",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: isHighlighted ? "pointer" : "default",
                          transition: "fill 0.2s",
                        },
                        hover: {
                          fill: isHighlighted ? "#C9748A" : "#d1ccc5",
                          stroke: "#FAF7F2",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: isHighlighted ? "pointer" : "default",
                        },
                        pressed: {
                          fill: isHighlighted ? "#b5637a" : "#d1ccc5",
                          stroke: "#FAF7F2",
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
                    stroke="white"
                    strokeWidth={1.5}
                    style={{ cursor: "pointer", transition: "r 0.15s" }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: "7px",
                      fill: "white",
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
          className="w-8 h-8 rounded-lg bg-white shadow border border-black/10 text-[#888888] hover:text-[#C9748A] transition-colors font-medium text-lg flex items-center justify-center"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z / 1.5, 1))}
          className="w-8 h-8 rounded-lg bg-white shadow border border-black/10 text-[#888888] hover:text-[#C9748A] transition-colors font-medium text-lg flex items-center justify-center"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setCenter([0, 20]) }}
          className="w-8 h-8 rounded-lg bg-white shadow border border-black/10 text-[#888888] hover:text-[#C9748A] transition-colors text-xs flex items-center justify-center"
          title="Réinitialiser"
        >
          ↺
        </button>
      </div>

      {/* Country legend / hint */}
      {countriesData.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-[#888888] text-sm">
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
