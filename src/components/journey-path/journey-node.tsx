"use client"

import { cn } from "@/lib/utils"
import { Check, Lock } from "lucide-react"
import type { StepStatus } from "./types"

interface JourneyNodeProps {
  order: number
  status: StepStatus
  accentColor: string
  glowColor: string
}

export function JourneyNode({ order, status, accentColor, glowColor }: JourneyNodeProps) {
  const isDone = status === "done"
  const isCurrent = status === "current"
  const isOutdated = status === "outdated"
  const isLocked = status === "locked"

  // Amber color for outdated
  const outdatedAccent = "#F59E0B"
  const outdatedGlow = "rgba(245,158,11,.2)"

  return (
    <div
      data-journey-node
      className="relative shrink-0"
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          "w-11 h-11 sm:w-[58px] sm:h-[58px] lg:w-[62px] lg:h-[62px]",
          "rounded-full font-bold text-[15px] transition-all duration-300",
          "font-[var(--brand-font-sans)]"
        )}
        style={{
          background: isDone ? accentColor : isOutdated ? "#FFFBEB" : isLocked ? "#F3F4F6" : "white",
          border: isDone
            ? `2px solid ${accentColor}`
            : isOutdated
              ? `2px solid ${outdatedAccent}`
              : isLocked
                ? "2px solid var(--border)"
                : isCurrent
                  ? `2.5px solid ${accentColor}`
                  : "2px solid var(--border)",
          color: isDone
            ? "white"
            : isOutdated
              ? outdatedAccent
              : isLocked
                ? "var(--muted-foreground)"
                : isCurrent
                  ? accentColor
                  : "var(--muted-foreground)",
          boxShadow: isDone
            ? `0 4px 14px ${glowColor}`
            : isOutdated
              ? `0 0 0 4px ${outdatedGlow}, 0 4px 14px ${outdatedGlow}`
              : isCurrent
                ? `0 0 0 6px ${glowColor}, 0 4px 16px ${glowColor}`
                : "none",
        }}
      >
        {isDone ? (
          <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
        ) : (
          <span>{order}</span>
        )}
      </div>
      {isOutdated && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white"
          style={{ background: outdatedAccent }}
          title="Actualizado"
        >
          ✦
        </span>
      )}
    </div>
  )
}
