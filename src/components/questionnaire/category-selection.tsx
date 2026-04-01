"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Circle, User, GraduationCap, ArrowRight, Trophy, Flame } from "lucide-react"
import Link from "next/link"
// UserHeader is rendered by the app layout, not here

type Assessment = {
  id: string
  title: string
  subtitle: string
  description: string
  completed: boolean
}

type CategoryGroup = {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  assessments: Assessment[]
}

interface CategorySelectionProps {
  userName: string
  completedSections: string[]
  onSignOut?: () => void
  onNavigate?: (assessmentId: string) => void
}

function getMotivationalHeader(completedCount: number, totalCount: number) {
  const ratio = completedCount / totalCount
  if (completedCount === 0) {
    return {
      title: "Tu viaje comienza ahora",
      subtitle: "Completa las siguientes secciones para descubrir tu perfil vocacional",
      icon: <Flame className="h-5 w-5 text-primary" />,
    }
  }
  if (ratio < 0.25) {
    return {
      title: "Gran arranque!",
      subtitle: "Ya diste los primeros pasos. Segui asi, cada seccion cuenta",
      icon: <Flame className="h-5 w-5 text-amber-500" />,
    }
  }
  if (ratio < 0.5) {
    return {
      title: "Vas por buen camino",
      subtitle: "Ya completaste casi la mitad. Tu perfil se va dibujando",
      icon: <Flame className="h-5 w-5 text-orange-500" />,
    }
  }
  if (ratio < 0.75) {
    return {
      title: "Mas de la mitad!",
      subtitle: "Ya falta menos. Cada respuesta nos ayuda a conocerte mejor",
      icon: <Flame className="h-5 w-5 text-orange-600" />,
    }
  }
  if (ratio < 1) {
    return {
      title: "La recta final!",
      subtitle: "Estas muy cerca de completar tu perfil vocacional",
      icon: <Trophy className="h-5 w-5 text-amber-500" />,
    }
  }
  return {
    title: "Completaste todo!",
    subtitle: "Tu perfil vocacional esta listo. Gracias por tu tiempo y honestidad",
    icon: <Trophy className="h-5 w-5 text-primary" />,
  }
}

