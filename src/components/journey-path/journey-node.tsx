"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
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

  return (
    <div
      data-journey-node
      className={cn(
        "relative flex items-center justify-center shrink-0",
        "w-11 h-11 sm:w-[58px] sm:h-[58px] lg:w-[62px] lg:h-[62px]",
        "rounded-full font-bold text-[15px] transition-all duration-300",
        "font-[var(--brand-font-sans)]"
      )}
      style={{
        background: isDone ? accentColor : "white",
        border: isDone
          ? `2px solid ${accentColor}`
          : isCurrent
            ? `2.5px solid ${accentColor}`
            : "2px solid var(--border)",
        color: isDone
          ? "white"
          : isCurrent
            ? accentColor
            : "var(--muted-foreground)",
        boxShadow: isDone
          ? `0 4px 14px ${glowColor}`
          : isCurrent
            ? `0 0 0 6px ${glowColor}, 0 4px 16px ${glowColor}`
            : "none",
      }}
    >
      {isDone ? (
        <Check className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
      ) : (
        <span>{order}</span>
      )}
    </div>
  )
}
