"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ClampTextProps {
  children: React.ReactNode
  /** Lines to show before truncating. Default 4. */
  lines?: number
  className?: string
  buttonClassName?: string
  moreLabel?: string
  lessLabel?: string
  printMode?: boolean
}

/**
 * Truncates long output descriptions to `lines` rows with a "Mostrar más" toggle.
 * Project convention: any output description longer than 4 lines gets clamped so
 * a 16-18yo isn't faced with a wall of text, without losing info.
 */
export function ClampText({
  children,
  lines = 4,
  className,
  buttonClassName,
  moreLabel = "Mostrar más",
  lessLabel = "Mostrar menos",
  printMode = false,
}: ClampTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Only meaningful while collapsed: compare full vs clamped height.
    const check = () => setOverflowing(el.scrollHeight - 1 > el.clientHeight)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [children, expanded])

  if (printMode) {
    return <div className={className}>{children}</div>
  }

  return (
    <div>
      <div
        ref={ref}
        className={cn(!expanded && "overflow-hidden", className)}
        style={
          !expanded
            ? {
                display: "-webkit-box",
                WebkitLineClamp: lines,
                WebkitBoxOrient: "vertical",
              }
            : undefined
        }
      >
        {children}
      </div>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "mt-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors",
            buttonClassName
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  )
}
