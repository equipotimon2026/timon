"use client"

import { Target, Layers, Infinity, HelpCircle } from "lucide-react"
import type { CareerCount } from "@/types/questionnaire"

interface InitialQuestionProps {
  onSelect: (count: CareerCount) => void
}

const options: { value: CareerCount; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  {
    value: "1",
    label: "1 Carrera",
    description: "Tengo una opcion bastante clara en mente",
    icon: <Target className="h-7 w-7" />,
    color: "group-hover:border-emerald-500 group-hover:bg-emerald-500/5",
  },
  {
    value: "2-3",
    label: "2 o 3 Carreras",
    description: "Tengo algunas opciones concretas que me interesan",
    icon: <Layers className="h-7 w-7" />,
    color: "group-hover:border-blue-500 group-hover:bg-blue-500/5",
  },
  {
    value: "many",
    label: "Muchas Carreras",
    description: "Me interesan varias areas y no se por cual decidirme",
    icon: <Infinity className="h-7 w-7" />,
    color: "group-hover:border-violet-500 group-hover:bg-violet-500/5",
  },
  {
    value: "0",
    label: "Ninguna",
    description: "No tengo idea de que estudiar y necesito orientacion",
    icon: <HelpCircle className="h-7 w-7" />,
    color: "group-hover:border-amber-500 group-hover:bg-amber-500/5",
  },
]

export function InitialQuestion({ onSelect }: InitialQuestionProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-4 pt-16">
      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-up">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Cuantas carreras tenes en mente?
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            No hay respuestas correctas, elegí la que mejor te represente
          </p>
        </div>

        {/* Option cards */}
        <div className="grid gap-3 sm:grid-cols-2 animate-fade-up animation-delay-100">
          {options.map((option, index) => (
            <button
              key={option.value}
              className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-card p-6 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${option.color} animate-fade-up`}
              style={{ animationDelay: `${150 + index * 75}ms` }}
              onClick={() => onSelect(option.value)}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-foreground">
                {option.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">{option.label}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
