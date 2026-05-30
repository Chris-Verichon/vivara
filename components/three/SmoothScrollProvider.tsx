"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import Lenis from "lenis"
import { prefersReducedMotion } from "@/lib/device"
import { setPointer, setScroll } from "./scrollState"

interface SmoothScrollContextValue {
  /** Normalized page scroll progress, 0 (top) → 1 (bottom). */
  progress: number
  /** Raw scroll offset in pixels. */
  scrollY: number
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  progress: 0,
  scrollY: 0,
})

/** Read the current smooth-scroll progress from anywhere in the tree. */
export function useScrollProgress(): SmoothScrollContextValue {
  return useContext(SmoothScrollContext)
}

/**
 * Wraps page content with Lenis inertial smooth scrolling and broadcasts the
 * current scroll progress so 3D scenes can drive the camera from it.
 * Respects `prefers-reduced-motion` by disabling the smoothing.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<SmoothScrollContextValue>({
    progress: 0,
    scrollY: 0,
  })
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const lenis = new Lenis({
      duration: reduced ? 0 : 1.1,
      smoothWheel: !reduced,
      lerp: reduced ? 1 : 0.1,
    })
    lenisRef.current = lenis

    const handleScroll = ({ scroll, limit }: { scroll: number; limit: number }) => {
      const progress = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0
      setScroll(progress, scroll)
      setValue({ progress, scrollY: scroll })
    }
    lenis.on("scroll", handleScroll)

    const handlePointer = (e: PointerEvent) => {
      setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1)
      )
    }
    window.addEventListener("pointermove", handlePointer, { passive: true })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("pointermove", handlePointer)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  )
}
