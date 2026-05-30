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

interface StarParticle {
  cx: number          // base content-space x
  cyFrac: number      // base y as fraction of canvas height
  driftAmpX: number   // x drift amplitude (content px)
  driftAmpY: number   // y drift amplitude (screen px)
  driftPhaseX: number
  driftPhaseY: number
  driftSpeed: number
  r: number           // base radius (screen px / zoom)
  phase: number       // pulse phase
  speed: number       // pulse speed
  colorType: number   // 0=cyan | 1=cobalt | 2=gold | 3=rose
  layer: number       // 0 = behind rope | 1 = in front
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
  const scrollbarThumbRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const isScrollbarDraggingRef = useRef(false)
  const scrollbarDragStartXRef = useRef(0)
  const scrollbarDragStartPanRef = useRef(0)
  const scrollbarDragThumbWidthRef = useRef(0)
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const starsRef = useRef<StarParticle[]>([])
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
    // Focus view on the most recent years (right end of timeline)
    panXRef.current = canvas.offsetWidth * 0.75 - (totalWidth - KNOT_SPACING * 0.5) * zoomRef.current

    // ── Prime Radiant particles ─────────────────────────────────
    const bell = () => (Math.random() + Math.random()) / 2
    starsRef.current = Array.from({ length: 200 }, () => {
      const ct = Math.random()
      return {
        cx: -totalWidth * 0.05 + Math.random() * totalWidth * 1.10,
        cyFrac: 0.05 + bell() * 0.90,
        driftAmpX: 10 + Math.random() * 25,
        driftAmpY: 8 + Math.random() * 20,
        driftPhaseX: Math.random() * Math.PI * 2,
        driftPhaseY: Math.random() * Math.PI * 2,
        driftSpeed: 0.35 + Math.random() * 0.75,
        r: 0.35 + Math.random() ** 1.3 * 2.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.30 + Math.random() * 1.4,
        colorType: ct < 0.38 ? 0 : ct < 0.62 ? 1 : ct < 0.84 ? 2 : 3,
        layer: Math.random() < 0.28 ? 1 : 0,
      }
    })

    const draw = (timestamp: number) => {
      const t = timestamp * 0.001
      timeRef.current = t

      const W = canvas.offsetWidth
      const H = canvas.offsetHeight

      ctx.clearRect(0, 0, W, H)
      // Linen background — site design token
      ctx.fillStyle = "#FAF7F2"
      ctx.fillRect(0, 0, W, H)
      // Warm edge vignette
      const vigG = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.15, W * 0.5, H * 0.5, H * 0.95)
      vigG.addColorStop(0, "rgba(0,0,0,0)")
      vigG.addColorStop(1, "rgba(165,140,110,0.18)")
      ctx.fillStyle = vigG
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(panXRef.current, 0)
      ctx.scale(zoomRef.current, 1)

      const totalW = nodes.length * KNOT_SPACING
      const hovIdx = hoveredYearRef.current !== null
        ? nodes.findIndex((n) => n.year === hoveredYearRef.current)
        : null
      const knotXs = nodes.map((_, i) => (i + 0.5) * KNOT_SPACING)

      // ── Prime Radiant: drifting network particles ─────────────────
      const drawStars = (layer: number) => {
        const pts: { cx: number; cy: number; alpha: number; size: number; colorType: number; r: number }[] = []

        for (const star of starsRef.current) {
          if (star.layer !== layer) continue
          const driftX = star.driftAmpX * Math.sin(t * star.driftSpeed * 0.18 + star.driftPhaseX)
          const driftY = star.driftAmpY * Math.cos(t * star.driftSpeed * 0.14 + star.driftPhaseY)
          const flicker = 0.30 + 0.70 * Math.abs(Math.sin(t * star.speed + star.phase))
          let finalCx = star.cx + driftX
          let finalCy = star.cyFrac * H + driftY

          // Mouse repulsion field — particles flee the cursor
          const mouseRep = mousePosRef.current
          if (mouseRep) {
            const sx = finalCx * zoomRef.current + panXRef.current
            const sy = finalCy
            const mdx = sx - mouseRep.x
            const mdy = sy - mouseRep.y
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy)
            const REPULSE_R = 160
            if (mdist < REPULSE_R && mdist > 0) {
              const force = ((REPULSE_R - mdist) / REPULSE_R) ** 2
              const MAX_OFFSET = 85
              finalCx += (mdx / mdist * force * MAX_OFFSET) / zoomRef.current
              finalCy += mdy / mdist * force * MAX_OFFSET
            }
          }

          pts.push({
            cx: finalCx,
            cy: finalCy,
            alpha: flicker,
            size: star.r * flicker,
            colorType: star.colorType,
            r: star.r,
          })
        }

