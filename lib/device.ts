// Lightweight client-side capability detection for the immersive 3D layer.
// Used to decide whether to render the full WebGL constellation or fall back
// to the existing 2D experience.

export type DeviceTier = "high" | "low" | "none"

/** Returns true when the browser can create a WebGL context. */
export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    return Boolean(gl)
  } catch {
    return false
  }
}

/** Whether the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Rough device capability tier for tuning scene density / postprocessing. */
export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "none"
  if (!hasWebGL() || prefersReducedMotion()) return "none"

  const nav = window.navigator as Navigator & {
    deviceMemory?: number
    hardwareConcurrency?: number
  }

  const memory = nav.deviceMemory ?? 4
  const cores = nav.hardwareConcurrency ?? 4
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 768

  // Treat low-memory, low-core, or small touch devices as "low" tier so we can
  // reduce particle counts and skip heavy postprocessing.
  if (memory <= 4 || cores <= 4 || (coarsePointer && smallScreen)) {
    return "low"
  }

  return "high"
}
