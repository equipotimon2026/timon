"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

/* V0 orientacion-vocacional.html Part 2 — sentence completion + open questions */

const FRASES = [
  "Siempre me gustó…","En mi casa…","Para trabajar es importante…","Elegir…","A veces me da miedo…",
  "Lo que más me atrae de un trabajo es…","En la vida quiero llegar a ser…","Ir a la universidad hoy…",
  "Las personas que estudian…","Siento que los demás esperan que yo…","Cuando se me acerca una figura de autoridad, yo…","Una profesión me daría la posibilidad de…",
]

const ABIERTAS = [
  "Imaginá que pasaron 10 años y sentís que estás bien con tu vida. ¿Cómo es un día de esa vida?",
  "Si hoy pudieras elegir sin miedo ni presión externa, ¿hacia dónde irías?",
  "¿Qué es lo que más te frena hoy para avanzar hacia lo que querés?",
  "Seamos honestos: ¿qué tan difícil te resulta sentarte y ponerte a estudiar? ¿Cuántas horas seguidas podés hacerlo?",
  "Modelos: ¿A qué personas te quisieras parecer? ¿Por qué?",
  "Cuando eras chico/a, ¿qué querías ser de grande?",
]

const ACK = ["Gracias por compartir eso.","Muy valioso.","Qué bueno saberlo.","Interesante.","Eso dice mucho.","Bueno saberlo."]
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

