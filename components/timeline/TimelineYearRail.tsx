"use client"

import { useRef } from "react"

export interface RailYear {
  year: number
  hasMemories: boolean
  /** Scroll offset (0..1) that brings this year into view. */
  offset: number
}

interface TimelineYearRailProps {
  years: RailYear[]
  activeYear: number | null
  /** Jump the timeline to the given scroll offset (0..1). */
  onJump: (offset: number) => void
}

/**
 * Vertical quick-travel rail pinned to the right edge of the timeline.
 * Tap (or drag to scrub) a year to jump straight to it without scrolling.
 * Oldest year sits at the top, most recent at the bottom — matching the
 * scroll direction of the constellation timeline.
 */
export function TimelineYearRail({ years, activeYear, onJump }: TimelineYearRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  if (years.length === 0) return null

  const jumpFromClientY = (clientY: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    const idx = Math.round(frac * (years.length - 1))
    onJump(years[idx].offset)
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Navigation rapide par année"
      aria-valuemin={years[0].year}
      aria-valuemax={years[years.length - 1].year}
      aria-valuenow={activeYear ?? undefined}
      className="absolute right-0 top-0 bottom-0 z-30 flex w-12 touch-none select-none flex-col items-stretch py-3 pr-1.5 md:w-14"
      onPointerDown={(e) => {
        e.preventDefault()
        draggingRef.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        jumpFromClientY(e.clientY)
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) jumpFromClientY(e.clientY)
      }}
      onPointerUp={(e) => {
        draggingRef.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)
      }}
      onPointerCancel={() => {
        draggingRef.current = false
      }}
    >
      {years.map((y) => {
        const active = y.year === activeYear
        const showLabel = active || y.year % 5 === 0
        return (
          <div
            key={y.year}
            className="pointer-events-none flex flex-1 items-center justify-end gap-1.5"
          >
            <span
              className={`text-[9px] leading-none tabular-nums transition-colors md:text-[10px] ${
                active
                  ? "font-semibold text-[#F4B8C1]"
                  : showLabel
                    ? "text-[#fdf6ec]/45"
                    : "text-transparent"
              }`}
            >
              {y.year}
            </span>
            <span
              className={`block rounded-full transition-all ${
                active
                  ? "h-[2px] w-4 bg-[#F4B8C1]"
                  : y.hasMemories
                    ? "h-[2px] w-3 bg-[#C9748A]/80"
                    : "h-px w-2 bg-[#fdf6ec]/25"
              }`}
            />
          </div>
        )
      })}
    </div>
  )
}
