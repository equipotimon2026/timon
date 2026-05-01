"use client"

import { cn } from "@/lib/utils"

interface JourneyHeaderProps {
  userName?: string
  completionPercent?: number
  className?: string
}

export function JourneyHeader({ userName, completionPercent = 0, className }: JourneyHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress bar */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Perfil al</span>
        <div className="flex-1 h-[5px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${completionPercent}%`,
              background: "linear-gradient(90deg, #4361EE, #7C3AED)",
              transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          />
        </div>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{ color: "#4361EE" }}
        >
          {completionPercent}%
        </span>
      </div>
    </div>
  )
}
