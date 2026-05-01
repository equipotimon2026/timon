"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

/* ══════════════════════════════════════
   FLOW DATA — 1:1 from V0 padres.html
══════════════════════════════════════ */
type FlowStep = {
  text: string
  inputType: "none" | "text" | "options" | "divider" | "end"
  delay: number
  options?: string[]
  placeholder?: string
  minChars?: number
  ackText?: string
  nextStep?: Record<string, number>
  conditional?: boolean
}

const buildFlow = (nombre: string): FlowStep[] => [
  { text: `Hola. Este espacio es para que vos — como padre, madre, familiar o tutor de ${nombre} — puedas compartir tu perspectiva. Son preguntas simples y no hay respuestas correctas. Tu mirada nos ayuda mucho a entender mejor el entorno de ${nombre}. Todo lo que respondas es confidencial.`, inputType: "none", delay: 1600 },
  { text: "¿Arrancamos?", inputType: "options", options: ["Sí, empecemos", "Listo/a"], ackText: "Perfecto. Gracias por tu tiempo.", delay: 1000 },
  { text: "— Sobre vos —", inputType: "divider", delay: 300 },
  { text: "¿Cuál es tu nombre y apellido, tu edad y tu ocupación actual?", inputType: "text", minChars: 5, placeholder: "Nombre, edad y ocupación...", delay: 900 },
  { text: "¿Te sentís satisfecho/a con tu ocupación actual?", inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: "¿Comenzaste y abandonaste alguna carrera en algún momento?", inputType: "options", options: ["Sí", "No"], nextStep: { "Sí": 6, "No": 7 }, delay: 800 },
  { text: "¿Cuál fue esa carrera y qué pasó? Contanos un poco más.", inputType: "text", minChars: 5, placeholder: "Contanos...", conditional: true, delay: 700 },
  { text: `¿Te hubiese gustado realizar otra actividad o estudiar otra carrera? ¿Cuál? ¿Recordás por qué no lo hiciste?`, inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: "¿Cuáles son las profesiones y ocupaciones que más valorás hoy en día?", inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: "¿Creés que hay carreras con mayor salida laboral actualmente? ¿Cuáles sí y cuáles menos?", inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: `— Sobre ${nombre} —`, inputType: "divider", delay: 300 },
  { text: `¿Hay alguna ocupación o profesión particular que te gustaría ver en ${nombre}? ¿Cuál y por qué?`, inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 900 },
  { text: `¿Qué habilidades o cualidades destacarías en ${nombre}? ¿Qué aspectos crees que debería trabajar en lo personal?`, inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: `¿Cómo ves la posibilidad de que ${nombre} empiece a trabajar en lugar de estudiar?`, inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: "Para terminar, ¿hay algo más que quieras agregar? Cualquier comentario que sientas que puede ser útil.", inputType: "text", minChars: 5, placeholder: "Contanos...", delay: 800 },
  { text: `¡Muchas gracias! Tu perspectiva es muy valiosa para acompañar a ${nombre} en este proceso. Ya podés cerrar esta pantalla.`, inputType: "end", delay: 1500 },
]

const ACK_POOL = [
  "Gracias por compartir eso.", "Muy valioso, gracias.", "Qué bueno saberlo.",
  "Eso nos ayuda mucho.", "Interesante perspectiva.", "Gracias por la honestidad.",
  "Muy importante eso.", "Qué bueno.", "Lo tomamos en cuenta.",
]

const rnd = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
interface PadresFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any
  onResponseChange?: (responses: any) => void
}

type Message = { type: "bot" | "user" | "divider" | "typing"; text: string }

