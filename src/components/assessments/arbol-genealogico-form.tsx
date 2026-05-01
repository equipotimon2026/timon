"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const APOYO_OPTS = ["Sí", "Más o menos", "No"]
const ENTORNO_OPTS = ["Me escuchan y acompañan", "Me orientan bastante", "Me presionan", "Casi no se habla del tema"]

type State = { q1: string; q2: string; q3: string; q4: string; q5: string; apoyo: string; entorno: string }

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function ArbolGenealogForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [s, setS] = useState<State>(() => {
    const d = { q1: "", q2: "", q3: "", q4: "", q5: "", apoyo: "", entorno: "" }
    if (initialResponses && typeof initialResponses === "object" && "q1" in initialResponses) return { ...d, ...initialResponses }
    return d
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { onResponseChange?.(s) }, [s]) // eslint-disable-line react-hooks/exhaustive-deps

  const filled = [s.q1, s.q2, s.q3, s.q4, s.q5].filter((v) => (v ?? "").trim().length > 0).length + (s.apoyo ? 1 : 0) + (s.entorno ? 1 : 0)
  const progress = (filled / 7) * 100
  const ready = filled >= 5
  const set = (k: keyof State, v: string) => setS((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (!ready) return; setSaving(true)
    try {
      await onSave(0, [
        { questionNumber: 1, question: "¿A qué se dedican las personas adultas más influyentes?", responseText: s.q1 },
        { questionNumber: 2, question: "¿Alguien cuyo recorrido laboral admires?", responseText: s.q2 },
        { questionNumber: 3, question: "¿Recorrido que no quisieras repetir?", responseText: s.q3 },
        { questionNumber: 4, question: "En tu casa, ¿qué se valora más?", responseText: s.q4 },
        { questionNumber: 5, question: "¿Expectativas sobre qué estudiar?", responseText: s.q5 },
        { questionNumber: 6, question: "¿Te sentís apoyado/a para elegir?", responseText: s.apoyo },
        { questionNumber: 7, question: "Cuando hablás de tu futuro, ¿qué pasa?", responseText: s.entorno },
      ], { section: "familia" })
      setDone(true); setTimeout(() => onComplete(), 1200)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="text-[52px] mb-6">👨‍👩‍👧</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2.5" style={{ color: "#1A1918" }}>¡Listo!</h2>
      <p className="text-[15px] leading-relaxed" style={{ color: "#7A7570" }}>Tu contexto familiar quedó guardado.</p>
    </div>
  )

  const qs: { key: keyof State; label: string }[] = [
    { key: "q1", label: "¿A qué se dedican o se dedicaron las personas adultas más influyentes de tu entorno?" },
    { key: "q2", label: "¿Hay alguien en tu familia o entorno cercano cuyo recorrido laboral admires? ¿Quién y por qué?" },
    { key: "q3", label: "¿Hay algún recorrido laboral o forma de vida que no quisieras repetir? ¿Cuál y por qué?" },
    { key: "q4", label: "En tu casa, ¿qué se valora más?" },
    { key: "q5", label: "¿Sentís que hay expectativas sobre lo que deberías estudiar o hacer? ¿Cuáles?" },
  ]

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Tu entorno familiar</span>
          <span className="text-xs" style={{ color: "#B2ADA6" }}>Módulo 3</span>
        </div>
        <div className="h-0.5" style={{ background: "#EDE8E1" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: "#1A1918" }} />
        </div>
      </div>

      <div className="text-center px-6 pt-10 pb-6 max-w-[680px] mx-auto">
        <h1 className="text-[clamp(22px,3.5vw,32px)] font-bold tracking-tight mb-3" style={{ color: "#1A1918" }}>Tu entorno familiar</h1>
        <p className="text-sm leading-relaxed" style={{ color: "#7A7570" }}>Contanos un poco sobre tu familia y las personas que te rodean.</p>
      </div>

      <div className="flex-1 flex flex-col gap-5 px-4 pb-24 max-w-[960px] mx-auto w-full lg:px-12">
        {qs.map((q) => (
          <div key={q.key} className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1918", lineHeight: "1.35" }}>{q.label}</label>
            <textarea value={s[q.key]} onChange={(e) => set(q.key, e.target.value)} rows={3} placeholder="Escribí tu respuesta..."
              className="w-full px-3.5 py-3 rounded-xl border text-sm resize-y outline-none transition-colors"
              style={{ background: "#F9F8F6", borderColor: "#EDE8E1", color: "#1A1918", lineHeight: "1.6", minHeight: "80px", fontFamily: "inherit" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1A1918" }} onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE8E1" }} />
          </div>
        ))}

        {/* Chips */}
        {[{ key: "apoyo" as const, label: "¿Te sentís apoyado/a para elegir por vos mismo/a?", opts: APOYO_OPTS },
          { key: "entorno" as const, label: "Cuando hablás de tu futuro con tu entorno, ¿qué pasa generalmente?", opts: ENTORNO_OPTS }].map((c) => (
          <div key={c.key} className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#1A1918" }}>{c.label}</label>
            <div className="flex flex-wrap gap-2">
              {c.opts.map((o) => (
                <button key={o} onClick={() => set(c.key, o)}
                  className="px-[18px] py-[9px] rounded-full border text-[13px] font-medium transition-all active:scale-[0.95]"
                  style={{ background: s[c.key] === o ? "#1A1918" : "white", color: s[c.key] === o ? "white" : "#1A1918", borderColor: s[c.key] === o ? "#1A1918" : "#EDE8E1" }}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 lg:flex lg:justify-end lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button onClick={handleSave} disabled={!ready || saving}
          className={cn("w-full lg:w-auto lg:min-w-[240px] py-3.5 px-5 rounded-[14px] text-[15px] font-bold text-white transition-all",
            ready ? "opacity-100 cursor-pointer hover:opacity-[0.88] active:scale-[0.98]" : "opacity-35 pointer-events-none")} style={{ background: "#1A1918" }}>
          {saving ? "Guardando..." : "Continuar →"}
        </button>
      </div>
    </div>
  )
}
