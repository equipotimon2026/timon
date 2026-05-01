"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, X, Send, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const exampleHints = [
  '"Esta pregunta me confundio, no sabia que poner"',
  '"Me resulto largo este bloque, me desconcentre"',
  '"Las opciones de aca no me representan para nada"',
  '"Buenisima esta parte, me hizo pensar mucho"',
  '"No entendi bien que me pedian en la pregunta 3"',
  '"Me parece que faltan opciones mas variadas aca"',
]

interface FeedbackEntry {
  id: string
  text: string
  timestamp: Date
}

interface SectionFeedbackProps {
  userId: number
  onSaveFeedback: (feedback: string) => Promise<void>
}

export function SectionFeedback({ userId, onSaveFeedback }: SectionFeedbackProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [entries, setEntries] = useState<FeedbackEntry[]>([])
  const [showEntries, setShowEntries] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [pulse, setPulse] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHintIndex((prev) => (prev + 1) % exampleHints.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  // Pulse animation every 30 seconds if no feedback given
  useEffect(() => {
    if (entries.length > 0) return
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    }, 30000)
    return () => clearInterval(interval)
  }, [entries.length])

  const handleSubmit = async () => {
    if (!feedbackText.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await onSaveFeedback(feedbackText.trim())

      // Add to local state for UI
      const newEntry: FeedbackEntry = {
        id: crypto.randomUUID(),
        text: feedbackText.trim(),
        timestamp: new Date(),
      }
      setEntries((prev) => [...prev, newEntry])
      setFeedbackText("")
      textareaRef.current?.focus()
    } catch (error) {
      console.error('Error saving feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div data-slot="section-feedback">
      {/* Floating trigger button - fixed bottom right */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-3 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95",
            pulse && "animate-bounce",
            entries.length > 0 && "border-primary/30"
          )}
        >
          <div className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground",
          )}>
            <MessageCircle className="h-4.5 w-4.5" />
          </div>
          <div className="pr-1 text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">
              {entries.length > 0
                ? `${entries.length} comentario${entries.length > 1 ? "s" : ""}`
                : "Dejar feedback"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight truncate max-w-[160px]">
              {entries.length > 0
                ? `Ultimo: ${entries[entries.length - 1].text.substring(0, 25)}...`
                : exampleHints[currentHintIndex]}
            </p>
          </div>
          {entries.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {entries.length}
            </span>
          )}
        </button>
      )}

      {/* Expanded feedback panel - slides up from bottom right */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 w-auto sm:w-[400px] animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between bg-primary px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                    <MessageCircle className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">Deja tu comentario</p>
                    <p className="text-xs text-primary-foreground/70">Escribi lo primero que se te venga a la cabeza</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {/* Rotating examples */}
                <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Tipo de cosas que nos sirven:</p>
                  <p className="text-sm text-foreground italic transition-all duration-300">
                    {exampleHints[currentHintIndex]}
                  </p>
                </div>

                {/* Previous entries */}
                {entries.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowEntries(!showEntries)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mb-2"
                    >
                      <ChevronDown className={cn("h-3 w-3 transition-transform", showEntries && "rotate-180")} />
                      Ver {entries.length} comentario{entries.length > 1 ? "s" : ""} anterior{entries.length > 1 ? "es" : ""}
                    </button>
                    {showEntries && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2 text-xs text-foreground"
                          >
                            <p>{entry.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {entry.timestamp.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Input area */}
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Que pensas de lo que estas haciendo ahora?"
                    className="min-h-[48px] max-h-28 resize-none text-sm rounded-xl"
                    rows={2}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 h-12 w-12 rounded-xl"
                    disabled={!feedbackText.trim() || isSubmitting}
                    onClick={handleSubmit}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
