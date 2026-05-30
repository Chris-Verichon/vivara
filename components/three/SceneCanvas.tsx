"use client"

import { Canvas } from "@react-three/fiber"
import { AdaptiveDpr, Preload } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import { Suspense } from "react"
import type { DeviceTier } from "@/lib/device"
import { NIGHT_COLORS, getSceneTuning } from "./constellation"

interface SceneCanvasProps {
  tier: DeviceTier
  children: React.ReactNode
  /** Initial camera position. */
  cameraPosition?: [number, number, number]
  cameraFov?: number
  /** Distance at which the night fog fully obscures objects. */
  fogFar?: number
  className?: string
}

/**
 * Shared React Three Fiber canvas configured for the nocturnal constellation:
 * deep fog, capped DPR, adaptive performance, and a tier-aware bloom pass.
 * Scene content is provided as children.
 */
export function SceneCanvas({
  tier,
  children,
  cameraPosition = [0, 0, 12],
  cameraFov = 55,
  fogFar = 60,
  className,
}: SceneCanvasProps) {
  const tuning = getSceneTuning(tier)

  return (
    <Canvas
      className={className}
      dpr={[1, tuning.maxDpr]}
      gl={{ antialias: tuning.maxDpr < 2, powerPreference: "high-performance", alpha: false }}
      camera={{ position: cameraPosition, fov: cameraFov, near: 0.1, far: 200 }}
      onCreated={({ scene }) => {
        scene.background = null
      }}
    >
      <color attach="background" args={[NIGHT_COLORS.nightDeep]} />
      <fog attach="fog" args={[NIGHT_COLORS.night, 14, fogFar]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 6, 10]} intensity={40} color={NIGHT_COLORS.starRose} />

      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>

      {tuning.bloom && (
        <EffectComposer enableNormalPass={false}>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.25} darkness={0.85} />
        </EffectComposer>
      )}

      <AdaptiveDpr pixelated={false} />
    </Canvas>
  )
}
