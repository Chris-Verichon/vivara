"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

type AnimationState = "init" | "animating" | "done"

export function SunflowerAnimation({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnimationState>("init")

  useEffect(() => {
    const shown = sessionStorage.getItem("vivara_intro_shown")
    if (shown) {
      setState("done")
      return
    }
    setState("animating")
    const timer = setTimeout(() => {
      sessionStorage.setItem("vivara_intro_shown", "true")
      setState("done")
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Full-screen overlay — first visit only */}
      <AnimatePresence>
        {state === "animating" && (
          <motion.div
            key="sunflower-overlay"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FAF7F2]"
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
          >
            <div className="flex flex-col items-center gap-8">
              {/* SVG container — flies to top-left on exit */}
              <motion.div
                exit={{
                  scale: 0.18,
                  x: "calc(-50vw + 56px)",
                  y: "calc(-50vh + 56px)",
                  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
                }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Petals — staggered bloom */}
                  {PETAL_ANGLES.map((angle, i) => (
                    <g key={angle} transform={`rotate(${angle}, 50, 50)`}>
                      <motion.ellipse
                        cx="50"
                        cy="22"
                        rx="7"
                        ry="14"
                        fill="#F5C842"
                        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
                        initial={{ scaleY: 0, opacity: 0 }}
                        animate={{ scaleY: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.4, ease: "easeOut" }}
                      />
                    </g>
                  ))}

                  {/* Outer center circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="17"
                    fill="#8B5E3C"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
                    style={{ transformOrigin: "50px 50px" }}
                  />

                  {/* Inner center — pulsing */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="11"
                    fill="#6B4226"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1, 1.12, 1, 1.12, 1],
                      opacity: [0, 1, 1, 1, 1, 1],
                    }}
                    transition={{
                      delay: 0.45,
                      duration: 2.2,
                      times: [0, 0.12, 0.35, 0.58, 0.78, 1],
                      ease: "easeInOut",
                    }}
                    style={{ transformOrigin: "50px 50px" }}
                  />
                </svg>
              </motion.div>

              {/* Brand name */}
              <motion.p
                className="text-[#C9748A] text-2xl tracking-wide"
                style={{ fontFamily: "var(--font-playfair)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                Vivàra
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content — fades in when animation is done */}
      <motion.div
        animate={{
          opacity: state === "done" ? 1 : 0,
          y: state === "done" ? 0 : 12,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </>
  )
}
