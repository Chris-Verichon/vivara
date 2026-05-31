"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Billboard, Html } from "@react-three/drei"
import type { Mesh } from "three"
import { AdditiveBlending } from "three"

export interface MemoryStarProps {
  position: [number, number, number]
  /** Emissive colour of the star. */
  color: string
  /** Base radius of the core. */
  size?: number
  /** Label shown on hover (e.g. memory title or year). */
  label?: string
  /** Pulse phase offset so stars don't all breathe in sync. */
  phase?: number
  onSelect?: () => void
  /** Right-click handler (e.g. add a memory on a timeline year). */
  onContext?: () => void
}

/**
 * A single glowing point in the constellation: an emissive core wrapped in an
 * additive halo, gently breathing and reacting to hover. Used for both memories
 * (Home) and year nodes (Timeline).
 */
export function MemoryStar({
  position,
  color,
  size = 0.14,
  label,
  phase = 0,
  onSelect,
  onContext,
}: MemoryStarProps) {
  const core = useRef<Mesh>(null)
  const halo = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const breathe = 1 + Math.sin(t * 1.5 + phase) * 0.12
    const target = hovered ? 1.9 : breathe
    if (core.current) {
      core.current.scale.setScalar(
        core.current.scale.x + (target - core.current.scale.x) * 0.15
      )
    }
    if (halo.current) {
      const haloTarget = hovered ? 2.6 : breathe * 1.15
      halo.current.scale.setScalar(
        halo.current.scale.x + (haloTarget - halo.current.scale.x) * 0.12
      )
    }
  })

  return (
    <group position={position}>
      {/* Emissive core */}
      <mesh
        ref={core}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={() => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.()
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          if (onContext) {
            e.nativeEvent.preventDefault()
            onContext()
          }
        }}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 3 : 1.8}
          toneMapped={false}
        />
      </mesh>

      {/* Additive halo */}
      <mesh ref={halo} scale={1.15}>
        <sphereGeometry args={[size * 2.1, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.35 : 0.16}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Hover label */}
      {label && hovered && (
        <Billboard>
          <Html
            center
            distanceFactor={10}
            position={[0, size * 4, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span
              className="whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-xs text-[#fdf6ec] backdrop-blur-sm"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {label}
            </span>
          </Html>
        </Billboard>
      )}
    </group>
  )
}
