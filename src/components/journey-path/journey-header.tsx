"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface JourneyHeaderProps {
  userName?: string
  completionPercent?: number
  className?: string
  /** Generate-results action shown beside the progress bar (Tests tab) */
  onGenerate?: () => void
  canGenerate?: boolean
  generating?: boolean
  hasResults?: boolean
  generateLabel?: string
  generateError?: string | null
}

export function JourneyHeader({
  userName,
  completionPercent = 0,
  className,
  onGenerate,
  canGenerate = false,
  generating = false,
  hasResults = false,
  generateLabel,
  generateError,
}: JourneyHeaderProps) {
  const label =
    generateLabel ??
    (generating
      ? "Generando..."
      : hasResults
        ? "Perfil generado"
        : "Generar resultados")

  return (
    <div className={cn("sticky top-2 z-20", className)}>
      <div className="rounded-2xl border bg-white/90 px-5 py-3.5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* Progress bar */}
          <span className="whitespace-nowrap text-xs text-muted-foreground">Perfil al</span>
          <div className="h-[5px] flex-1 min-w-[120px] overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${completionPercent}%`,
                background: "linear-gradient(90deg, #4361EE, #7C3AED)",
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            />
          </div>
          <span className="text-sm font-semibold tabular-nums" style={{ color: "#4361EE" }}>
            {completionPercent}%
          </span>

          {onGenerate && (
            <button
              type="button"
              onClick={onGenerate}
              disabled={!canGenerate}
              className={cn(
                "ml-auto flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all",
                "hover:scale-[1.02] hover:shadow-lg",
                "disabled:cursor-not-allowed disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:scale-100"
              )}
            >
              {generating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {label}
            </button>
          )}
        </div>

        {generateError && (
          <p className="mt-2 text-xs text-destructive">{generateError}</p>
        )}
      </div>
    </div>
  )
}
