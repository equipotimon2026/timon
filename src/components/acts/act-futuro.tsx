"use client"

import { Lock } from "lucide-react"

interface ActFuturoProps {
  currentChapter: string
  onNextChapter: () => void
}

export function ActFuturo({ currentChapter, onNextChapter }: ActFuturoProps) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-8">
          <Lock className="w-10 h-10 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-violet-600 uppercase tracking-wider mb-4">
          Acto 04 — Tu Futuro
        </p>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground leading-tight mb-6">
          Próximamente
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Esta sección te mostrará cómo podría verse tu vida en cada camino que elegiste.
          Estamos trabajando en ella.
        </p>
      </div>
    </section>
  )
}
