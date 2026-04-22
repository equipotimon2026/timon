"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, Briefcase, GraduationCap, TrendingUp } from "lucide-react"
import { Career } from "@/lib/career-data"

interface CareerCardProps {
  career: Career
  rank: number
  onSelect: () => void
  variant?: "default" | "compact"
}

export function CareerCard({ career, rank, onSelect, variant = "default" }: CareerCardProps) {
  // Generate a short fit phrase based on compatibility
  const getFitPhrase = () => {
    if (career.matchPercentage >= 90) return "Conecta muy bien con tu forma de pensar"
    if (career.matchPercentage >= 80) return "Tiene mucho sentido para tu perfil"
    if (career.matchPercentage >= 70) return "Un camino interesante para explorar"
    return "Vale la pena considerarlo"
  }

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

          {/* Fit phrase */}
          <p className="text-lg text-foreground/80 font-serif italic mb-6">
            &ldquo;{getFitPhrase()}&rdquo;
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{career.academic.weeklyHours}h/sem</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{career.market.jobOutlets?.length || 5}+ roles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>{career.market.jobOutlets?.[0]?.salarySenior || "Competitivo"}</span>
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
  const compatibility = career.compatibility

  const items = [
    {
      label: "Arquitectura mental",
      status: compatibility.mentalArchitecture.status,
      description: compatibility.mentalArchitecture.description,
    },
    {
      label: "Barrera de entrada",
      status: compatibility.entryBarrier.status,
      description: compatibility.entryBarrier.description,
    },
    {
      label: "Batería social",
      status: compatibility.socialBattery.status,
      description: compatibility.socialBattery.description,
    },
    {
      label: "Estilo de vida",
      status: compatibility.lifestyle.status,
      description: compatibility.lifestyle.description,
    },
    {
      label: "Tipo de trabajo",
      status: compatibility.work.status,
      description: compatibility.work.description,
    },
  ]

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            "p-5 rounded-xl border transition-colors",
            item.status === "ÓPTIMO" && "bg-accent/10 border-accent/30",
            item.status === "ALERTA" && "bg-amber-50 border-amber-200",
            item.status === "PELIGRO" && "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              item.status === "ÓPTIMO" && "bg-accent text-accent-foreground",
              item.status === "ALERTA" && "bg-amber-100 text-amber-800",
              item.status === "PELIGRO" && "bg-red-100 text-red-800"
            )}>
              {item.status}
            </span>
            <span className="font-medium text-foreground">{item.label}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}
