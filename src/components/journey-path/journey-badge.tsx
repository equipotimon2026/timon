"use client"

import { cn } from "@/lib/utils"
import type { StepStatus } from "./types"

interface JourneyBadgeProps {
  status: StepStatus
  accentColor: string
  glowColor: string
  /** Optional progress text like "2/4" */
  progress?: string
}

export function JourneyBadge({ status, accentColor, glowColor, progress }: JourneyBadgeProps) {
  const label =
    status === "done"
      ? "Completado"
      : status === "current"
        ? "Empezar →"
        : progress || "Pendiente"

  return (
    <span
      className={cn(
        "inline-flex items-center shrink-0",
        "text-[11px] font-semibold tracking-[0.3px]",
        "px-3 py-[5px] rounded-full",
        "transition-all duration-200"
      )}
      style={
        status === "done"
          ? {
              background: "var(--muted)",
              color: "var(--muted-foreground)",
            }
          : status === "current"
            ? {
                background: accentColor,
                color: "white",
                boxShadow: `0 2px 10px ${glowColor}`,
              }
            : {
                background: "transparent",
                border: "1.5px solid var(--border)",
                color: "var(--muted-foreground)",
              }
      }
    >
      {label}
    </span>
  )
}
