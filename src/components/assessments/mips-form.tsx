"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mipsQuestions } from "@/lib/questionnaires/mips-questions"
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Keyboard } from "lucide-react"

type MIPSResponse = Record<number, boolean>

interface MIPSFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
}

export function MIPSForm({ userId, onComplete, onSave }: MIPSFormProps) {
  const [responses, setResponses] = useState<MIPSResponse>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

  const totalQuestions: number = mipsQuestions.length
  const answeredCount = Object.keys(responses).length
  const progress = (answeredCount / totalQuestions) * 100

  const handleResponse = useCallback((value: boolean) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))

    if (currentQuestion < totalQuestions - 1) {
      setAnimationKey((prev) => prev + 1)
      setCurrentQuestion((prev) => prev + 1)
    }
  }, [currentQuestion, totalQuestions])

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setAnimationKey((prev) => prev + 1)
      setCurrentQuestion((prev) => prev - 1)
    }
  }, [currentQuestion])

  const handleNext = useCallback(() => {
    if (currentQuestion < totalQuestions - 1 && responses[currentQuestion] !== undefined) {
      setAnimationKey((prev) => prev + 1)
      setCurrentQuestion((prev) => prev + 1)
    }
  }, [currentQuestion, totalQuestions, responses])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent keyboard shortcuts when user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          handlePrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          handleNext()
          break
        case "v":
        case "V":
        case "1":
          e.preventDefault()
          handleResponse(true)
          break
        case "f":
        case "F":
        case "2":
          e.preventDefault()
          handleResponse(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleResponse, handlePrevious, handleNext])

  const handleFinish = async () => {
    setIsSaving(true)

    try {
      await onSave(0, responses, {
        totalQuestions: mipsQuestions.length,
        section: "mips"
      })

      onComplete()
    } catch (error) {
      console.error("Error saving MIPS responses:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const isLastQuestion = currentQuestion === totalQuestions - 1
  const allAnswered = answeredCount === totalQuestions

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 sm:px-0">
      {/* Header */}
      <Card className="border-none bg-card p-5 sm:p-6 shadow-sm animate-fade-up">
        <div className="space-y-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Personalidad y Estilos</h2>
            <p className="mt-1 text-sm text-muted-foreground">MIPS - Inventario de Millon</p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3 sm:p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lea cada frase y decida si describe o no su forma de ser.
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-semibold text-primary">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
              {progress > 0 && progress < 100 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
            {/* Milestone markers */}
            <div className="flex justify-between px-0.5">
              {[0, 25, 50, 75, 100].map((milestone) => (
                <div key={milestone} className="flex flex-col items-center">
                  <div
                    className={`h-1 w-1 rounded-full transition-colors ${
                      progress >= milestone ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="border-none bg-card p-6 sm:p-8 shadow-sm">
        <div className="space-y-8">
          {/* Question number and text */}
          <div key={animationKey} className="min-h-[100px] sm:min-h-[120px] space-y-4 animate-slide-question">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {currentQuestion + 1}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">de {totalQuestions}</span>
                {responses[currentQuestion] !== undefined && (
                  <CheckCircle2 className="h-4 w-4 text-accent animate-check-pop" />
                )}
              </div>
            </div>

            <p className="text-lg leading-relaxed text-foreground sm:text-xl">{mipsQuestions[currentQuestion]}</p>
          </div>

          {/* True/False buttons - large and satisfying */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => handleResponse(true)}
              className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 sm:py-8 text-center transition-all duration-200 active:scale-[0.97] ${
                responses[currentQuestion] === true
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
              }`}
            >
              {responses[currentQuestion] === true && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary animate-check-pop" />
              )}
              <span className={`text-lg font-bold sm:text-xl transition-colors ${
                responses[currentQuestion] === true ? "text-primary" : "text-foreground"
              }`}>
                Verdadero
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                V
              </kbd>
            </button>

            <button
              onClick={() => handleResponse(false)}
              className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 sm:py-8 text-center transition-all duration-200 active:scale-[0.97] ${
                responses[currentQuestion] === false
                  ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
              }`}
            >
              {responses[currentQuestion] === false && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-primary animate-check-pop" />
              )}
              <span className={`text-lg font-bold sm:text-xl transition-colors ${
                responses[currentQuestion] === false ? "text-primary" : "text-foreground"
              }`}>
                Falso
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                F
              </kbd>
            </button>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <Card className="border-none bg-card p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentQuestion === 0}
            onClick={handlePrevious}
            className="gap-1.5 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {/* Dot indicator for nearby questions */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalQuestions) }).map((_, i) => {
              const startIdx = Math.max(0, Math.min(currentQuestion - 3, totalQuestions - 7))
              const questionIdx = startIdx + i
              if (questionIdx >= totalQuestions) return null
              return (
                <button
                  key={questionIdx}
                  onClick={() => {
                    setAnimationKey((prev) => prev + 1)
                    setCurrentQuestion(questionIdx)
                  }}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    questionIdx === currentQuestion
                      ? "w-6 bg-primary"
                      : responses[questionIdx] !== undefined
                      ? "w-2 bg-accent/60 hover:bg-accent"
                      : "w-2 bg-secondary hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Ir a pregunta ${questionIdx + 1}`}
                />
              )
            })}
          </div>

          {isLastQuestion && allAnswered ? (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={isSaving}
              className="gap-1.5 rounded-xl shadow-md shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Finalizar"
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              disabled={responses[currentQuestion] === undefined}
              className="gap-1.5 rounded-xl"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Keyboard hints - desktop only */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-muted-foreground animate-fade-in animation-delay-500">
        <Keyboard className="h-3.5 w-3.5" />
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">V</kbd> Verdadero
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">F</kbd> Falso
        </span>
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">&larr;</kbd>
          <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px]">&rarr;</kbd> Navegar
        </span>
      </div>
    </div>
  )
}
