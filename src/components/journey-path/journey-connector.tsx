"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import type { JourneyStepData } from "./types"

interface JourneyConnectorProps {
  steps: JourneyStepData[]
  /** Ref to the container holding the steps */
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * SVG overlay that draws bezier curve connectors between journey step nodes.
 * Renders 3 layers:
 * 1. Background track (light gray)
 * 2. Completed segments (gradient)
 * 3. Upcoming dashed segments
 */
export function JourneyConnector({ steps, containerRef }: JourneyConnectorProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<{ bg: string; done: string; upcoming: string }>({
    bg: "",
    done: "",
    upcoming: "",
  })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const computePaths = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const nodes = container.querySelectorAll<HTMLElement>("[data-journey-node]")
    if (nodes.length < 2) return

    const containerRect = container.getBoundingClientRect()
    const points: { x: number; y: number; done: boolean }[] = []

    nodes.forEach((node, i) => {
      const rect = node.getBoundingClientRect()
      points.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        done: steps[i]?.status === "done",
      })
    })

    setDimensions({
      width: containerRect.width,
      height: containerRect.height,
    })

    let bgPath = ""
    let donePath = ""
    let upcomingPath = ""

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      const seg = `M${p1.x},${p1.y} C${p2.x},${p1.y} ${p1.x},${p2.y} ${p2.x},${p2.y}`

      bgPath += seg + " "

      if (p1.done && p2.done) {
        donePath += seg + " "
      } else {
        upcomingPath += seg + " "
      }
    }

    setPaths({ bg: bgPath.trim(), done: donePath.trim(), upcoming: upcomingPath.trim() })
  }, [steps, containerRef])

  useEffect(() => {
    computePaths()

    const observer = new ResizeObserver(() => computePaths())
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [computePaths, containerRef])

  if (!dimensions.width) return null

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      width={dimensions.width}
      height={dimensions.height}
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="journey-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4361EE" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Background track */}
      {paths.bg && (
        <path
          d={paths.bg}
          fill="none"
          stroke="#C8D6EE"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.6}
        />
      )}

      {/* Completed segments */}
      {paths.done && (
        <path
          d={paths.done}
          fill="none"
          stroke="url(#journey-gradient)"
          strokeWidth={7}
          strokeLinecap="round"
          opacity={0.9}
        />
      )}

      {/* Upcoming dashed segments */}
      {paths.upcoming && (
        <path
          d={paths.upcoming}
          fill="none"
          stroke="#B8C8E4"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="7 11"
          opacity={0.55}
        />
      )}
    </svg>
  )
}
