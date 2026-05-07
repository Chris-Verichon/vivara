"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"

interface YearNode {
  year: number
  hasMemories: boolean
}

interface RopeTimelineProps {
  nodes: YearNode[]
}

// Smoothstep blend — 0 at center, 1 at edge
function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t))
  return x * x * (3 - 2 * x)
}

export function RopeTimeline({ nodes }: RopeTimelineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const hoveredFreezeTimeRef = useRef<number>(0) // time when hover started
  const zoomRef = useRef(1)
  const panXRef = useRef(0)
  const hoveredYearRef = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartPanRef = useRef(0)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    year: number
  } | null>(null)
  const router = useRouter()

  const KNOT_SPACING = 150
  const FREEZE_RADIUS = 180 // px around hovered node that freezes

  // Very slow organic undulation — Foundation aesthetic
  const getRopeY = useCallback(
    (x: number, t: number, canvasHeight: number) => {
      const cy = canvasHeight * 0.5
      const amp = canvasHeight * 0.36
      return (
        cy +
        amp * 0.60 * Math.sin(0.004 * x - t * 0.18) +
        amp * 0.28 * Math.sin(0.009 * x + t * 0.29) +
        amp * 0.14 * Math.sin(0.018 * x - t * 0.11) +
        amp * 0.06 * Math.sin(0.038 * x + t * 0.21)
      )
    },
    []
  )

  // Rope Y with segment-freeze blending around hovered node
  const getRopeYBlended = useCallback(
    (x: number, t: number, H: number, hoveredIdx: number | null) => {
      const animated = getRopeY(x, t, H)
      if (hoveredIdx === null) return animated
      const hovX = (hoveredIdx + 0.5) * KNOT_SPACING
      const dist = Math.abs(x - hovX)
      const blend = smoothstep(dist / FREEZE_RADIUS)
      const frozen = getRopeY(x, hoveredFreezeTimeRef.current, H)
      return frozen + blend * (animated - frozen)
    },
    [getRopeY]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    const totalWidth = nodes.length * KNOT_SPACING
    panXRef.current = (canvas.offsetWidth - totalWidth * zoomRef.current) / 2

    const draw = (timestamp: number) => {
      const t = timestamp * 0.001
      timeRef.current = t

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(panXRef.current, 0)
      ctx.scale(zoomRef.current, 1)

      const totalW = nodes.length * KNOT_SPACING
      const hovIdx = hoveredYearRef.current !== null
        ? nodes.findIndex((n) => n.year === hoveredYearRef.current)
        : null
      const knotXs = nodes.map((_, i) => (i + 0.5) * KNOT_SPACING)

      // Continuous cord path — rope passes through knots uninterrupted
      const cordPath = (getY: (px: number) => number) => {
        ctx.beginPath()
        for (let px = 0; px <= totalW; px += 3) {
          const y = getY(px)
          if (px === 0) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }
      }

      // ── Trunk: bloom + core ────────────────────────────────────────
      ctx.save()
      cordPath((px) => getRopeYBlended(px, t, H, hovIdx))
      ctx.strokeStyle = "rgba(180,120,15,0.65)"
      ctx.lineWidth = 2 / zoomRef.current
      ctx.lineCap = "round"
      ctx.filter = `blur(${2 / zoomRef.current}px)`
      ctx.stroke()
      ctx.filter = "none"
      ctx.restore()

      ctx.save()
      cordPath((px) => getRopeYBlended(px, t, H, hovIdx))
      ctx.strokeStyle = "#ba8a37"
      ctx.lineWidth = 1 / zoomRef.current
      ctx.lineCap = "round"
      ctx.stroke()
      ctx.restore()

      // ── 4 helical filaments ────────────────────────────────────────
      const filaments = [
        { phase: 0,              amp: 9,  glowColor: "rgba(220,170,40,0.12)",  coreColor: "rgba(240,200,80,0.70)" },
        { phase: Math.PI,        amp: 9,  glowColor: "rgba(180,130,20,0.10)",  coreColor: "rgba(200,150,30,0.55)" },
        { phase: Math.PI / 2,    amp: 13, glowColor: "rgba(210,160,35,0.08)",  coreColor: "rgba(230,180,60,0.45)" },
        { phase: Math.PI * 1.5,  amp: 13, glowColor: "rgba(190,140,20,0.08)",  coreColor: "rgba(210,160,40,0.40)" },
      ]
      for (const fil of filaments) {
        const filY = (px: number) => getRopeYBlended(px, t, H, hovIdx) + fil.amp * Math.sin(0.045 * px + fil.phase - t * 0.8)
        ctx.save()
        cordPath(filY)
        ctx.strokeStyle = fil.glowColor
        ctx.lineWidth = 6 / zoomRef.current
        ctx.lineCap = "round"
        ctx.filter = `blur(${2.5 / zoomRef.current}px)`
        ctx.stroke()
        ctx.filter = "none"
        ctx.restore()
        ctx.save()
        cordPath(filY)
        ctx.strokeStyle = fil.coreColor
        ctx.lineWidth = 1.0 / zoomRef.current
        ctx.lineCap = "round"
        ctx.stroke()
        ctx.restore()
      }

      // ── Knots: inner tangled ball + outer burst rays ───────────────
      const NUM_RAYS = 18
      const BALL_LINES = 18

      nodes.forEach((node, i) => {
        const x = knotXs[i]
        const y = getRopeYBlended(x, t, H, hovIdx)
        const isHovered = hoveredYearRef.current === node.year
        const ballR  = node.hasMemories ? (isHovered ? 30 : 25) : (isHovered ? 25 : 20)
        const burstR = node.hasMemories ? (isHovered ? 42 : 30) : (isHovered ? 30 : 24)

        // ── Inner ball: rotating crossing filaments ─────────────────
        for (let j = 0; j < BALL_LINES; j++) {
          const rotDir   = j % 2 === 0 ? 1 : -1.3
          const rotSpeed = 1.6 + (j % 4) * 0.65
          const angle    = (j / BALL_LINES) * Math.PI + t * rotSpeed * rotDir
          const lineR    = ballR * (0.50 + 0.50 * Math.abs(Math.sin(j * 2.3 + i * 1.7)))
          const perpOff  = ballR * 0.22 * Math.sin(j * 5.1 + i * 2.9)
          const perpAngle = angle + Math.PI / 2

          const x0 = x + Math.cos(angle) * lineR + Math.cos(perpAngle) * perpOff
          const y0 = y + Math.sin(angle) * lineR + Math.sin(perpAngle) * perpOff
          const x1 = x - Math.cos(angle) * lineR + Math.cos(perpAngle) * perpOff
          const y1 = y - Math.sin(angle) * lineR + Math.sin(perpAngle) * perpOff

          const bAlpha = node.hasMemories ? (isHovered ? 0.92 : 0.72) : 0.55
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.strokeStyle = `rgba(240,195,60,${bAlpha.toFixed(2)})`
          ctx.lineWidth = (node.hasMemories ? 1.1 : 0.9) / zoomRef.current
          ctx.lineCap = "round"
          ctx.stroke()
        }

        // ── Outer burst: fast asymmetric rays from ball edge ────────
        for (let j = 0; j < NUM_RAYS; j++) {
          const seedLen   = Math.abs(Math.sin(j * 47.3 + i * 91.7))
          const baseLen   = 0.25 + seedLen * 0.75
          const flickSpeed = 4.0 + Math.abs(Math.sin(j * 31.4 + i * 17.2)) * 4.5
          const flicker   = Math.sin(t * flickSpeed + j * 1.57 + i * 3.1)
          const rayLen    = (burstR - ballR) * baseLen * (0.50 + 0.50 * Math.abs(flicker))
          const angle     = (j / NUM_RAYS) * Math.PI * 2 + t * (j % 2 === 0 ? 0.5 : -0.38)
          const alpha     = node.hasMemories
            ? (isHovered ? 0.55 + 0.38 * Math.abs(flicker) : 0.20 + 0.22 * Math.abs(flicker))
            : (0.08 + 0.12 * Math.abs(flicker))
          const goldR = node.hasMemories ? (isHovered ? 235 : 210) : 190
          const goldG = node.hasMemories ? (isHovered ? 190 : 162) : 140
          const edge = ballR * 0.85
          ctx.beginPath()
          ctx.moveTo(x + Math.cos(angle) * edge, y + Math.sin(angle) * edge)
          ctx.lineTo(x + Math.cos(angle) * (edge + rayLen), y + Math.sin(angle) * (edge + rayLen))
          ctx.strokeStyle = `rgba(${goldR},${goldG},40,${alpha.toFixed(2)})`
          ctx.lineWidth = (node.hasMemories ? 0.9 : 0.65) / zoomRef.current
          ctx.lineCap = "round"
          ctx.stroke()
        }

        // Tiny center anchor (1px) — just to anchor the eye
        ctx.beginPath()
        ctx.arc(x, y, 1.2 / zoomRef.current, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255,240,160,0.85)"
        ctx.fill()

        // Year label
        const fontSize = Math.max(8, Math.min(11, 10 / zoomRef.current))
        ctx.font = `${isHovered ? "500" : "400"} ${fontSize}px Inter, sans-serif`
        ctx.fillStyle = isHovered ? "#7A4E00" : node.hasMemories ? "#A07020" : "#B09060"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(String(node.year), x, y - burstR - 10 / zoomRef.current)
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
    }
  }, [nodes, getRopeY, getRopeYBlended])

  // ── Zoom (non-passive wheel) ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(4, Math.max(0.25, zoomRef.current * delta))
      panXRef.current =
        mouseX - (mouseX - panXRef.current) * (newZoom / zoomRef.current)
      zoomRef.current = newZoom
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [])

  // ── Hover ─────────────────────────────────────────────────────────
  const getHoveredNode = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const mx = (clientX - rect.left - panXRef.current) / zoomRef.current
      const my = clientY - rect.top
      const t = timeRef.current

      for (let i = 0; i < nodes.length; i++) {
        const x = (i + 0.5) * KNOT_SPACING
        const y = getRopeY(x, t, canvas.offsetHeight)
        const r = nodes[i].hasMemories ? (hoveredYearRef.current === nodes[i].year ? 36 : 24) : (hoveredYearRef.current === nodes[i].year ? 24 : 14)
        const hitR = r + 10
        const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2)
        if (dist < hitR) return { node: nodes[i], x, y }
      }
      return null
    },
    [nodes, getRopeY]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      if (isDraggingRef.current) {
        panXRef.current = dragStartPanRef.current + (e.clientX - dragStartXRef.current)
        return
      }

      const hit = getHoveredNode(e.clientX, e.clientY)
      if (hit) {
        if (hoveredYearRef.current !== hit.node.year) {
          // Nouveau nœud — enregistre le temps de gel
          hoveredYearRef.current = hit.node.year
          hoveredFreezeTimeRef.current = timeRef.current
        }
        canvas.style.cursor = "pointer"
      } else {
        hoveredYearRef.current = null
        canvas.style.cursor = isDraggingRef.current ? "grabbing" : "grab"
      }
    },
    [getHoveredNode]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 0) {
        isDraggingRef.current = true
        dragStartXRef.current = e.clientX
        dragStartPanRef.current = panXRef.current
        ;(e.currentTarget as HTMLCanvasElement).style.cursor = "grabbing"
      }
    },
    []
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDraggingRef.current = false
      ;(e.currentTarget as HTMLCanvasElement).style.cursor = "grab"
    },
    []
  )

  // ── Click (nav vers l'année) ───────────────────────────────────────
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (contextMenu) {
        setContextMenu(null)
        return
      }
      const hit = getHoveredNode(e.clientX, e.clientY)
      if (hit?.node.hasMemories) {
        router.push(`/timeline/${hit.node.year}`)
      }
    },
    [getHoveredNode, contextMenu, router]
  )

  // ── Clic droit ────────────────────────────────────────────────────
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const hit = getHoveredNode(e.clientX, e.clientY)
      if (hit) {
        setContextMenu({ x: e.clientX, y: e.clientY, year: hit.node.year })
      } else {
        setContextMenu(null)
      }
    },
    [getHoveredNode]
  )

  return (
    <div
      className="relative w-full h-full"
      onClick={() => setContextMenu(null)}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      />

      {/* Menu contextuel */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-black/8 py-1 min-w-[200px]"
          style={{ top: contextMenu.y + 4, left: contextMenu.x + 4 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-2 border-b border-black/5">
            <p className="text-xs text-[#888888] font-medium uppercase tracking-wide">
              {contextMenu.year}
            </p>
          </div>
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F4B8C1]/20 hover:text-[#C9748A] transition-colors flex items-center gap-2"
            onClick={() => {
              router.push(`/memories/new?year=${contextMenu.year}`)
              setContextMenu(null)
            }}
          >
            <span className="text-[#C9748A]">✦</span>
            Ajouter un souvenir
          </button>
          {contextMenu && (
            <button
              className="w-full text-left px-4 py-2.5 text-sm text-[#888888] hover:bg-black/5 transition-colors"
              onClick={() => setContextMenu(null)}
            >
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  )
}
