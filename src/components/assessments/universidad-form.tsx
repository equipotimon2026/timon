"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/* V0 universidad.html — 5-step wizard */

type State = {
  costo: string; beca: boolean
  zona: string; zonaUniv: string; viaje: string; distancia: string
  examen: string; preparacion: string
  prestigio: string; valores: string; instalaciones: string
  podio: Record<string, number> // factorId → position (1-5)
}

const COSTO_OPTS = [
  { val: "sinCuota", label: "Sin cuota, gratis", sub: "No podemos ir a una universidad privada" },
  { val: "cuotaMedia", label: "Cuota media", sub: "Podemos pagar algunas privadas no muy caras, o ir a las caras si nos dan beca" },
  { val: "cuotaAlta", label: "Cuota alta", sub: "Tenemos la posibilidad de poder pagar casi cualquier universidad" },
]

const YESNO = [
  [
    { val: "si", emoji: "💪", label: "Sí", sub: "Me la banco" },
    { val: "depende", emoji: "🤔", label: "Depende", sub: "De la carrera" },
    { val: "no", emoji: "😬", label: "No", sub: "Prefiero ingreso directo" },
  ],
  [
    { val: "si", emoji: "📚", label: "Sí", sub: "Puedo prepararme bien" },
    { val: "masomenos", emoji: "😅", label: "Más o menos", sub: "Algo de tiempo tengo" },
    { val: "no", emoji: "⏰", label: "No", sub: "El tiempo es limitado" },
  ],
]

const CHIP_GROUPS = [
  { id: "prestigio", label: "Prestigio", opts: ["Muy importante","Algo importante","No me importa"] },
  { id: "valores", label: "Valores e ideología", opts: ["Afiliación religiosa","Ambiente laico","Me es indiferente"] },
  { id: "instalaciones", label: "Instalaciones (campus, laboratorios, tecnología)", opts: ["Me importa mucho","Algo me importa","No es prioritario"] },
]

const PODIO_FACTORS = [
  { id: "costo", emoji: "💰", label: "Costo" },
  { id: "ubicacion", emoji: "📍", label: "Ubicación" },
  { id: "ingreso", emoji: "📝", label: "Tiempo de ingreso" },
  { id: "prestigio", emoji: "✨", label: "Prestigio e instalaciones" },
  { id: "afiliacion", emoji: "🏛️", label: "Afiliación religiosa o ideológica" },
]