        // Holographic connection lines
        const THRESH = 90
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].cx - pts[j].cx
            const dy = pts[i].cy - pts[j].cy
            const sd = Math.sqrt((dx * zoomRef.current) ** 2 + dy * dy)
            if (sd > THRESH) continue
            const la = (1 - sd / THRESH) * 0.22
            ctx.beginPath()
            ctx.moveTo(pts[i].cx, pts[i].cy)
            ctx.lineTo(pts[j].cx, pts[j].cy)
            ctx.strokeStyle = `rgba(155,130,110,${la.toFixed(3)})`
            ctx.lineWidth = 0.55 / zoomRef.current
            ctx.lineCap = "butt"
            ctx.stroke()
          }
        }

        // Cursor tendril connections — particles reach toward the mouse
        const mouseTend = mousePosRef.current
        if (mouseTend) {
          const cursorCX = (mouseTend.x - panXRef.current) / zoomRef.current
          const cursorCY = mouseTend.y
          const CURSOR_R = 155
          for (const p of pts) {
            const tdx = (p.cx - cursorCX) * zoomRef.current
            const tdy = p.cy - cursorCY
            const sd = Math.sqrt(tdx * tdx + tdy * tdy)
            if (sd > CURSOR_R) continue
            const la = (1 - sd / CURSOR_R) * 0.55
            ctx.beginPath()
            ctx.moveTo(p.cx, p.cy)
            ctx.lineTo(cursorCX, cursorCY)
            ctx.strokeStyle = `rgba(196,116,138,${la.toFixed(3)})`
            ctx.lineWidth = 0.75 / zoomRef.current
            ctx.lineCap = "round"
            ctx.stroke()
          }
        }

        // Particle nodes
        for (const p of pts) {
          const a = p.alpha
          const sz = p.size / zoomRef.current
          const palettes: [string, string, string][] = [
            [`rgba(72,128,195,${a.toFixed(2)})`,           `rgba(52,98,168,${(a*0.20).toFixed(2)})`,    `rgba(62,113,182,${(a*0.34).toFixed(2)})`],
            [`rgba(122,98,195,${a.toFixed(2)})`,           `rgba(92,70,170,${(a*0.18).toFixed(2)})`,    `rgba(107,84,183,${(a*0.30).toFixed(2)})`],
            [`rgba(192,145,40,${a.toFixed(2)})`,           `rgba(162,115,20,${(a*0.20).toFixed(2)})`,   `rgba(178,130,32,${(a*0.34).toFixed(2)})`],
            [`rgba(196,116,138,${(a*0.92).toFixed(2)})`,   `rgba(162,80,112,${(a*0.17).toFixed(2)})`,   `rgba(180,98,125,${(a*0.30).toFixed(2)})`],
          ]
          const pal = palettes[p.colorType % 4]
          const [core, outerH, innerH] = pal

          // Outer diffuse halo
          ctx.beginPath()
          ctx.arc(p.cx, p.cy, sz * 3.8, 0, Math.PI * 2)
          ctx.fillStyle = outerH
          ctx.fill()

          // Mid glow
          ctx.beginPath()
          ctx.arc(p.cx, p.cy, sz * 2.0, 0, Math.PI * 2)
          ctx.fillStyle = innerH
          ctx.fill()

          // Crisp core
          ctx.beginPath()
          ctx.arc(p.cx, p.cy, sz, 0, Math.PI * 2)
          ctx.fillStyle = core
          ctx.fill()

          // Cross sparkle for large bright nodes
          if (p.r > 1.4 && a > 0.52) {
            const arm = sz * 3.2
            ctx.save()
            ctx.strokeStyle = core
            ctx.lineWidth = 0.6 / zoomRef.current
            ctx.globalAlpha = a * 0.42
            ctx.beginPath()
            ctx.moveTo(p.cx - arm, p.cy)
            ctx.lineTo(p.cx + arm, p.cy)
            ctx.moveTo(p.cx, p.cy - arm)
            ctx.lineTo(p.cx, p.cy + arm)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      // ── Layer 0: stars behind the rope ────────────────────────────
      drawStars(0)

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
      ctx.strokeStyle = "rgba(185,128,20,0.55)"
      ctx.lineWidth = 3 / zoomRef.current
      ctx.lineCap = "round"
      ctx.filter = `blur(${3 / zoomRef.current}px)`
      ctx.stroke()
      ctx.filter = "none"
      ctx.restore()

      ctx.save()
      cordPath((px) => getRopeYBlended(px, t, H, hovIdx))
      ctx.strokeStyle = "#B07018"
      ctx.lineWidth = 1.2 / zoomRef.current
      ctx.lineCap = "round"
      ctx.stroke()
      ctx.restore()

      // ── 4 helical filaments ────────────────────────────────────────
      const filaments = [
        { phase: 0,              amp: 9,  glowColor: "rgba(180,122,18,0.22)",  coreColor: "rgba(185,128,22,0.78)" },
        { phase: Math.PI,        amp: 9,  glowColor: "rgba(158,108,15,0.18)",  coreColor: "rgba(172,118,18,0.62)" },
        { phase: Math.PI / 2,    amp: 13, glowColor: "rgba(170,115,16,0.16)",  coreColor: "rgba(180,124,20,0.52)" },
        { phase: Math.PI * 1.5,  amp: 13, glowColor: "rgba(162,110,15,0.16)",  coreColor: "rgba(175,120,18,0.48)" },
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
          ctx.strokeStyle = `rgba(180,122,25,${bAlpha.toFixed(2)})`
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
          const goldR = node.hasMemories ? (isHovered ? 185 : 165) : 148
          const goldG = node.hasMemories ? (isHovered ? 125 : 100) : 82
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
        ctx.fillStyle = "rgba(175,118,22,0.88)"
        ctx.fill()

        // Year label
        const fontSize = Math.max(8, Math.min(11, 10 / zoomRef.current))
        ctx.font = `${isHovered ? "500" : "400"} ${fontSize}px Inter, sans-serif`
        ctx.fillStyle = isHovered ? "#1A1A1A" : node.hasMemories ? "#C9748A" : "#A09890"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(String(node.year), x, y - burstR - 10 / zoomRef.current)
      })

      // ── Layer 1: stars in front of the rope ───────────────────────
      drawStars(1)

      ctx.restore()

      // ── Cursor glow orb (screen-space, drawn on top of everything) ───
      const mouseCursor = mousePosRef.current
      if (mouseCursor) {
        const mx = mouseCursor.x
        const my = mouseCursor.y
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.2)
        // Outer diffuse nebula
        const gOuter = ctx.createRadialGradient(mx, my, 0, mx, my, 130)
        gOuter.addColorStop(0, "rgba(196,116,138,0.10)")
        gOuter.addColorStop(1, "rgba(196,116,138,0)")
        ctx.fillStyle = gOuter
        ctx.beginPath()
        ctx.arc(mx, my, 130, 0, Math.PI * 2)
        ctx.fill()
        // Pulsing mid ring
        const ringR = 36 + pulse * 12
        const gMid = ctx.createRadialGradient(mx, my, 0, mx, my, ringR)
        gMid.addColorStop(0, `rgba(220,140,165,${(0.24 + pulse * 0.12).toFixed(3)})`)
        gMid.addColorStop(1, "rgba(196,116,138,0)")
        ctx.fillStyle = gMid
        ctx.beginPath()
        ctx.arc(mx, my, ringR, 0, Math.PI * 2)
        ctx.fill()
        // Crisp inner core
        const gCore = ctx.createRadialGradient(mx, my, 0, mx, my, 8)
        gCore.addColorStop(0, "rgba(255,218,228,0.92)")
        gCore.addColorStop(0.45, "rgba(220,140,165,0.52)")
        gCore.addColorStop(1, "rgba(196,116,138,0)")
        ctx.fillStyle = gCore
        ctx.beginPath()
        ctx.arc(mx, my, 8, 0, Math.PI * 2)
        ctx.fill()
        // Crosshair arms
        const arm = 16 + pulse * 6
        ctx.save()
        ctx.strokeStyle = "rgba(196,116,138,0.42)"
        ctx.lineWidth = 0.9
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(mx - arm, my)
        ctx.lineTo(mx + arm, my)
        ctx.moveTo(mx, my - arm)
        ctx.lineTo(mx, my + arm)
        ctx.stroke()
        ctx.restore()
      }

      // ── Scrollbar sync ────────────────────────────────────────────
      const sbThumb = scrollbarThumbRef.current
      const sbTrack = scrollbarTrackRef.current
      if (sbThumb && sbTrack) {
        const contentWidth = nodes.length * KNOT_SPACING * zoomRef.current
        if (contentWidth <= W) {
          sbThumb.style.opacity = "0"
          sbThumb.style.pointerEvents = "none"
        } else {
          const trackWidth = sbTrack.offsetWidth
          const totalContentWidth = nodes.length * KNOT_SPACING
          const visibleWidth = W / zoomRef.current
          const thumbWidthFrac = Math.min(1, visibleWidth / totalContentWidth)
          const thumbPx = Math.max(40, thumbWidthFrac * trackWidth)
          const scrollRange = totalContentWidth - visibleWidth
          const visibleLeft = -panXRef.current / zoomRef.current
          const scrollFrac = scrollRange > 0 ? Math.max(0, Math.min(1, visibleLeft / scrollRange)) : 0
          const thumbLeft = scrollFrac * (trackWidth - thumbPx)
          sbThumb.style.width = `${thumbPx}px`
          sbThumb.style.transform = `translateX(${thumbLeft}px)`
          sbThumb.style.opacity = "1"
          sbThumb.style.pointerEvents = "auto"
          scrollbarDragThumbWidthRef.current = thumbPx
        }
      }

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
      const newZoom = Math.min(3, Math.max(0.5, zoomRef.current * delta))
      panXRef.current =
        mouseX - (mouseX - panXRef.current) * (newZoom / zoomRef.current)
      zoomRef.current = newZoom
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => canvas.removeEventListener("wheel", onWheel)
  }, [])

  // ── Scrollbar drag ────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isScrollbarDraggingRef.current) return
      const track = scrollbarTrackRef.current
      const canvas = canvasRef.current
      if (!track || !canvas) return
      const trackWidth = track.offsetWidth
      const thumbWidth = scrollbarDragThumbWidthRef.current
      const totalContentWidth = nodes.length * KNOT_SPACING
      const visibleWidth = canvas.offsetWidth / zoomRef.current
      const scrollRange = totalContentWidth - visibleWidth
      if (scrollRange <= 0) return
      const startVisibleLeft = -scrollbarDragStartPanRef.current / zoomRef.current
      const startFrac = Math.max(0, Math.min(1, startVisibleLeft / scrollRange))
      const dx = e.clientX - scrollbarDragStartXRef.current
      const scrollableTrack = trackWidth - thumbWidth
      const newFrac = Math.max(0, Math.min(1, startFrac + dx / scrollableTrack))
      panXRef.current = -newFrac * scrollRange * zoomRef.current
    }
    const onMouseUp = () => { isScrollbarDraggingRef.current = false }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [nodes])

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

      const rect = canvas.getBoundingClientRect()
      mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

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

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDraggingRef.current = false
      mousePosRef.current = null
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
      className="relative w-full h-full flex flex-col bg-[#FAF7F2]"
      onClick={() => setContextMenu(null)}
    >
      <canvas
        ref={canvasRef}
        className="w-full flex-1 min-h-0 cursor-grab"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      />

      {/* Horizontal scrollbar */}
      <div
        ref={scrollbarTrackRef}
        className="relative h-1.5 mx-6 my-2.5 bg-black/10 rounded-full shrink-0"
      >
        <div
          ref={scrollbarThumbRef}
          className="absolute top-0 left-0 h-1.5 bg-[#C9748A]/50 rounded-full cursor-pointer hover:bg-[#C9748A]/75 transition-colors"
          style={{ opacity: 0, width: 40 }}
          onMouseDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
            isScrollbarDraggingRef.current = true
            scrollbarDragStartXRef.current = e.clientX
            scrollbarDragStartPanRef.current = panXRef.current
          }}
        />
      </div>

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
