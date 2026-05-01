"use client"

import { useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface AssessmentModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

/**
 * Fullscreen modal for assessments. Opens over the journey path
 * so users don't navigate away. Almost full screen with slight padding.
 */
export function AssessmentModal({ open, onClose, children }: AssessmentModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
      document.body.dataset.modalOpen = "true"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
      delete document.body.dataset.modalOpen
    }
  }, [open, handleEsc])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal container */}
      <div
        className={cn(
          "relative z-10 flex flex-col",
          "w-full h-full sm:w-[calc(100%-24px)] sm:h-[calc(100%-24px)] sm:max-w-6xl",
          "sm:rounded-2xl overflow-hidden",
          "bg-[#FAF7F2] shadow-2xl",
          "animate-scale-in"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 z-20",
            "flex items-center gap-2 px-4 py-2",
            "rounded-full border border-[#EDE8E0] bg-white/90 backdrop-blur-sm",
            "text-sm font-semibold text-[#7A7570]",
            "shadow-sm hover:bg-white hover:text-[#2C2A27] hover:border-[#2C2A27]",
            "transition-all duration-150"
          )}
        >
          <X className="h-4 w-4" />
          Volver
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