const RANKS = [
  { pos: 1, label: "Más importante" },{ pos: 2, label: "Muy importante" },{ pos: 3, label: "Importa" },
  { pos: 4, label: "Menos clave" },{ pos: 5, label: "Menos importante" },
]

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function UniversidadForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [step, setStep] = useState(0)
  const [state, setState] = useState<State>(initialResponses ?? {
    costo: "", beca: false, zona: "", zonaUniv: "", viaje: "", distancia: "",
    examen: "", preparacion: "", prestigio: "", valores: "", instalaciones: "", podio: {},
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null)

  useEffect(() => { onResponseChange?.(state) }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof State, v: any) => setState((s) => ({ ...s, [k]: v }))

  const stepReady = (i: number) => {
    if (i === 0) return state.costo !== ""
    if (i === 1) return state.zona.trim().length > 0
    if (i === 2) return state.examen !== "" && state.preparacion !== ""
    if (i === 3) return state.prestigio !== "" && state.valores !== "" && state.instalaciones !== ""
    if (i === 4) return Object.keys(state.podio).length === 5
    return false
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(0, [
        { questionNumber: 1, question: "Costo", responseText: state.costo },
        { questionNumber: 2, question: "Beca", responseText: state.beca ? "Sí" : "No" },
        { questionNumber: 3, question: "Zona de vivienda", responseText: state.zona },
        { questionNumber: 4, question: "Zona universidad", responseText: state.zonaUniv },
        { questionNumber: 5, question: "Tiempo de viaje", responseText: state.viaje },
        { questionNumber: 6, question: "Dispuesto a mudarse", responseText: state.distancia },
        { questionNumber: 7, question: "Examen eliminatorio", responseText: state.examen },
        { questionNumber: 8, question: "Tiempo de preparación", responseText: state.preparacion },
        { questionNumber: 9, question: "Prestigio", responseText: state.prestigio },
        { questionNumber: 10, question: "Valores e ideología", responseText: state.valores },
        { questionNumber: 11, question: "Instalaciones", responseText: state.instalaciones },
        { questionNumber: 12, question: "Podio de prioridades", responseText: JSON.stringify(state.podio) },
      ], { section: "universidad" })
      setDone(true); setTimeout(() => onComplete(), 1500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const assignToRank = (pos: number) => {
    if (!selectedFactor) return
    setState((s) => {
      const next = { ...s.podio }
      // Remove factor from current position
      Object.keys(next).forEach((k) => { if (next[k] === pos) delete next[k] })
      // Remove this factor from any position
      delete next[selectedFactor]
      next[selectedFactor] = pos
      return { ...s, podio: next }
    })
    setSelectedFactor(null)
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="text-[52px] mb-6">🎓</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2" style={{ color: "#1A1918" }}>¡Tu perfil universitario está listo!</h2>
      <p className="text-[15px]" style={{ color: "#7A7570" }}>Guardamos tus prioridades.</p>
    </div>
  )

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Universidad</span>
          <span className="text-xs" style={{ color: "#B2ADA6" }}>Paso {step + 1} de 5</span>
        </div>
        {/* Progress dots */}
        <div className="flex gap-1.5 px-5 pb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full transition-colors" style={{ background: i <= step ? "#1A1918" : "#EDE8E1" }} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-24 max-w-[960px] mx-auto w-full lg:px-12">
        {/* Step 0: Costo */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Paso 1 de 5</div>
            <h2 className="text-[26px] font-bold" style={{ color: "#1A1918" }}>Costo</h2>
            <p className="text-sm" style={{ color: "#7A7570" }}>¿Qué tipo de cuota decidieron pagar para tus estudios?</p>
            <div className="space-y-3 mt-4">
              {COSTO_OPTS.map((o) => (
                <button key={o.val} onClick={() => set("costo", o.val)}
                  className="w-full flex items-center gap-3 px-[18px] py-4 rounded-[14px] border-2 text-left transition-all"
                  style={{ borderColor: state.costo === o.val ? "#1A1918" : "#EDE8E1", background: state.costo === o.val ? "#F5F3F0" : "white" }}>
                  <div className="w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: state.costo === o.val ? "#1A1918" : "#EDE8E1" }}>
                    {state.costo === o.val && <div className="w-2 h-2 rounded-full bg-[#1A1918]" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "#1A1918" }}>{o.label}</div>
                    <div className="text-xs" style={{ color: "#7A7570" }}>{o.sub}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 px-1">
              <span className="text-sm" style={{ color: "#7A7570" }}>¿Dispuesto/a a cumplir requisitos de beca?</span>
              <button onClick={() => set("beca", !state.beca)}
                className="w-[44px] h-[26px] rounded-full transition-colors relative" style={{ background: state.beca ? "#1A1918" : "#EDE8E1" }}>
                <div className="w-[22px] h-[22px] rounded-full bg-white absolute top-[2px] transition-all" style={{ left: state.beca ? "20px" : "2px" }} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Ubicación */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Paso 2 de 5</div>
            <h2 className="text-[26px] font-bold" style={{ color: "#1A1918" }}>Ubicación y Viaje</h2>
            {[
              { key: "zona" as const, label: "¿Dónde vas a vivir mientras estudiás?", ph: "Ej: CABA, Palermo / Rosario..." },
              { key: "zonaUniv" as const, label: "¿Dónde aceptarías que esté la universidad?", ph: "Ej: CABA, zona norte, cualquier lugar..." },
              { key: "viaje" as const, label: "¿Cuánto tiempo de viaje aceptás?", ph: "Ej: hasta 1 hora, no me importa..." },
              { key: "distancia" as const, label: "¿Dispuesto/a a mudarte si fuera necesario?", ph: "Ej: Sí / Tal vez / No" },
            ].map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-sm font-semibold" style={{ color: "#1A1918" }}>{f.label}</label>
                <input type="text" value={state[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.ph}
                  className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{ borderColor: "#EDE8E1", color: "#1A1918", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#1A1918" }} onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE8E1" }} />
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Requisitos */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Paso 3 de 5</div>
            <h2 className="text-[26px] font-bold" style={{ color: "#1A1918" }}>Requisitos de Inscripción</h2>
            {YESNO.map((group, gi) => (
              <div key={gi} className="space-y-2">
                <p className="text-sm font-semibold" style={{ color: "#1A1918" }}>
                  {gi === 0 ? "¿Dispuesto/a a rendir un examen eliminatorio?" : "¿Tenés tiempo para prepararte antes de entrar?"}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {group.map((o) => {
                    const selected = gi === 0 ? state.examen === o.val : state.preparacion === o.val
                    return (
                      <button key={o.val} onClick={() => set(gi === 0 ? "examen" : "preparacion", o.val)}
                        className={cn("flex flex-col items-center py-5 px-3 rounded-[14px] border-2 transition-all hover:-translate-y-0.5",
                          selected ? "border-[#1A1918] bg-[#F5F3F0]" : "border-[#EDE8E1] bg-white")}>
                        <span className="text-[30px] mb-2">{o.emoji}</span>
                        <span className="text-lg font-bold" style={{ color: "#1A1918" }}>{o.label}</span>
                        <span className="text-[11.5px]" style={{ color: "#7A7570" }}>{o.sub}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Perfil Institucional */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Paso 4 de 5</div>
            <h2 className="text-[26px] font-bold" style={{ color: "#1A1918" }}>Perfil Institucional</h2>
            <p className="text-sm" style={{ color: "#7A7570" }}>¿Qué priorizás en la institución?</p>
            {CHIP_GROUPS.map((g) => (
              <div key={g.id} className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: "#1A1918" }}>{g.label}</label>
                <div className="flex flex-wrap gap-2">
                  {g.opts.map((o) => {
                    const on = state[g.id as keyof State] === o
                    return (
                      <button key={o} onClick={() => set(g.id as keyof State, o)}
                        className="px-[15px] py-[8px] rounded-full border text-[13px] font-medium transition-all active:scale-[0.96]"
                        style={{ background: on ? "#1A1918" : "white", color: on ? "white" : "#1A1918", borderColor: on ? "#1A1918" : "#EDE8E1" }}>
                        {o}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Podio */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Paso 5 de 5</div>
            <h2 className="text-[26px] font-bold" style={{ color: "#1A1918" }}>Armá tu Podio</h2>
            <p className="text-sm" style={{ color: "#7A7570" }}>Tocá un factor, luego tocá la posición donde querés colocarlo.</p>

            {/* Source factors */}
            <div className="flex flex-wrap gap-2">
              {PODIO_FACTORS.filter((f) => !(f.id in state.podio)).map((f) => (
                <button key={f.id} onClick={() => setSelectedFactor(f.id)}
                  className={cn("px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                    selectedFactor === f.id ? "border-[#1A1918] bg-[#F5F3F0]" : "border-[#EDE8E1] bg-white")}>
                  {f.emoji} {f.label}
                </button>
              ))}
            </div>

            {/* Rank zones */}
            <div className="grid grid-cols-2 gap-3">
              {RANKS.map((rank) => {
                const placed = PODIO_FACTORS.find((f) => state.podio[f.id] === rank.pos)
                return (
                  <button key={rank.pos} onClick={() => assignToRank(rank.pos)}
                    className={cn("rounded-[14px] border-2 border-dashed p-4 text-left transition-all min-h-[80px]",
                      selectedFactor ? "border-[#1A1918] bg-[#FAFAF8] cursor-pointer" : "border-[#EDE8E1]",
                      rank.pos === 5 && "col-span-2")}
                    style={{ borderStyle: placed ? "solid" : "dashed" }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold" style={{ color: "#1A1918" }}>{rank.pos}°</span>
                      <span className="text-xs" style={{ color: "#7A7570" }}>{rank.label}</span>
                    </div>
                    {placed && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "#F5F3F0", color: "#1A1918" }}>
                          {placed.emoji} {placed.label}
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); setState((s) => { const p = { ...s.podio }; delete p[placed.id]; return { ...s, podio: p } }) }}
                          className="text-xs px-1.5 py-0.5 rounded text-[#7A7570] hover:text-[#1A1918]">✕</button>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 flex items-center justify-between lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
          className="px-5 py-3 rounded-[14px] border text-sm font-semibold transition-opacity disabled:opacity-0"
          style={{ borderColor: "#EDE8E1", color: "#7A7570" }}>← Atrás</button>
        {step < 4 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={!stepReady(step)}
            className={cn("px-8 py-3.5 rounded-[14px] text-[15px] font-bold text-white transition-all",
              stepReady(step) ? "hover:opacity-[0.88]" : "opacity-35 pointer-events-none")} style={{ background: "#1A1918" }}>
            Siguiente
          </button>
        ) : (
          <button onClick={handleSave} disabled={!stepReady(4) || saving}
            className={cn("px-8 py-3.5 rounded-[14px] text-[15px] font-bold text-white transition-all",
              stepReady(4) ? "hover:opacity-[0.88]" : "opacity-35 pointer-events-none")} style={{ background: "#1A1918" }}>
            {saving ? "Guardando..." : "Terminar y guardar"}
          </button>
        )}
      </div>
    </div>
  )
}
