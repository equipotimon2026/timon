"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const MATERIAS = [
  "Matemática", "Lengua y Literatura", "Historia", "Geografía",
  "Biología", "Física", "Química", "Inglés", "Educación Física",
  "Formación Ética y Ciudadana", "Filosofía", "Economía / Economía Política",
  "Contabilidad / Administración", "Informática / Tecnología",
  "Arte / Educación Artística", "Música",
  "Construcción de Ciudadanía / Sociales",
]

const OPTS = [
  { val: "gusta", label: "Me gusta", color: "#85B882" },
  { val: "indif", label: "Indiferente", color: "#B2ADA6" },
  { val: "quemado", label: "No me gusta", color: "#E07070" },
] as const

type Rating = "gusta" | "indif" | "quemado"

type State = {
  sliderVal: number | null
  contenido: string
  materias: Record<string, Rating>
}

interface VoscolegioFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any
  onResponseChange?: (responses: any) => void
}

export function VoscolegioForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: VoscolegioFormProps) {
  const [state, setState] = useState<State>(
    initialResponses ?? { sliderVal: null, contenido: "", materias: {} }
  )
  const [isSaving, setIsSaving] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  useEffect(() => { onResponseChange?.(state) }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const ratedCount = Object.keys(state.materias).length
  const isReady = state.sliderVal !== null && state.contenido.trim().length > 3 && ratedCount >= 10
  const progressPct = (ratedCount / MATERIAS.length) * 100

  const handleSave = async () => {
    if (!isReady) return
    setIsSaving(true)
    try {
      const r: any[] = [
        { questionNumber: 1, question: "Termómetro familiar", responseInteger: state.sliderVal },
        { questionNumber: 2, question: "Contenido digital", responseText: state.contenido },
      ]
      MATERIAS.forEach((m, i) => {
        if (state.materias[m]) r.push({ questionNumber: i + 3, question: m, responseText: state.materias[m] })
      })
      await onSave(0, r, { section: "voscolegio" })
      setShowCompletion(true)
      setTimeout(() => onComplete(), 1200)
    } catch (e) { console.error("Error saving Voscolegio:", e) }
    finally { setIsSaving(false) }
  }

  if (showCompletion) {
    return (
      <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
        <span className="text-[52px] mb-6">🏫</span>
        <h2 className="text-[26px] font-bold tracking-tight mb-2.5" style={{ color: "#1A1918" }}>¡Listo!</h2>
        <p className="text-[15px] leading-relaxed mb-9" style={{ color: "#7A7570" }}>
          Tu perfil escolar quedó guardado.<br />Seguimos con el siguiente módulo.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Vos y el colegio</span>
          <span className="text-xs" style={{ color: "#B2ADA6" }}>Módulo 2</span>
        </div>
        {/* Progress */}
        <div className="h-[3px]" style={{ background: "#EDE8E1" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "#E8956D", transitionTimingFunction: "cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-5 px-4 pt-6 pb-20 max-w-[1100px] mx-auto w-full lg:px-12">
        {/* Section 1: Slider */}
        <div className="bg-white rounded-[18px] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="flex gap-3.5 px-5 py-4 border-b" style={{ borderColor: "#EDE8E1" }}>
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#FDF0EA", color: "#E8956D" }}>01</div>
            <div>
              <div className="text-[15px] font-bold" style={{ letterSpacing: "-0.2px", color: "#1A1918" }}>El termómetro familiar</div>
              <div className="text-xs mt-0.5" style={{ color: "#B2ADA6" }}>Una pregunta rápida</div>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            <p className="text-sm font-semibold leading-snug" style={{ color: "#1A1918" }}>
              Del 1 al 10, ¿qué tan quemado/a te tiene la típica pregunta de &quot;¿y vos qué vas a estudiar/hacer de tu vida?&quot; en las reuniones familiares?
            </p>
            <div className="text-center">
              <span className="text-[28px] font-bold" style={{ color: "#E8956D" }}>
                {state.sliderVal ?? "—"}
              </span>
            </div>
            <input
              type="range" min={1} max={10} step={1}
              value={state.sliderVal ?? 5}
              onChange={(e) => setState((s) => ({ ...s, sliderVal: Number(e.target.value) }))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: state.sliderVal
                  ? `linear-gradient(to right, #E8956D ${((state.sliderVal - 1) / 9) * 100}%, #EDE8E1 ${((state.sliderVal - 1) / 9) * 100}%)`
                  : "#EDE8E1",
                accentColor: "#E8956D",
              }}
            />
            <div className="flex justify-between text-[11px]" style={{ color: "#B2ADA6" }}>
              <span>1 · Me chupa un huevo</span>
              <span>10 · Me quiero ir del país</span>
            </div>
          </div>
        </div>

        {/* Section 2: Textarea */}
        <div className="bg-white rounded-[18px] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="flex gap-3.5 px-5 py-4 border-b" style={{ borderColor: "#EDE8E1" }}>
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#FDF0EA", color: "#E8956D" }}>02</div>
            <div>
              <div className="text-[15px] font-bold" style={{ letterSpacing: "-0.2px", color: "#1A1918" }}>Tu consumo real</div>
              <div className="text-xs mt-0.5" style={{ color: "#B2ADA6" }}>Contanos qué mirás</div>
            </div>
          </div>
          <div className="px-5 py-5 space-y-2">
            <p className="text-sm font-semibold leading-snug" style={{ color: "#1A1918" }}>
              Cuando abrís YouTube, TikTok o Instagram y te perdés mirando algo por horas sin darte cuenta del tiempo... ¿de qué trata ese contenido?
            </p>
            <p className="text-xs" style={{ color: "#7A7570" }}>
              Pueden ser varios temas. Sé específico/a — no &quot;entretenimiento&quot; sino qué tipo.
            </p>
            <textarea
              value={state.contenido}
              onChange={(e) => setState((s) => ({ ...s, contenido: e.target.value }))}
              placeholder="Ej: tutoriales de diseño 3D, partidas de League of Legends, videos de cocina rara, true crime..."
              rows={4}
              className="w-full px-3.5 py-3 rounded-xl border text-sm resize-y outline-none transition-colors"
              style={{
                background: "#F9F8F6", borderColor: "#EDE8E1", color: "#1A1918",
                lineHeight: "1.6", minHeight: "96px", fontFamily: "inherit",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#E8956D" }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE8E1" }}
            />
          </div>
        </div>

        {/* Section 3: Subjects */}
        <div className="bg-white rounded-[18px] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="flex gap-3.5 px-5 py-4 border-b" style={{ borderColor: "#EDE8E1" }}>
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "#FDF0EA", color: "#E8956D" }}>03</div>
            <div>
              <div className="text-[15px] font-bold" style={{ letterSpacing: "-0.2px", color: "#1A1918" }}>Tus materias</div>
              <div className="text-xs mt-0.5" style={{ color: "#B2ADA6" }}>Calificá al menos 10 de 17</div>
            </div>
          </div>
          <div className="px-5 py-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-2.5 mb-4 text-[11.5px]" style={{ color: "#7A7570" }}>
              {OPTS.map((o) => (
                <span key={o.val} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: o.color }} />
                  {o.label}
                </span>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "#EDE8E1" }}>
              {/* Header */}
              <div className="grid gap-1 px-3.5 py-2.5" style={{ gridTemplateColumns: "1fr repeat(3, auto)", background: "#FDF0EA" }}>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#E8956D" }}>Materia</span>
                {OPTS.map((o) => (
                  <span key={o.val} className="text-[10px] font-bold uppercase tracking-wider text-center min-w-[70px] sm:min-w-[80px]" style={{ color: "#E8956D" }}>
                    {o.label}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {MATERIAS.map((m, idx) => (
                <div
                  key={m}
                  className="grid gap-1 px-3.5 py-2.5 items-center border-t hover:bg-[#FAFAF8] transition-colors"
                  style={{ gridTemplateColumns: "1fr repeat(3, auto)", borderColor: "#EDE8E1" }}
                >
                  <span className="text-[13.5px] font-medium leading-snug" style={{ color: "#1A1918" }}>{m}</span>
                  {OPTS.map((o) => (
                    <div key={o.val} className="flex items-center justify-center min-w-[70px] sm:min-w-[80px]">
                      <label className="cursor-pointer">
                        <input
                          type="radio"
                          name={`mat-${idx}`}
                          className="sr-only peer"
                          checked={state.materias[m] === o.val}
                          onChange={() => setState((s) => ({ ...s, materias: { ...s.materias, [m]: o.val } }))}
                        />
                        <div
                          className={cn(
                            "w-[22px] h-[22px] rounded-full border flex items-center justify-center text-xs transition-all",
                            state.materias[m] === o.val ? "text-white" : ""
                          )}
                          style={{
                            borderColor: state.materias[m] === o.val ? o.color : "#EDE8E1",
                            background: state.materias[m] === o.val ? o.color : "transparent",
                          }}
                        >
                          {state.materias[m] === o.val && "●"}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 lg:flex lg:justify-end lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button
          onClick={handleSave}
          disabled={!isReady || isSaving}
          className={cn(
            "w-full lg:w-auto lg:min-w-[240px] py-3.5 px-5 rounded-[14px] text-[15px] font-bold text-white transition-all",
            isReady ? "opacity-100 cursor-pointer hover:opacity-[0.88] active:scale-[0.98]" : "opacity-35 pointer-events-none"
          )}
          style={{ background: "#E8956D" }}
        >
          {isSaving ? "Guardando..." : "Continuar →"}
        </button>
      </div>
    </div>
  )
}
