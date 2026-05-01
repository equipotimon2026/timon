"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/* V0 estilo-vida.html — chips + radio groups */

type ChipGroup = { id: string; label: string; options: string[] }
type RadioGroup = { id: string; label: string; options: string[] }

const CHIP_GROUPS: ChipGroup[] = [
  { id: "valores", label: "¿Qué valores querés que tu ocupación refleje?", options: ["Servicio a otros","Estabilidad y seguridad","Justicia y ética","Innovación","Creatividad","Prestigio y reconocimiento","Impacto social"] },
  { id: "personas", label: "¿Con qué tipo de personas te gustaría rodearte?", options: ["Jóvenes dinámicos","Personas experimentadas","Gente creativa","Personas organizadas","Públicos diversos"] },
  { id: "rol", label: "¿Qué rol te imaginás dentro de un equipo?", options: ["Líder y coordinador","Creativo · generador de ideas","Organizador · planificador","Ejecutor · resolutivo","Facilitador · mediador"] },
  { id: "limites", label: "Límites — No aceptaría un trabajo que...", options: ["Vaya contra mis valores","Me aísle demasiado","Implique exceso de horas","Sea rutinario al extremo","Fomente competencia desleal"] },
]

const RADIO_GROUPS: RadioGroup[] = [
  { id: "interaccion", label: "Interacción", options: ["Mucho contacto social","Interacciones puntuales","Trabajo individual","Trabajo en pequeños grupos"] },
  { id: "horarios", label: "Horarios", options: ["Horario fijo de oficina","Flexibilidad parcial","Horarios libres y autogestionados"] },
  { id: "rutina", label: "Rutina", options: ["Tareas variadas cada día","Rutina estable y predecible","Mezcla de ambas"] },
  { id: "exigencia", label: "Nivel de exigencia", options: ["Alta exigencia física","Alta exigencia mental","Punto medio de exigencia","Baja exigencia, mayor tranquilidad"] },
  { id: "geografia", label: "Geografía", options: ["Ciudad grande","Ciudad pequeña","Campo o naturaleza","Trabajo que implique viajar","Trabajo remoto desde casa"] },
  { id: "espacio", label: "Espacio ideal", options: ["Oficina formal","Espacio creativo y flexible","Aire libre","Taller o lugar práctico","Casa propia"] },
  { id: "equilibrio", label: "Equilibrio vida / trabajo", options: ["Muy importante — tiempo libre y familia son prioridad","Importante — puedo sacrificarlo a veces","Poco importante — priorizo el trabajo"] },
  { id: "ingresos", label: "Ingresos", options: ["Estabilidad fija (sueldo seguro)","Variables según logros y comisiones","Crecimiento a largo plazo (inversiones)"] },
  { id: "impacto", label: "Impacto que querés tener", options: ["Familia y círculo cercano","Comunidad","País","Global"] },
  { id: "dia", label: "Cómo querés que sea tu día típico", options: ["Tranquilo y organizado","Dinámico y cambiante","Creativo y motivador","Intenso y desafiante"] },
]

type State = { chips: Record<string, string[]>; radios: Record<string, string> }

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function EstiloVidaForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [state, setState] = useState<State>(initialResponses ?? { chips: {}, radios: {} })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { onResponseChange?.(state) }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const radioAnswered = Object.keys(state.radios).length
  const progress = (radioAnswered / RADIO_GROUPS.length) * 100
  const ready = radioAnswered >= 5

  const toggleChip = (groupId: string, opt: string) => {
    setState((s) => {
      const cur = s.chips[groupId] ?? []
      const next = cur.includes(opt) ? cur.filter((c) => c !== opt) : [...cur, opt]
      return { ...s, chips: { ...s.chips, [groupId]: next } }
    })
  }

  const setRadio = (groupId: string, opt: string) => {
    setState((s) => ({ ...s, radios: { ...s.radios, [groupId]: opt } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const r: any[] = []
      let n = 1
      CHIP_GROUPS.forEach((g) => { r.push({ questionNumber: n++, question: g.label, responseArray: state.chips[g.id] ?? [] }) })
      RADIO_GROUPS.forEach((g) => { r.push({ questionNumber: n++, question: g.label, responseText: state.radios[g.id] ?? "" }) })
      await onSave(0, r, { section: "estilo-vida" })
      setDone(true); setTimeout(() => onComplete(), 1500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="text-3xl mb-4">✦</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2" style={{ color: "#1A1918" }}>Módulo completado</h2>
      <p className="text-[15px]" style={{ color: "#7A7570" }}>Tu estilo de vida quedó guardado.</p>
    </div>
  )

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Estilo de Vida</span>
          <span className="text-xs" style={{ color: "#B2ADA6" }}>Módulo 11</span>
        </div>
        <div className="h-0.5" style={{ background: "#EDE8E1" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: "#1A1918" }} />
        </div>
      </div>

      <div className="flex-1 px-4 pt-6 pb-24 max-w-[960px] mx-auto w-full lg:px-12 space-y-6">
        {/* Chips section: Valores y Relaciones */}
        <h3 className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: "#B2ADA6" }}>Valores y Relaciones</h3>
        {CHIP_GROUPS.map((g) => (
          <div key={g.id} className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: "#1A1918" }}>{g.label}</label>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => {
                const on = (state.chips[g.id] ?? []).includes(o)
                return (
                  <button key={o} onClick={() => toggleChip(g.id, o)}
                    className="px-[15px] py-[8px] rounded-full border text-[13px] font-medium transition-all active:scale-[0.96]"
                    style={{ background: on ? "#1A1918" : "white", color: on ? "white" : "#1A1918", borderColor: on ? "#1A1918" : "#EDE8E1" }}>
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Radio section */}
        <h3 className="text-[10.5px] font-bold uppercase tracking-wider pt-2" style={{ color: "#B2ADA6" }}>Ritmo, Organización y Entorno</h3>
        {RADIO_GROUPS.map((g) => (
          <div key={g.id} className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-3" style={{ color: "#B2ADA6" }}>{g.label}</label>
            <div className="space-y-2">
              {g.options.map((o) => {
                const on = state.radios[g.id] === o
                return (
                  <button key={o} onClick={() => setRadio(g.id, o)}
                    className="w-full flex items-center gap-3 px-3.5 py-[11px] rounded-[11px] border text-left text-sm transition-all"
                    style={{ background: on ? "#1A1918" : "white", color: on ? "white" : "#1A1918", borderColor: on ? "#1A1918" : "#EDE8E1" }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      style={{ borderColor: on ? "white" : "#EDE8E1" }}>
                      {on && <div className="w-[7px] h-[7px] rounded-full bg-white" />}
                    </div>
                    {o}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 lg:flex lg:justify-end lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button onClick={handleSave} disabled={!ready || saving}
          className={cn("w-full lg:w-auto lg:min-w-[240px] py-3.5 px-5 rounded-[14px] text-[15px] font-bold text-white transition-all",
            ready ? "opacity-100 hover:opacity-[0.84]" : "opacity-35 pointer-events-none")} style={{ background: "#1A1918" }}>
          {saving ? "Guardando..." : "Guardar →"}
        </button>
      </div>
    </div>
  )
}
