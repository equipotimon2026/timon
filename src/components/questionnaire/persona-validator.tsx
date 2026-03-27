"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  ArrowRight,
  UserRound,
  ShieldQuestion,
  Search,
  Target,
  Star,
  Lightbulb,
} from "lucide-react"
import type { UserPersona } from "@/types/questionnaire"
import { personaProfiles } from "@/types/questionnaire"
import { cn } from "@/lib/utils"

interface PersonaValidatorProps {
  personas: UserPersona[]
  onSelect: (persona: UserPersona) => void
  onRestart: () => void
}

const dimensionConfig = [
  { key: "perfil" as const, label: "Perfil", icon: UserRound },
  { key: "busca" as const, label: "Busca", icon: Search },
  { key: "expectativa" as const, label: "Expectativa", icon: Target },
  { key: "estrategia" as const, label: "Estrategia", icon: Lightbulb },
]

export function PersonaValidator({
  personas,
  onSelect,
  onRestart,
}: PersonaValidatorProps) {
  const [selected, setSelected] = useState<UserPersona | null>(null)
  const [expanded, setExpanded] = useState<UserPersona | null>(null)

  const profiles = personas.map((p) => personaProfiles[p])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-8">
      <Card className="w-full max-w-4xl overflow-hidden border-0 bg-card/80 shadow-2xl backdrop-blur-sm">
        {/* Top accent */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

        <div className="space-y-6 p-6 sm:p-8">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
              <Star className="h-7 w-7 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl text-balance">
              Con cual de estos perfiles te sentis mas identificado/a?
            </h2>
            <p className="text-sm text-muted-foreground text-pretty">
              Lee cada descripcion con calma, desplegala para ver los detalles y elegi la que mejor refleje tu situacion actual.
            </p>
          </div>

          {/* Persona cards grid */}
          <div className="grid gap-3 sm:grid-cols-1">
            {profiles.map((profile) => {
              const isSelected = selected === profile.id
              const isExpanded = expanded === profile.id

              return (
                <div
                  key={profile.id}
                  className={cn(
                    "group rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30",
                  )}
                >
                  {/* Clickable header */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(profile.id)
                      setExpanded(isExpanded ? null : profile.id)
                    }}
                    className="flex w-full cursor-pointer items-start gap-4 p-4 text-left sm:p-5"
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 bg-transparent",
                      )}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <h3
                        className={cn(
                          "text-base font-semibold transition-colors sm:text-lg",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {profile.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                        {profile.perfil}
                      </p>
                    </div>

                    {/* Expand chevron */}
                    <svg
                      className={cn(
                        "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expandable detail section */}
                  <div
                    className={cn(
                      "grid transition-all duration-200 ease-in-out",
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="grid gap-3 border-t border-border/50 px-4 pb-5 pt-4 sm:grid-cols-3 sm:px-5">
                        {dimensionConfig
                          .filter((d) => d.key !== "perfil")
                          .map((dim) => {
                            const Icon = dim.icon
                            return (
                              <div
                                key={dim.key}
                                className={cn(
                                  "rounded-lg border p-3 transition-colors",
                                  isSelected
                                    ? "border-primary/20 bg-primary/5"
                                    : "border-border bg-secondary/30",
                                )}
                              >
                                <div className="mb-1.5 flex items-center gap-2">
                                  <Icon
                                    className={cn(
                                      "h-4 w-4",
                                      isSelected ? "text-primary" : "text-muted-foreground",
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "text-xs font-semibold uppercase tracking-wider",
                                      isSelected ? "text-primary" : "text-muted-foreground",
                                    )}
                                  >
                                    {dim.label}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed text-foreground/80 text-pretty">
                                  {profile[dim.key]}
                                </p>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onRestart}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ShieldQuestion className="h-4 w-4" />
              Ninguno me representa
            </button>

            <Button
              size="lg"
              disabled={!selected}
              onClick={() => selected && onSelect(selected)}
              className="gap-2 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:shadow-none"
            >
              Confirmar
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