type Msg = { type: "bot" | "user" | "typing" | "divider"; text: string }

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function ProyectivasForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialResponses?.answers ?? {})
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [inputMode, setInputMode] = useState<"text" | "none" | "end">("none")
  const [qIdx, setQIdx] = useState(0)
  const [textVal, setTextVal] = useState("")
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [phase, setPhase] = useState<"frases" | "abiertas">("frases")
  const msgRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const processingRef = useRef(false)

  const total = FRASES.length + ABIERTAS.length
  useEffect(() => { onResponseChange?.({ answers, phase }) }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = useCallback(() => { setTimeout(() => { msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" }) }, 60) }, [])
  const addMsg = useCallback((m: Msg) => { setMsgs((p) => [...p, m]); setTimeout(scroll, 80) }, [scroll])

  const progress = (Object.keys(answers).length / total) * 100

  const showNext = useCallback((idx: number) => {
    if (phase === "frases" && idx >= FRASES.length) {
      setPhase("abiertas")
      addMsg({ type: "divider", text: "— Preguntas abiertas —" })
      setTimeout(() => showOpenQuestion(0), 600)
      return
    }
    if (phase === "frases") {
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMsgs((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: FRASES[idx] })
        setQIdx(idx); setTextVal(""); setInputMode("text")
        setTimeout(() => textRef.current?.focus(), 100)
      }, 700)
    }
  }, [phase, addMsg]) // eslint-disable-line react-hooks/exhaustive-deps

  const showOpenQuestion = useCallback((idx: number) => {
    if (idx >= ABIERTAS.length) { handleSave(); return }
    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMsgs((p) => p.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: ABIERTAS[idx] })
      setQIdx(FRASES.length + idx); setTextVal(""); setInputMode("text")
      setTimeout(() => textRef.current?.focus(), 100)
    }, 800)
  }, [addMsg]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started) {
      setStarted(true)
      addMsg({ type: "bot", text: "Ahora vamos a completar algunas frases. Escribí lo primero que se te venga a la mente." })
      addMsg({ type: "divider", text: "— Completá las frases —" })
      setTimeout(() => showNext(0), 1000)
    }
  }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    if (!textVal.trim()) return
    setAnswers((a) => ({ ...a, [qIdx]: textVal.trim() }))
    addMsg({ type: "user", text: textVal.trim() })
    setInputMode("none"); setTextVal("")

    const ack = rnd(ACK)
    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMsgs((p) => p.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: ack })
      setTimeout(() => {
        if (phase === "frases") showNext(qIdx + 1)
        else showOpenQuestion(qIdx - FRASES.length + 1)
      }, 400)
    }, 500)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = [...FRASES, ...ABIERTAS].map((q, i) => ({ questionNumber: i + 1, question: q, responseText: answers[i] ?? "" }))
      await onSave(0, r, { section: "proyectivas" })
      setInputMode("end")
      addMsg({ type: "bot", text: "¡Excelente! Terminamos esta parte. Tus respuestas quedaron guardadas. 🎉" })
      setTimeout(() => onComplete(), 1500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  return (
    <div style={{ background: "#F9F8F6" }} className="flex flex-col h-full min-h-full">
      <div className="shrink-0 flex gap-3 px-5 py-4 border-b" style={{ borderColor: "#E8E3DC" }}>
        <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "#2D2D2D", color: "white" }}>✦</div>
        <div className="flex-1">
          <h1 className="text-[15px] font-semibold" style={{ color: "#2D2D2D" }}>Chatiemos · Parte 2</h1>
          <p className="text-xs mt-0.5" style={{ color: "#9A9590" }}>{Object.keys(answers).length} / {total}</p>
        </div>
      </div>
      <div className="shrink-0 h-0.5" style={{ background: "#E8E3DC" }}>
        <div className="h-full transition-all duration-[350ms]" style={{ width: `${progress}%`, background: "#2D2D2D", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      <div ref={msgRef} className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-5" style={{ scrollBehavior: "smooth" }}>
        {msgs.map((m, i) => {
          if (m.type === "typing") return (
            <div key={i} className="self-start" style={{ animation: "popIn 0.2s ease forwards", opacity: 0 }}>
              <div className="flex items-center gap-[5px] px-4 py-3 bg-white rounded-[20px] rounded-tl-[5px]" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                {[0,1,2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: "#C8C2BB", animation: `dotBounce 1.1s ease-in-out infinite ${d*0.18}s` }} />)}
              </div>
            </div>
          )
          if (m.type === "divider") return (
            <div key={i} className="flex items-center gap-2.5 my-2" style={{ animation: "popIn 0.25s ease forwards", opacity: 0 }}>
              <div className="flex-1 h-px" style={{ background: "#E8E3DC" }} />
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#9A9590" }}>{m.text}</span>
              <div className="flex-1 h-px" style={{ background: "#E8E3DC" }} />
            </div>
          )
          return (
            <div key={i} className={cn("flex max-w-[82%]", m.type === "bot" ? "self-start" : "self-end")} style={{ animation: "popIn 0.22s ease-out forwards", opacity: 0 }}>
              <div className={cn("px-3.5 py-2.5 text-[15px] leading-relaxed rounded-[20px]", m.type === "bot" ? "rounded-tl-[5px] bg-white" : "rounded-tr-[5px]")}
                style={{ boxShadow: m.type === "bot" ? "0 1px 6px rgba(0,0,0,0.06)" : undefined, background: m.type === "user" ? "#EDE8DF" : undefined, color: "#2D2D2D" }}>
                {m.text}
              </div>
            </div>
          )
        })}
      </div>

      <div className="shrink-0 px-4 py-3.5 border-t" style={{ borderColor: "#E8E3DC", minHeight: "74px" }}>
        {inputMode === "text" && (
          <div className="flex items-end gap-2.5 w-full">
            <textarea ref={textRef} value={textVal} onChange={(e) => { setTextVal(e.target.value); e.currentTarget.style.height = "auto"; e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 112) + "px" }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (textVal.trim()) handleSubmit() } }}
              placeholder="Escribí tu respuesta..." rows={1}
              className="flex-1 px-4 py-3 rounded-3xl border text-[15px] outline-none resize-none transition-colors"
              style={{ background: "white", borderColor: "#E8E3DC", color: "#2D2D2D", lineHeight: "1.5", minHeight: "46px", maxHeight: "112px", fontFamily: "inherit" }} />
            <button onClick={handleSubmit} disabled={!textVal.trim()}
              className="w-[46px] h-[46px] rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-80 active:scale-[0.94] disabled:opacity-40"
              style={{ background: "#2D2D2D" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
        {inputMode === "end" && <div className="text-center text-[13px]" style={{ color: "#9A9590" }}>Respuestas guardadas ✓</div>}
      </div>

      <style jsx>{`
        @keyframes popIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
      `}</style>
    </div>
  )
}