export function PadresForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: PadresFormProps) {
  const nombre = "el/la estudiante"
  const flow = buildFlow(nombre)
  const totalAnswerable = flow.filter((s) => s.inputType === "text" && !s.conditional).length

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMode, setInputMode] = useState<"none" | "options" | "text" | "end">("none")
  const [currentOptions, setCurrentOptions] = useState<string[]>([])
  const [currentPlaceholder, setCurrentPlaceholder] = useState("")
  const [currentMinChars, setCurrentMinChars] = useState(0)
  const [textValue, setTextValue] = useState("")
  const [responses, setResponses] = useState<{ q: string; a: string }[]>(initialResponses?.responses ?? [])
  const [answeredCount, setAnsweredCount] = useState(0)
  const [flowIdx, setFlowIdx] = useState(0)
  const [started, setStarted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const messagesRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processingRef = useRef(false)
  const responsesRef = useRef(responses)
  responsesRef.current = responses

  useEffect(() => { onResponseChange?.({ responses }) }, [responses]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollBottom = useCallback(() => {
    setTimeout(() => {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" })
    }, 60)
  }, [])

  const addMsg = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg])
    setTimeout(scrollBottom, 80)
  }, [scrollBottom])

  const progressPct = totalAnswerable > 0 ? (answeredCount / totalAnswerable) * 100 : 0

  // Process flow steps
  const processStep = useCallback(async (idx: number) => {
    if (processingRef.current) return
    processingRef.current = true

    const step = flow[idx]
    if (!step) { processingRef.current = false; return }

    if (step.inputType === "divider") {
      addMsg({ type: "divider", text: step.text })
      processingRef.current = false
      setTimeout(() => processStep(idx + 1), 300)
      return
    }

    if (step.inputType === "end") {
      // Save using ref to get latest responses (avoids stale closure)
      setIsSaving(true)
      try {
        const latestResponses = responsesRef.current
        const formattedResponses = latestResponses.map((r, i) => ({
          questionNumber: i + 1, question: r.q, responseText: r.a,
        }))
        await onSave(0, formattedResponses, { section: "padres" })
      } catch (e) { console.error("Error saving Padres:", e) }
      setIsSaving(false)

      // Show typing → final message
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: step.text })
        setInputMode("end")
        processingRef.current = false
        // Mark complete after showing final message
        setTimeout(() => onComplete(), 1500)
      }, step.delay)
      return
    }

    // Show typing indicator
    addMsg({ type: "typing", text: "" })

    setTimeout(() => {
      // Remove typing, add bot message
      setMessages((prev) => prev.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: step.text })

      if (step.inputType === "none") {
        processingRef.current = false
        setTimeout(() => processStep(idx + 1), 400)
      } else if (step.inputType === "options") {
        setCurrentOptions(step.options ?? [])
        setInputMode("options")
        setFlowIdx(idx)
        processingRef.current = false
      } else if (step.inputType === "text") {
        setCurrentPlaceholder(step.placeholder ?? "Escribí tu respuesta...")
        setCurrentMinChars(step.minChars ?? 1)
        setTextValue("")
        setInputMode("text")
        setFlowIdx(idx)
        processingRef.current = false
        setTimeout(() => textareaRef.current?.focus(), 100)
      }
    }, step.delay)
  }, [flow, responses, addMsg, onSave]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start flow
  useEffect(() => {
    if (!started) {
      setStarted(true)
      processStep(0)
    }
  }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptionSelect = (opt: string) => {
    addMsg({ type: "user", text: opt })
    setInputMode("none")

    const step = flow[flowIdx]
    setResponses((prev) => [...prev, { q: step.text, a: opt }])

    // Branching
    if (step.nextStep && step.nextStep[opt] !== undefined) {
      const nextIdx = step.nextStep[opt]
      // Show ack
      if (step.ackText) {
        addMsg({ type: "typing", text: "" })
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.type !== "typing"))
          addMsg({ type: "bot", text: step.ackText! })
          setTimeout(() => processStep(nextIdx), 480)
        }, 650)
      } else {
        setTimeout(() => processStep(nextIdx), 400)
      }
    } else {
      // No branching
      if (step.ackText) {
        addMsg({ type: "typing", text: "" })
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.type !== "typing"))
          addMsg({ type: "bot", text: step.ackText! })
          setTimeout(() => processStep(flowIdx + 1), 480)
        }, 650)
      } else {
        setTimeout(() => processStep(flowIdx + 1), 400)
      }
    }
  }

  const handleTextSubmit = () => {
    if (textValue.trim().length < currentMinChars) return
    addMsg({ type: "user", text: textValue.trim() })
    setInputMode("none")

    const step = flow[flowIdx]
    setResponses((prev) => [...prev, { q: step.text, a: textValue.trim() }])
    setAnsweredCount((c) => c + 1)
    setTextValue("")

    // Random ack
    const ack = rnd(ACK_POOL)
    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: ack })
      setTimeout(() => processStep(flowIdx + 1), 480)
    }, 650)
  }

  const charCount = textValue.trim().length
  const canSend = charCount >= currentMinChars

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex gap-3 px-5 py-4 border-b" style={{ background: "#F9F8F6", borderColor: "#E8E3DC" }}>
        <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "#D97706" }}>
          🏠
        </div>
        <div className="flex-1">
          <h1 className="text-[15px] font-semibold" style={{ letterSpacing: "-0.2px", color: "#2D2D2D" }}>Perspectiva Familiar</h1>
          <p className="text-xs mt-0.5" style={{ color: "#9A9590" }}>
            <span className="inline-block w-[7px] h-[7px] rounded-full mr-1" style={{ background: "#6BCB77" }} />
            Para padres, tutores o familiares
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="shrink-0 flex gap-2.5 px-5 py-2.5 border-b" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
        <span className="text-[15px] shrink-0 mt-px">⚠️</span>
        <p className="text-xs leading-relaxed" style={{ color: "#92400E" }}>
          <strong className="font-semibold">Este módulo es para un familiar.</strong> Si sos el/la estudiante, compartí este link con alguien de confianza.
        </p>
      </div>

      {/* Progress */}
      <div className="shrink-0 h-0.5" style={{ background: "#E8E3DC" }}>
        <div className="h-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "#D97706", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Messages */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-5" style={{ scrollBehavior: "smooth" }}>
        {messages.map((msg, i) => {
          if (msg.type === "typing") {
            return (
              <div key={i} className="self-start animate-[popIn_0.2s_ease_forwards]" style={{ opacity: 0 }}>
                <div className="flex items-center gap-[5px] px-4 py-3 bg-white rounded-[20px] rounded-tl-[5px]" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: "#C8C2BB", animation: `dotBounce 1.1s ease-in-out infinite ${d * 0.18}s` }} />
                  ))}
                </div>
              </div>
            )
          }

          if (msg.type === "divider") {
            return (
              <div key={i} className="flex items-center gap-2.5 my-2 animate-[popIn_0.25s_ease_forwards]" style={{ opacity: 0 }}>
                <div className="flex-1 h-px" style={{ background: "#E8E3DC" }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9A9590" }}>{msg.text}</span>
                <div className="flex-1 h-px" style={{ background: "#E8E3DC" }} />
              </div>
            )
          }

          return (
            <div
              key={i}
              className={cn(
                "flex max-w-[82%] animate-[popIn_0.22s_ease-out_forwards]",
                msg.type === "bot" ? "self-start" : "self-end"
              )}
              style={{ opacity: 0 }}
            >
              <div
                className={cn(
                  "px-3.5 py-2.5 text-[15px] leading-relaxed rounded-[20px]",
                  msg.type === "bot" ? "rounded-tl-[5px] bg-white" : "rounded-tr-[5px]"
                )}
                style={{
                  boxShadow: msg.type === "bot" ? "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)" : undefined,
                  background: msg.type === "user" ? "#EDE8DF" : undefined,
                  color: "#2D2D2D",
                }}
              >
                {msg.text}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input area */}
      <div className="shrink-0 px-4 py-3.5 border-t flex items-center" style={{ background: "#F9F8F6", borderColor: "#E8E3DC", minHeight: "74px" }}>
        {inputMode === "options" && (
          <div className="flex flex-wrap gap-2 w-full">
            {currentOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => handleOptionSelect(opt)}
                className="px-5 py-2.5 rounded-full border text-sm font-medium transition-all hover:text-white active:scale-[0.96]"
                style={{ background: "#F9F8F6", borderColor: "#E8E3DC", color: "#2D2D2D" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2D2D2D"; e.currentTarget.style.color = "#F9F8F6"; e.currentTarget.style.borderColor = "#2D2D2D" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#F9F8F6"; e.currentTarget.style.color = "#2D2D2D"; e.currentTarget.style.borderColor = "#E8E3DC" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {inputMode === "text" && (
          <div className="flex items-end gap-2.5 w-full">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value)
                  // Auto-height
                  e.currentTarget.style.height = "auto"
                  e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 112) + "px"
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (canSend) handleTextSubmit() }
                }}
                placeholder={currentPlaceholder}
                rows={1}
                className="w-full px-4 py-3 rounded-3xl border text-[15px] outline-none resize-none transition-colors"
                style={{
                  background: "white", borderColor: "#E8E3DC", color: "#2D2D2D",
                  lineHeight: "1.5", minHeight: "46px", maxHeight: "112px", fontFamily: "inherit",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#AAA49D" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E8E3DC" }}
              />
              <span className="absolute bottom-1 right-3 text-[11px] font-medium transition-colors" style={{ color: canSend ? "#6BCB77" : "#B8B2AB" }}>
                {charCount}{canSend ? " ✓" : ` / ${currentMinChars}`}
              </span>
            </div>
            <button
              onClick={handleTextSubmit}
              disabled={!canSend}
              className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-80 active:scale-[0.94] disabled:opacity-40"
              style={{ background: "#2D2D2D" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {inputMode === "end" && (
          <div className="w-full text-center text-[13px]" style={{ color: "#9A9590" }}>
            Respuestas guardadas. Podés cerrar esta pantalla. ✓
          </div>
        )}

        {inputMode === "none" && <div className="w-full" />}
      </div>

      <style jsx>{`
        @keyframes popIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
      `}</style>
    </div>
  )
}
