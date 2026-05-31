"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import type { Group } from "three"

interface StarfieldProps {
  count: number
}

/**
 * Ambient deep-space starfield that slowly drifts to give the constellation a
 * sense of living depth. Count is driven by the device tier.
 */
export function Starfield({ count }: StarfieldProps) {
  const ref = useRef<Group>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.008
      ref.current.rotation.x += delta * 0.003
    }
  })

  if (count <= 0) return null

  return (
    <group ref={ref}>
      <Stars radius={80} depth={50} count={count} factor={3.2} saturation={0} fade speed={0.6} />
    </group>
  )
}
