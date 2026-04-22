"use client"

import { cn } from "@/lib/utils"
import { User, Compass, MapPin, Sparkles, ChevronRight, Lock } from "lucide-react"

export type Act = "persona" | "carreras" | "universidades" | "futuro"
export type Chapter = {
  id: string
  title: string
  act: Act
}

interface JourneySidebarProps {
  currentAct: Act
  currentChapter: string
  chapters: Chapter[]
  onNavigate: (act: Act, chapter: string) => void
  completedChapters: string[]
}

const actInfo = {
  persona: {
    number: "01",
    title: "Entenderte",
    subtitle: "Quién sos",
    icon: User,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  carreras: {
    number: "02",
    title: "Los caminos",
    subtitle: "Qué podés hacer",
    icon: Compass,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary",
  },
  universidades: {
    number: "03",
    title: "Dónde construir",
    subtitle: "Tu lugar",
    icon: MapPin,
    color: "text-accent-foreground",
    bgColor: "bg-accent",
  },
  futuro: {
    number: "04",
    title: "Tu Futuro",
    subtitle: "Cómo será tu vida",
    icon: Sparkles,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
}

export function JourneySidebar({
  currentAct,
  currentChapter,
  chapters,
  onNavigate,
  completedChapters,
}: JourneySidebarProps) {
  const acts: Act[] = ["persona", "carreras", "universidades", "futuro"]

  return (
    <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-background">

      {/* Journey Progress */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-6">
          {acts.map((act) => {
            const info = actInfo[act]
            const Icon = info.icon
            const actChapters = chapters.filter(c => c.act === act)
            const isCurrentAct = currentAct === act
            const isCompleted = actChapters.every(c => completedChapters.includes(c.id))
            const isFuturo = act === "futuro"

            return (
              <div key={act} className="space-y-2">
                {/* Act Header */}
                <button
                  onClick={() => {
                    if (!isFuturo) {
                      onNavigate(act, actChapters[0]?.id || "")
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    isFuturo
                      ? "opacity-50 cursor-not-allowed"
                      : isCurrentAct
                        ? "bg-primary/5 border border-primary/20"
                        : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                    isCurrentAct && !isFuturo ? info.bgColor : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isCurrentAct && !isFuturo ? info.color : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {info.number}
                      </span>
                      {isCompleted && !isFuturo && (
                        <span className="text-xs text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                          Completado
                        </span>
                      )}
                      {isFuturo && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Lock className="w-3 h-3" />
                          (próximamente)
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "font-medium text-sm",
                      isCurrentAct && !isFuturo ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {info.title}
                    </p>
                  </div>
                  {!isFuturo && (
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      isCurrentAct ? "text-primary rotate-90" : "text-muted-foreground"
                    )} />
                  )}
                </button>

                {/* Chapters */}
                {isCurrentAct && !isFuturo && (
                  <div className="ml-5 pl-5 border-l-2 border-border/50 space-y-1 animate-fade-in">
                    {actChapters.map((chapter, idx) => {
                      const isCurrentChapter = currentChapter === chapter.id
                      const isChapterCompleted = completedChapters.includes(chapter.id)

                      return (
                        <button
                          key={chapter.id}
                          onClick={() => onNavigate(act, chapter.id)}
                          className={cn(
                            "w-full text-left py-2 px-3 rounded-lg text-sm transition-all duration-200",
                            isCurrentChapter
                              ? "bg-primary/10 text-primary font-medium"
                              : isChapterCompleted
                              ? "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              : "text-muted-foreground/60 hover:text-muted-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isCurrentChapter
                                ? "bg-primary"
                                : isChapterCompleted
                                ? "bg-accent"
                                : "bg-border"
                            )} />
                            {chapter.title}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Tu progreso se guarda automáticamente
        </p>
      </div>
    </aside>
  )
}
