"use client"

import { useSyncExternalStore } from "react"
import { getDeviceTier, type DeviceTier } from "@/lib/device"

export interface WebGLState {
  /** Whether detection has run on the client. Avoids SSR/hydration mismatch. */
  ready: boolean
  /** Device capability tier. "none" => render the 2D fallback. */
  tier: DeviceTier
  /** Convenience flag: should we render the immersive 3D scene? */
  enabled: boolean
}

// Stable server snapshot — keeps SSR output deterministic (no WebGL on server).
const SERVER_STATE: WebGLState = { ready: false, tier: "none", enabled: false }

// Cached client snapshot — computed once so getSnapshot stays referentially
// stable (required by useSyncExternalStore to avoid render loops).
let clientState: WebGLState | null = null

function getClientSnapshot(): WebGLState {
  if (!clientState) {
    const tier = getDeviceTier()
    clientState = { ready: true, tier, enabled: tier !== "none" }
  }
  return clientState
}

function getServerSnapshot(): WebGLState {
  return SERVER_STATE
}

// No live subscription: capabilities are detected once on mount.
const subscribe = () => () => {}

/**
 * Detects WebGL support and a rough device tier on the client only.
 * Returns the stable server state during SSR/hydration, then the detected
 * client state. Use `enabled` to decide between the 3D scene and the fallback.
 */
export function useWebGLSupport(): WebGLState {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
