"use client"

import { ArrowRight, Check, AlertTriangle } from "lucide-react"
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

  if (whyMatch.length === 0 && challenges.length === 0) return null

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* A favor */}
      {whyMatch.length > 0 && (
        <div className="p-5 rounded-xl border bg-accent/10 border-accent/30">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <h4 className="text-sm font-semibold text-foreground">A favor</h4>
          </div>
          <ul className="space-y-3">
            {whyMatch.map((description, idx) => (
              <li
                key={`why-${idx}`}
                className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Atención */}
      {challenges.length > 0 && (
        <div className="p-5 rounded-xl border bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-sm font-semibold text-amber-900">Atención</h4>
          </div>
          <ul className="space-y-3">
            {challenges.map((description, idx) => (
              <li
                key={`challenge-${idx}`}
                className="flex items-start gap-2.5 text-sm text-amber-900/80 leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
