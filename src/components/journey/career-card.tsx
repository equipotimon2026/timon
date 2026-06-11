"use client"

import { ArrowRight } from "lucide-react"
import { Career } from "@/lib/career-data"

interface CareerCardProps {
  career: Career
  rank: number
  onSelect: () => void
  variant?: "default" | "compact"
}

export function CareerCard({ career, rank, onSelect, variant = "default" }: CareerCardProps) {
  if (variant === "compact") {
    return (
      <button
        onClick={onSelect}
        className="w-full group text-left"
      >
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200">
          <span className="text-3xl font-serif font-light text-primary/30 w-10">
            {rank.toString().padStart(2, '0')}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {career.name}
            </h3>
            <p className="text-sm text-muted-foreground">{career.field}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-2xl font-light text-foreground">{career.matchPercentage}%</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onSelect}
      className="w-full group text-left"
    >
      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary/40 to-primary/20" />

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <span className="text-5xl md:text-6xl font-serif font-light text-primary/20">
                {rank.toString().padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-serif text-foreground group-hover:text-primary transition-colors">
                  {career.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{career.field}</p>
              </div>
            </div>

            {/* Match indicator */}
            <div className="text-right shrink-0">
              <div className="text-3xl md:text-4xl font-light text-foreground">
                {career.matchPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">compatibilidad</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end gap-2 text-primary font-medium">
            <span>Explorar este camino</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </button>
  )
}

// Career Fit Breakdown component
interface CareerFitBreakdownProps {
  career: Career
}

export function CareerFitBreakdown({ career }: CareerFitBreakdownProps) {
  const { whyMatch, challenges } = career.detail

  return (
    <div className="space-y-4">
      {whyMatch.length > 0 && (
        <div className="space-y-4">
          {whyMatch.map((description, idx) => (
            <div
              key={`why-${idx}`}
              className="p-5 rounded-xl border bg-accent/10 border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                  ÓPTIMO
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      )}

      {challenges.length > 0 && (
        <div className="space-y-4">
          {challenges.map((description, idx) => (
            <div
              key={`challenge-${idx}`}
              className="p-5 rounded-xl border bg-amber-50 border-amber-200 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  ALERTA
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