export function CategorySelection({
  userName = "",
  completedSections = [],
  onSignOut,
  onNavigate,
}: CategorySelectionProps) {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([
    {
      id: "personalidad",
      name: "PERSONALIDAD",
      icon: <User className="h-5 w-5" />,
      color: "from-violet-500 to-purple-600",
      assessments: [
        {
          id: "mips",
          title: "Personalidad y Estilos",
          subtitle: "MIPS - MILLON",
          description: "Evalua tu forma de ser y relacionarte.",
          completed: false,
        },
        {
          id: "riasec",
          title: "Intereses y Aptitudes",
          subtitle: "RIASEC - HOLLAND",
          description: "Tipologias vocacionales: Realista, Investigador, Artistico, Social, Emprendedor, Convencional.",
          completed: false,
        },
        {
          id: "herrmann",
          title: "Dominancia Cerebral",
          subtitle: "NED HERRMANN",
          description: "Identifica tu estilo de pensamiento y creatividad.",
          completed: false,
        },
        {
          id: "gardner",
          title: "Inteligencias Multiples",
          subtitle: "GARDNER",
          description: "Descubre tus fortalezas cognitivas.",
          completed: false,
        },
        {
          id: "proyectivas",
          title: "Tecnicas Proyectivas",
          subtitle: "FRASES INCOMPLETAS",
          description: "Completa frases para expresar tus verdaderos sentimientos.",
          completed: false,
        },
        {
          id: "autodescubrimiento",
          title: "Auto-descubrimiento",
          subtitle: "ESTILOS Y TALENTOS",
          description: "Explora tus intereses, estilo y talentos.",
          completed: false,
        },
        {
          id: "estilo-vida",
          title: "Estilo de Vida",
          subtitle: "PREFERENCIAS LABORALES",
          description: "Explora tus intereses, valores y preferencias de estilo de vida laboral.",
          completed: false,
        },
        {
          id: "vision-futuro",
          title: "Vision y Proyeccion a Futuro",
          subtitle: "TOOLKIT DE PROYECCION",
          description: "Visualizaciones, lugar fantaseado y preguntas de profundidad.",
          completed: false,
        },
        {
          id: "arbol-genealogico",
          title: "Arbol Genealogico",
          subtitle: "CONTEXTO FAMILIAR",
          description: "Registra los estudios y ocupaciones de tu familia.",
          completed: false,
        },
      ],
    },
    {
      id: "universidad",
      name: "UNIVERSIDAD",
      icon: <GraduationCap className="h-5 w-5" />,
      color: "from-emerald-500 to-teal-600",
      assessments: [
        {
          id: "universidad",
          title: "Eleccion de Universidad",
          subtitle: "FACTORES DE DECISION",
          description: "Evalua costo, ubicacion, ingreso, identidad y prioriza los factores mas importantes para vos.",
          completed: false,
        },
      ],
    },
  ])

  useEffect(() => {
    setCategoryGroups(prevGroups =>
      prevGroups.map(group => ({
        ...group,
        assessments: group.assessments.map(assessment => ({
          ...assessment,
          completed: completedSections.includes(assessment.id)
        }))
      }))
    )
  }, [completedSections])

  const categories = categoryGroups.flatMap((group) => group.assessments)
  const completedCount = categories.filter((c) => c.completed).length
  const totalCount = categories.length
  const progress = Math.round((completedCount / totalCount) * 100)
  const header = getMotivationalHeader(completedCount, totalCount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-up">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            {header.icon}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {header.title}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground text-pretty">
            {header.subtitle}
          </p>

          {/* Progress Bar */}
          <div className="mx-auto mt-8 max-w-md animate-fade-up animation-delay-100">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso general</span>
              <span className="font-semibold text-primary">
                {completedCount} de {totalCount}
              </span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
              {/* Shimmer overlay on progress bar */}
              {progress > 0 && progress < 100 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
            {/* Percentage label */}
            <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
              {progress}% completado
            </p>
          </div>
        </div>

        {/* Category Groups */}
        <div className="space-y-10">
          {categoryGroups.map((group, groupIndex) => {
            const groupCompleted = group.assessments.filter((a) => a.completed).length
            const groupTotal = group.assessments.length

            return (
              <div key={group.id} className="animate-fade-up" style={{ animationDelay: `${200 + groupIndex * 150}ms` }}>
                {/* Group Header */}
                <div className="mb-6 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${group.color} text-white shadow-sm`}>
                    {group.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-xl font-bold text-foreground">{group.name}</h2>
                      {groupCompleted === groupTotal && groupTotal > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent animate-check-pop">
                          <CheckCircle2 className="h-3 w-3" />
                          Listo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {groupCompleted} de {groupTotal} completadas
                    </p>
                  </div>
                  {/* Mini progress for group */}
                  <div className="hidden sm:block">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${group.color} transition-all duration-500`}
                        style={{ width: `${(groupCompleted / groupTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Assessments Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.assessments.map((assessment, index) => {
                    const CardContent = (
                      <Card className={`group relative h-full overflow-hidden border transition-all duration-300 ${
                        assessment.completed
                          ? "border-accent/30 bg-accent/5"
                          : "cursor-pointer hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5"
                      }`}>
                        {/* Top accent bar */}
                        <div className={`h-1 w-full transition-all duration-300 ${
                          assessment.completed
                            ? "bg-accent"
                            : `bg-gradient-to-r ${group.color} opacity-0 group-hover:opacity-100`
                        }`} />

                        <div className="p-5">
                          {/* Status Icon */}
                          <div className="mb-3 flex items-start justify-between">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                              assessment.completed
                                ? "bg-accent/10"
                                : `bg-gradient-to-br ${group.color} text-white text-sm font-bold shadow-sm group-hover:shadow-md`
                            }`}>
                              {assessment.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-accent animate-check-pop" />
                              ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                              )}
                            </div>
                            {!assessment.completed && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5" />
                            )}
                          </div>

                          {/* Title */}
                          <h3 className={`mb-1 text-base font-bold transition-colors ${
                            assessment.completed ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                          }`}>
                            {assessment.title}
                          </h3>

                          {/* Subtitle */}
                          <p className={`mb-2 text-xs font-medium ${
                            assessment.completed ? "text-muted-foreground/60" : "text-primary/70"
                          }`}>
                            {assessment.subtitle}
                          </p>

                          {/* Description */}
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {assessment.description}
                          </p>

                          {/* Footer */}
                          <div className="mt-3 flex items-center justify-end border-t border-border pt-3">
                            <span className={`text-xs font-semibold transition-all duration-300 ${
                              assessment.completed
                                ? "text-accent"
                                : "text-muted-foreground group-hover:text-primary"
                            }`}>
                              {assessment.completed ? "Completado" : "Comenzar"}
                            </span>
                          </div>
                        </div>
                      </Card>
                    )

                    return (
                      <div
                        key={assessment.id}
                        className="animate-fade-up"
                        style={{ animationDelay: `${300 + groupIndex * 150 + index * 50}ms` }}
                      >
                        {assessment.completed ? (
                          CardContent
                        ) : onNavigate ? (
                          <div onClick={() => onNavigate(assessment.id)} className="cursor-pointer">
                            {CardContent}
                          </div>
                        ) : (
                          <Link href={`/assessment/${assessment.id}`}>
                            {CardContent}
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center animate-fade-in animation-delay-800">
          <p className="text-sm text-muted-foreground">
            Puedes completar las secciones en el orden que prefieras. Tu progreso se guarda automaticamente.
          </p>
        </div>
      </div>
    </div>
  )
}
