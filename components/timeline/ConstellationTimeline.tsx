"use client"

import { useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { useFrame } from "@react-three/fiber"
import { ScrollControls, useScroll, Text, Billboard } from "@react-three/drei"
import { CatmullRomCurve3, Vector3, AdditiveBlending, type Mesh } from "three"
import { useWebGLSupport } from "@/components/three/useWebGLSupport"
import { Starfield } from "@/components/three/Starfield"
import { DriftParticles } from "@/components/three/DriftParticles"
import { MemoryStar } from "@/components/three/MemoryStar"
import { getSceneTuning, NIGHT_COLORS } from "@/components/three/constellation"
import { RopeTimeline } from "@/components/timeline/RopeTimeline"
import type { DeviceTier } from "@/lib/device"

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false }
)

export interface TimelineNode {
  year: number
  hasMemories: boolean
}

interface ConstellationTimelineProps {
  nodes: TimelineNode[]
}

const NODE_SPACING = 4.2

/** Build the winding 3D path that threads through every year node. */
function buildCurve(count: number): { curve: CatmullRomCurve3; points: Vector3[] } {
  const points: Vector3[] = []
  for (let i = 0; i < count; i++) {
    points.push(
      new Vector3(
        Math.sin(i * 0.6) * 3.6,
        Math.cos(i * 0.42) * 2.1,
        -i * NODE_SPACING
      )
    )
  }
  // Pad ends so the camera has runway before the first / after the last node.
  if (points.length > 0) {
    const first = points[0]
    const last = points[points.length - 1]
    points.unshift(new Vector3(first.x, first.y, first.z + NODE_SPACING * 1.5))
    points.push(new Vector3(last.x, last.y, last.z - NODE_SPACING * 1.5))
  }
  return { curve: new CatmullRomCurve3(points, false, "catmullrom", 0.5), points }
}

// ---------------------------------------------------------------------------
// Braided "thread of life" — three luminous strands twisting along the spine
// ---------------------------------------------------------------------------

/** Build `count` strand curves that helically wrap around the central spine. */
function buildStrands(
  curve: CatmullRomCurve3,
  segments: number,
  count: number,
  braidRadius: number,
  turns: number
): CatmullRomCurve3[] {
  const frames = curve.computeFrenetFrames(segments, false)
  const spine = new Vector3()
  const strands: CatmullRomCurve3[] = []
  for (let s = 0; s < count; s++) {
    const phase = (s / count) * Math.PI * 2
    const pts: Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = phase + t * Math.PI * 2 * turns
      curve.getPointAt(t, spine)
      const n = frames.normals[i]
      const b = frames.binormals[i]
      pts.push(
        new Vector3()
          .copy(spine)
          .addScaledVector(n, Math.cos(angle) * braidRadius)
          .addScaledVector(b, Math.sin(angle) * braidRadius)
      )
    }
    strands.push(new CatmullRomCurve3(pts))
  }
  return strands
}

