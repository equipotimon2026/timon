"use client"

import { Card } from "@/components/ui/card"
import { GraduationCap, RefreshCw, Compass } from "lucide-react"

interface CareerStatusProps {
  onSelect: (status: "first" | "change") => void
}

export function CareerStatus({ onSelect }: CareerStatusProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-6 py-8 pt-16">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Es tu primera carrera?
          </h1>
          <p className="text-base text-muted-foreground">
            Esto nos ayuda a personalizar tu experiencia
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-up animation-delay-200">
          {/* First career */}
          <button
            onClick={() => onSelect("first")}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">Primera carrera</h3>
              <p className="text-sm text-muted-foreground">
                Todavia no empece a estudiar una carrera universitaria
              </p>
            </div>
            {/* Hover arrow indicator */}
            <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-primary/0 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/10">
              <svg className="h-4 w-4 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Career change */}
          <button
            onClick={() => onSelect("change")}
            className="group relative flex flex-col items-center gap-4 rounded-2xl border-2 border-border bg-card p-8 text-center transition-all duration-300 hover:border-accent hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 transition-transform duration-300 group-hover:scale-110">
              <RefreshCw className="h-8 w-8 text-accent" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-foreground">Me quiero cambiar</h3>
              <p className="text-sm text-muted-foreground">
                Ya estoy estudiando pero quiero explorar otras opciones
              </p>
            </div>
            {/* Hover arrow indicator */}
            <div className="absolute bottom-4 right-4 h-8 w-8 rounded-full bg-accent/0 flex items-center justify-center transition-all duration-300 group-hover:bg-accent/10">
              <svg className="h-4 w-4 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
