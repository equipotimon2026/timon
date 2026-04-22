"use client"

import { cn } from "@/lib/utils"
import { User, Compass, MapPin, Sparkles } from "lucide-react"
import { Act } from "./journey-sidebar"

interface MobileNavProps {
  currentAct: Act
  onNavigate: (act: Act) => void
  progress: number // 0-100
}

const actInfo = {
  persona: { icon: User, label: "Vos" },
  carreras: { icon: Compass, label: "Caminos" },
  universidades: { icon: MapPin, label: "Dónde" },
  futuro: { icon: Sparkles, label: "Futuro" },
}

export function MobileNav({ currentAct, onNavigate, progress }: MobileNavProps) {
  const acts: Act[] = ["persona", "carreras", "universidades", "futuro"]

  return (
    <>
      {/* Top Progress Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-serif text-lg text-foreground">Tu Camino</h1>
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}% completado
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border/50 pb-safe">
        <div className="flex items-center justify-around py-2">
          {acts.map((act, idx) => {
            const info = actInfo[act]
            const Icon = info.icon
            const isActive = currentAct === act
            const isFuturo = act === "futuro"

            return (
              <button
                key={act}
                onClick={() => {
                  if (!isFuturo) {
                    onNavigate(act)
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all",
                  isFuturo
                    ? "opacity-50 cursor-not-allowed text-muted-foreground"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  !isFuturo && isActive ? "bg-primary/10" : "bg-transparent"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  isFuturo
                    ? "text-muted-foreground"
                    : isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {info.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
