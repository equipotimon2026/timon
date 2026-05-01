"use client"

import { cn } from "@/lib/utils"
import { JourneyBadge } from "./journey-badge"
import type { StepStatus } from "./types"

interface JourneyCardProps {
  title: string
  subtitle: string
  status: StepStatus
  accentColor: string
  bgColor: string
  glowColor: string
  /** Whether card is on the right side (even index) */
  isEven: boolean
  progress?: string
  onClick?: () => void
}

export function JourneyCard({
  title,
  subtitle,
  status,
  accentColor,
  bgColor,
  glowColor,
  isEven,
  progress,
  onClick,
}: JourneyCardProps) {
  const isDone = status === "done"
  const isCurrent = status === "current"
  const hasAction = !!onClick

  return (
    <button
      onClick={hasAction ? onClick : undefined}
      disabled={!hasAction}
      className={cn(
        "group flex-1 min-w-0 flex items-center gap-3.5",
        "min-h-[76px] sm:min-h-[80px]",
        "py-[18px] px-5 sm:py-5 sm:px-6",
        "rounded-2xl sm:rounded-[20px]",
        "transition-all duration-200",
        "text-left",
        hasAction ? "cursor-pointer" : "cursor-default",
        !isDone && hasAction && "hover:-translate-y-1"
      )}
      style={{
        background: isDone ? bgColor : "white",
        border: `1.5px solid ${isCurrent ? "transparent" : "var(--border)"}`,
        boxShadow: isCurrent
          ? `inset ${isEven ? "-4px" : "4px"} 0 0 ${accentColor}, 0 12px 40px rgba(67,97,238,0.12), 0 4px 12px rgba(67,97,238,0.06)`
          : isDone
            ? `inset ${isEven ? "-4px" : "4px"} 0 0 ${accentColor}, 0 2px 12px rgba(67,97,238,0.07)`
            : `inset ${isEven ? "-4px" : "4px"} 0 0 ${accentColor}40, 0 2px 12px rgba(67,97,238,0.05)`,
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-tight"
          style={{
            letterSpacing: "-0.2px",
            color: "var(--foreground)",
          }}
        >
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {subtitle}
        </p>
      </div>
      <JourneyBadge
        status={status}
        accentColor={accentColor}
        glowColor={glowColor}
        progress={progress}
      />
    </button>
  )
}
