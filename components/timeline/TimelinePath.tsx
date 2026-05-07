"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export type TimelineYear = {
  year: number
  count: number // number of memories this year
}

type Props = {
  years: TimelineYear[]
}

/**
 * Sinuous SVG timeline path.
 * Desktop: horizontal scroll, path snakes left→right→left across rows.
 * Mobile: vertical single column.
 *
 * Layout: years are placed on a grid of nodes. The SVG path
 * connects them with smooth cubic bezier curves.
 */
export function TimelinePath({ years }: Props) {
  if (years.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#888888]">
        <p className="text-lg" style={{ fontFamily: "var(--font-playfair)" }}>
          Aucun souvenir pour l&apos;instant.
        </p>
        <p className="text-sm mt-2">Commencez par ajouter votre premier souvenir.</p>
      </div>
    )
  }

  // --- Layout constants ---
  const NODE_COLS = 4          // nodes per row before wrapping
  const COL_W = 200            // px between nodes horizontally
  const ROW_H = 180            // px between rows vertically
  const PAD_X = 80             // left/right padding
  const PAD_Y = 80             // top padding

  // Build node positions (snake pattern: even rows L→R, odd rows R→L)
  const nodes = years.map((y, i) => {
    const row = Math.floor(i / NODE_COLS)
    const col = i % NODE_COLS
    const isOddRow = row % 2 === 1
    const effectiveCol = isOddRow ? NODE_COLS - 1 - col : col
    return {
      ...y,
      x: PAD_X + effectiveCol * COL_W,
      y: PAD_Y + row * ROW_H,
    }
  })

  const rows = Math.ceil(years.length / NODE_COLS)
  const svgWidth = PAD_X * 2 + (NODE_COLS - 1) * COL_W
  const svgHeight = PAD_Y * 2 + (rows - 1) * ROW_H

  // Build smooth path through all nodes using cubic bezier
  const pathD = nodes.reduce((d, node, i) => {
    if (i === 0) return `M ${node.x} ${node.y}`
    const prev = nodes[i - 1]
    const isNewRow = Math.floor(i / NODE_COLS) !== Math.floor((i - 1) / NODE_COLS)

    if (isNewRow) {
      // Vertical segment connecting rows — curve down
      const cx1 = prev.x
      const cy1 = prev.y + ROW_H * 0.6
      const cx2 = node.x
      const cy2 = node.y - ROW_H * 0.6
      return `${d} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${node.x} ${node.y}`
    }

    // Horizontal segment — gentle wave
    const midX = (prev.x + node.x) / 2
    const waveY = prev.y + (i % 3 === 0 ? -20 : 20)
    return `${d} C ${midX} ${waveY}, ${midX} ${waveY}, ${node.x} ${node.y}`
  }, "")

  return (
    <div className="w-full overflow-x-auto pb-8">
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="mx-auto block"
        aria-label="Timeline"
      >
        {/* Path */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#F4B8C1"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />

        {/* Nodes */}
        {nodes.map((node, i) => {
          const hasMemories = node.count > 0
          const r = hasMemories ? 28 : 16

          return (
            <motion.g
              key={node.year}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.35, ease: "backOut" }}
            >
              {hasMemories ? (
                <Link href={`/timeline/${node.year}`}>
                  {/* Outer glow ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + 6}
                    fill="#F4B8C1"
                    fillOpacity={0.2}
                    className="cursor-pointer"
                  />
                  {/* Main node */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill="white"
                    stroke="#C9748A"
                    strokeWidth={2.5}
                    className="cursor-pointer hover:fill-[#F4B8C1]/30 transition-all duration-200"
                  />
                  {/* Year label */}
                  <text
                    x={node.x}
                    y={node.y - 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={13}
                    fontWeight={600}
                    fill="#C9748A"
                    style={{ fontFamily: "var(--font-playfair)", pointerEvents: "none" }}
                  >
                    {node.year}
                  </text>
                  {/* Memory count badge */}
                  <text
                    x={node.x}
                    y={node.y + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fill="#888888"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.count} {node.count === 1 ? "souvenir" : "souvenirs"}
                  </text>
                </Link>
              ) : (
                /* Empty year — small grey node */
                <g>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r}
                    fill="white"
                    stroke="#E5E5E5"
                    strokeWidth={1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill="#CCCCCC"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {node.year}
                  </text>
                </g>
              )}
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}
