"use client"

import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Clock,
  MessageSquareHeart,
  Gift,
  ArrowRight,
  MessageCircle,
  Compass,
} from "lucide-react"

interface WelcomeScreenProps {
  onContinue: () => void
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Hero header */}
        <div className="space-y-6 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Beta privada
          </div>

          <div className="space-y-4 animate-fade-up animation-delay-100">
            {/* Compass icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-scale-in animation-delay-200">
              <Compass className="h-8 w-8 text-primary" />
            </div>

            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
              Ayudanos a entrenar a{" "}
              <span className="text-primary">Timon</span>
            </h1>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground text-pretty leading-relaxed">
              Esto no es un examen. Estas ayudando a nuestra IA a aprender como
              pensas para revolucionar la orientacion vocacional.
            </p>
          </div>
        </div>

        {/* Mission cards */}
        <div className="grid gap-4 sm:grid-cols-2 animate-fade-up animation-delay-200">
          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-1.5 font-semibold text-foreground">
              Varias secciones
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Completalas con calma, a tu propio ritmo. No hay respuestas
              correctas ni incorrectas.
            </p>
          </div>

          <div className="group rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <MessageSquareHeart className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-1.5 font-semibold text-foreground">
              Tu voz importa
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Necesitamos saber como te sentis en cada parte: si te aburrio, si te
              gusto, si algo no se entendio. Con total honestidad, eso nos ayuda a
              mejorar.
            </p>
          </div>
        </div>

        {/* Feedback button callout */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary bg-primary/5 p-6 animate-fade-up animation-delay-300">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl animate-pulse-soft animation-delay-500" />

          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  El boton de comentarios
                </h3>
                <p className="text-sm font-medium text-primary">
                  Lo mas importante de todo
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Vas a ver un{" "}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                <MessageCircle className="h-3 w-3" />
                boton flotante
              </span>{" "}
              abajo a la derecha durante{" "}
              <span className="font-semibold text-foreground">
                todo el proceso
              </span>
              . Tocalo en cualquier momento para dejarnos un comentario sobre lo
              que estas pensando o sintiendo.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Algo no se entiende", example: "Contanos que parte te confundio" },
                { label: "Te aburriste", example: "Decinos en que seccion y por que" },
                { label: "Te gusto algo", example: "Queremos saber que te gusto" },
                { label: "Se te ocurrio una idea", example: "Toda sugerencia suma" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-background/80 border border-border px-3 py-2.5 transition-colors hover:border-primary/20"
                >
                  <p className="text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.example}</p>
                </div>
              ))}
            </div>

            <p className="text-sm font-semibold text-foreground">
              Tu feedback honesto es lo mas valioso para nosotros. De verdad.
            </p>
          </div>
        </div>

        {/* Reward */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-5 animate-fade-up animation-delay-500">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Tu Recompensa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Por acompanarnos hoy, te regalamos acceso{" "}
                <span className="font-bold text-primary">
                  GRATIS de por vida
                </span>{" "}
                a la plataforma completa cuando lancemos.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-up animation-delay-600">
          <Button
            onClick={onContinue}
            size="lg"
            className="group w-full gap-2.5 text-base font-semibold h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
          >
            Empezar
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Duracion estimada: 30-45 minutos
          </p>
        </div>
      </div>
    </div>
  )
}
