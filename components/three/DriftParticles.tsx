"use client"

import { useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { AdditiveBlending, type Points as ThreePoints } from "three"
import { NIGHT_COLORS } from "./constellation"

interface DriftParticlesProps {
  count: number
  /** Half-size of the cubic volume particles spawn in. */
  spread?: number
  color?: string
}

/**
 * Soft drifting dust motes that float through the scene, echoing the
 * "prime radiant" particles of the original 2D timeline. Pure GPU points with
 * additive blending — cheap even at higher counts.
 */
export function DriftParticles({
  count,
  spread = 22,
  color = NIGHT_COLORS.starRose,
}: DriftParticlesProps) {
  const ref = useRef<ThreePoints>(null)

  const { positions, phases } = useMemo(() => {
    // Deterministic pseudo-random (pure) so the layout is stable across renders.
    const hash = (n: number) => {
      const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }
    const positions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (hash(i * 3 + 1) - 0.5) * spread * 2
      positions[i * 3 + 1] = (hash(i * 3 + 2) - 0.5) * spread * 2
      positions[i * 3 + 2] = (hash(i * 3 + 3) - 0.5) * spread * 2
      phases[i] = hash(i + 0.5) * Math.PI * 2
    }
    return { positions, phases }
  }, [count, spread])

  useFrame((state) => {
    const pts = ref.current
    if (!pts) return
    const t = state.clock.elapsedTime
    const arr = pts.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.3 + phases[i]) * 0.0025
      arr[i * 3] += Math.cos(t * 0.2 + phases[i]) * 0.0018
    }
    pts.geometry.attributes.position.needsUpdate = true
    pts.rotation.y = t * 0.01
  })

  if (count <= 0) return null

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  )
}
