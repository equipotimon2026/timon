"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { JourneyHeader } from "./journey-header"
import { JourneyStep } from "./journey-step"
import { JourneyConnector } from "./journey-connector"
import type { JourneyPathProps } from "./types"

/**
 * Journey Path - vertical zigzag timeline showing assessment progress.
 *
 * Renders a path of steps alternating left/right with SVG bezier connectors,
 * colored nodes, accent-striped cards, and status badges.
 *
 * @example
 * ```tsx
 * <JourneyPath
 *   userName="Felipe"
 *   completionPercent={15}
 *   steps={[
 *     {
 *       id: "vibecheck",
 *       order: 1,
 *       title: "¿Con quién te sentís identificado?",
 *       subtitle: "Conocé experiencias de personas en tu misma situación.",
 *       status: "done",
 *       color: { accent: "#10B981", bg: "#ECFDF5", glow: "rgba(16,185,129,.15)" },
 *     },
 *     // ...
 *   ]}
 * />
 * ```
 */
export function JourneyPath({
  steps,
  userName,
  completionPercent,
  className,
}: JourneyPathProps) {
  const stepsContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "min-h-screen py-8 px-4 sm:px-8 lg:px-12",
        className
      )}
      style={{ background: "#EEF4FC" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with greeting + progress */}
        <JourneyHeader
          userName={userName}
          completionPercent={completionPercent}
          className="mb-10"
        />

        {/* Section label */}
        <p
          className="text-xs font-semibold tracking-[0.15em] uppercase mb-8"
          style={{ color: "#4361EE" }}
        >
          Tu camino
        </p>

        {/* Steps with connector overlay */}
        <div ref={stepsContainerRef} className="relative">
          <JourneyConnector steps={steps} containerRef={stepsContainerRef} />

          <div className="relative z-10 flex flex-col gap-6 sm:gap-11 lg:gap-16 xl:gap-20">
            {steps.map((step, index) => (
              <JourneyStep key={step.id} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
