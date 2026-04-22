"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, MapPin, DollarSign, Clock, Building2 } from "lucide-react"
import { University } from "@/lib/university-data"

interface UniversityCardProps {
  university: University
  rank: number
  onSelect: () => void
}

export function UniversityCard({ university, rank, onSelect }: UniversityCardProps) {
  const getExperiencePhrase = () => {
    if (university.type === "Pública") {
      return "Experiencia universitaria clásica con diversidad"
    }
    if (university.religious) {
      return "Formación integral con valores tradicionales"
    }
    return "Enfoque práctico y conexión con el mercado"
  }

  return (
    <button
      onClick={onSelect}
      className="w-full group text-left"
    >
      <article className="relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl md:text-5xl font-serif font-light text-primary/20">
                {rank.toString().padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-lg md:text-xl font-serif text-foreground group-hover:text-primary transition-colors">
                  {university.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    university.type === "Pública"
                      ? "bg-accent/30 text-accent-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}>
                    {university.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{university.modality}</span>
                </div>
              </div>
            </div>

            {/* Match indicator */}
            <div className="text-right shrink-0">
              <div className="text-2xl md:text-3xl font-light text-foreground">
                {university.matchPercentage}%
              </div>
              <p className="text-xs text-muted-foreground">match</p>
            </div>
          </div>

          {/* Experience phrase */}
          <p className="text-base text-foreground/70 mb-5 italic">
            {getExperiencePhrase()}
          </p>

          {/* Quick info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{university.location.zone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>{university.investment.monthlyFee}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{university.studyPlan.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{university.modality}</span>
            </div>
          </div>

          {/* Match reasons preview */}
          {university.compatibility.reasons.slice(0, 2).map((reason, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-2 text-sm mb-1",
                reason.positive ? "text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                reason.positive ? "bg-accent-foreground" : "bg-muted-foreground/50"
              )} />
              <span className="truncate">{reason.text}</span>
            </div>
          ))}

          {/* CTA */}
          <div className="flex items-center justify-end gap-2 text-primary font-medium mt-4 pt-4 border-t border-border/50">
            <span>Ver más</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </button>
  )
}
