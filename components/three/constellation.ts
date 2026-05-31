// Shared colour + tuning constants for the immersive constellation scenes.
// Mirrors the CSS nocturnal tokens in app/globals.css so three.js materials and
// HTML overlays stay visually consistent.

import type { DeviceTier } from "@/lib/device"

export const NIGHT_COLORS = {
  night: "#0b0a14",
  nightDeep: "#060510",
  nightRose: "#1a0f1c",
  star: "#fdf6ec",
  starRose: "#f4b8c1",
  starGold: "#d4b896",
  roseDark: "#c9748a",
} as const

export interface SceneTuning {
  /** Ambient background star count. */
  ambientStars: number
  /** Drifting particle count. */
  particles: number
  /** Whether to enable the postprocessing bloom pass. */
  bloom: boolean
  /** Max device pixel ratio for the canvas. */
  maxDpr: number
}

export function getSceneTuning(tier: DeviceTier): SceneTuning {
  switch (tier) {
    case "high":
      return { ambientStars: 2600, particles: 140, bloom: true, maxDpr: 2 }
    case "low":
      return { ambientStars: 900, particles: 50, bloom: false, maxDpr: 1.5 }
    default:
      return { ambientStars: 0, particles: 0, bloom: false, maxDpr: 1 }
  }
}
