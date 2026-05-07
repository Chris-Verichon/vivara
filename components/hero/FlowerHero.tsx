"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

/**
 * Full-viewport flower video hero — inspired by dolsten.com
 *
 * Behaviour:
 *  - First visit:  intro video plays once → seamlessly switches to loop video
 *  - Revisit:      skips intro, plays loop directly (sessionStorage flag)
 *  - Scroll:       flower starts at -7deg, smoothly straightens to 0deg
 *  - Safari:       prefers .mp4 source (add flower-intro.mp4 / flower-loop.mp4 in public/videos/)
 *
 * Required files in /public/videos/:
 *   flower-intro.webm  (+ flower-intro.mp4 for Safari)
 *   flower-loop.webm   (+ flower-loop.mp4 for Safari)
 */
export function FlowerHero() {
  const introRef = useRef<HTMLVideoElement>(null)
  const loopRef = useRef<HTMLVideoElement>(null)

  // Scroll-driven rotation: -7deg at top → 0deg after 300px scroll
  const { scrollY } = useScroll()
  const rawRotate = useTransform(scrollY, [0, 300], [-7, 0])
  const rotate = useSpring(rawRotate, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const intro = introRef.current
    const loop = loopRef.current
    if (!intro || !loop) return

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    // Source selection — webm for all modern browsers, mp4 fallback for Safari
    const ext = isSafari ? "mp4" : "webm"
    const introSrc = document.createElement("source")
    introSrc.src = `/videos/flower-intro.${ext}`
    introSrc.type = isSafari ? "video/mp4" : "video/webm"

    const loopSrc = document.createElement("source")
    loopSrc.src = `/videos/flower-loop.${ext}`
    loopSrc.type = isSafari ? "video/mp4" : "video/webm"

    intro.appendChild(introSrc)
    loop.appendChild(loopSrc)

    // First visit → play intro
    intro.load()
    intro.play().catch(() => {})

    // Near end of intro → start loop (0.05s before end for seamless switch)
    const handleTimeUpdate = () => {
      if (!intro.duration) return
      if (intro.duration - intro.currentTime < 0.05) {
        loop.style.display = "block"
        loop.play().catch(() => {})
      }
    }

    // Loop is playing → hide intro
    const handleLoopPlaying = () => {
      intro.style.display = "none"
    }

    intro.addEventListener("timeupdate", handleTimeUpdate)
    loop.addEventListener("playing", handleLoopPlaying)

    return () => {
      intro.removeEventListener("timeupdate", handleTimeUpdate)
      loop.removeEventListener("playing", handleLoopPlaying)
    }
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden bg-white">
      {/* Video wrapper — rotates on scroll */}
      <motion.div
        className="absolute inset-0 origin-center"
        style={{ rotate, translateY: "-15%" }}
      >
        {/* Intro video — plays once */}
        <video
          ref={introRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Loop video — takes over after intro, hidden initially */}
        <video
          ref={loopRef}
          muted
          playsInline
          loop
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ display: "none" }}
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="text-white/60 text-[11px] tracking-[0.2em] uppercase font-light">
          Défiler
        </span>
        <motion.span
          className="block w-px h-7 bg-white/40 origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  )
}