function Braid({ curve, segments }: { curve: CatmullRomCurve3; segments: number }) {
  const strands = useMemo(
    () => buildStrands(curve, segments, 3, 0.16, Math.max(6, segments / 12)),
    [curve, segments]
  )
  const beadsPerStrand = Math.max(8, Math.round(segments / 8))

  return (
    <group>
      {strands.map((strand, i) => (
        <mesh key={i}>
          <tubeGeometry args={[strand, segments, 0.045, 6, false]} />
          <meshStandardMaterial
            color={NIGHT_COLORS.starGold}
            emissive={NIGHT_COLORS.starGold}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Flowing light travelling along the strands (spirals around the axis) */}
      <BraidFlow strands={strands} beadsPerStrand={beadsPerStrand} />
      {/* Soft glow enveloping the whole braid */}
      <mesh>
        <tubeGeometry args={[curve, segments, 0.3, 8, false]} />
        <meshBasicMaterial
          color={NIGHT_COLORS.starRose}
          transparent
          opacity={0.08}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

/**
 * Glowing beads that drift along each braid strand. Because the strands wind
 * helically around the spine, the beads appear to swirl around the central axis
 * like a current of light flowing through the thread of life.
 */
function BraidFlow({
  strands,
  beadsPerStrand,
}: {
  strands: CatmullRomCurve3[]
  beadsPerStrand: number
}) {
  const refs = useRef<(Mesh | null)[]>([])
  const tmp = useMemo(() => new Vector3(), [])
  const total = strands.length * beadsPerStrand

  useFrame((state) => {
    const flow = state.clock.elapsedTime * 0.035
    let idx = 0
    for (let s = 0; s < strands.length; s++) {
      const strand = strands[s]
      for (let k = 0; k < beadsPerStrand; k++) {
        const u = (k / beadsPerStrand + flow + s * 0.12) % 1
        strand.getPointAt(u, tmp)
        const mesh = refs.current[idx]
        if (mesh) mesh.position.copy(tmp)
        idx++
      }
    }
  })

  return (
    <group>
      {Array.from({ length: total }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={NIGHT_COLORS.starRose}
            emissive={NIGHT_COLORS.starRose}
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Camera travels along the thread driven by scroll offset
// ---------------------------------------------------------------------------

function ThreadCamera({ curve }: { curve: CatmullRomCurve3 }) {
  const scroll = useScroll()
  const offset = useMemo(() => new Vector3(0, 1.4, 6.5), [])
  const pos = useMemo(() => new Vector3(), [])
  const look = useMemo(() => new Vector3(), [])
  const target = useMemo(() => new Vector3(), [])

  useFrame((state) => {
    const t = Math.min(0.999, Math.max(0, scroll.offset))
    curve.getPointAt(t, pos)
    curve.getPointAt(Math.min(0.999, t + 0.03), look)
    target.copy(pos).add(offset)
    const cam = state.camera
    cam.position.lerp(target, 0.1)
    cam.lookAt(look)
  })
  return null
}

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

function TimelineScene({
  nodes,
  tier,
  onSelect,
  onAdd,
}: {
  nodes: TimelineNode[]
  tier: DeviceTier
  onSelect: (year: number) => void
  onAdd: (year: number) => void
}) {
  const tuning = getSceneTuning(tier)
  const { curve, points } = useMemo(() => buildCurve(nodes.length), [nodes.length])
  // Nodes sit on the inner points (curve has 1 padding point at each end).
  const nodePoints = points.slice(1, points.length - 1)
  const segments = Math.max(64, nodes.length * 6)

  return (
    <>
      <Starfield count={tuning.ambientStars} />
      <DriftParticles count={tuning.particles} spread={20} />
      <Braid curve={curve} segments={segments} />
      <ThreadCamera curve={curve} />
      {nodePoints.map((p, i) => {
        const node = nodes[i]
        if (!node) return null
        const color = node.hasMemories ? NIGHT_COLORS.starRose : NIGHT_COLORS.starGold
        return (
          <group key={node.year}>
            <MemoryStar
              position={[p.x, p.y, p.z]}
              color={color}
              size={node.hasMemories ? 0.22 : 0.13}
              phase={i * 0.6}
              onSelect={() => onSelect(node.year)}
              onContext={() => onAdd(node.year)}
            />
            {/* Always-visible year label, billboarded toward the camera */}
            <Billboard position={[p.x, p.y + (node.hasMemories ? 0.55 : 0.42), p.z]}>
              <Text
                fontSize={node.hasMemories ? 0.34 : 0.26}
                color={node.hasMemories ? NIGHT_COLORS.star : NIGHT_COLORS.starGold}
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.006}
                outlineColor={NIGHT_COLORS.nightDeep}
                fillOpacity={node.hasMemories ? 1 : 0.7}
              >
                {String(node.year)}
              </Text>
            </Billboard>
          </group>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Entry point with fallback
// ---------------------------------------------------------------------------

export function ConstellationTimeline({ nodes }: ConstellationTimelineProps) {
  const { ready, enabled, tier } = useWebGLSupport()
  const router = useRouter()

  // Fallback to the original 2D canvas timeline.
  if (ready && !enabled) {
    return <RopeTimeline nodes={nodes} />
  }

  const pages = Math.max(3, nodes.length * 0.5)

  return (
    <div className="relative h-full w-full bg-night">
      {ready && enabled && (
        <SceneCanvas tier={tier} cameraPosition={[0, 1.4, 8]} fogFar={50}>
          <ScrollControls pages={pages} damping={0.3}>
            <TimelineScene
              nodes={nodes}
              tier={tier}
              onSelect={(year) => router.push(`/timeline/${year}`)}
              onAdd={() => router.push("/memory/new")}
            />
          </ScrollControls>
        </SceneCanvas>
      )}

      {/* Hint overlay */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-center text-xs text-[#fdf6ec]/50">
        Faites défiler pour remonter le temps · Cliquez une année · Clic droit pour ajouter
      </div>
    </div>
  )
}
