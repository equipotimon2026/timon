"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/* ══════════════════════════════════════
   DATA — 1:1 from V0 prototype
══════════════════════════════════════ */
const PERSONAS = [
  {
    id: "desorientado", titulo: "El Desorientado", nombre: "Julián Cortés",
    emoji: "🧭", accent: "#85B882", accentBg: "#EEF5ED", glow: "rgba(133,184,130,.16)",
    resumen: "No sabe qué quiere ni por dónde arrancar.",
    descripcion: "\u201CA mí me pasa que realmente no sé por dónde arrancar. Tengo clarísimo lo que me cuesta y lo que odio —por ejemplo, sentarme a estudiar historia o las manualidades—, pero si me preguntás en qué soy bueno, me quedo en blanco. Me paraliza pensar en el futuro. Siento que necesito urgente una brújula o alguien que me ordene este caos mental y me diga cuál es el primer paso.\u201D",
    pregunta: "¿Cuál dirías que es tu mayor miedo hoy a la hora de pensar en el futuro, o qué es lo primero que necesitás que te ayuden a destrabar?",
  },
  {
    id: "multipotencial", titulo: "La Multipotencial", nombre: "Sofía Herrera",
    emoji: "⚡", accent: "#9B8EC4", accentBg: "#F2EFF8", glow: "rgba(155,142,196,.16)",
    resumen: "Le va bien en todo y no puede elegir uno.",
    descripcion: "\u201CMi problema es que me entusiasma todo y me va bien en cosas que no tienen nada que ver entre sí. Me encanta la biología, pero también el diseño y la escritura. Siento que elegir una sola carrera es \u2018matar\u2019 mis otras pasiones y encerrarme en una caja. Mi mayor miedo no es equivocarme de decisión, es aburrirme a los dos años de estar haciendo siempre lo mismo.\u201D",
    pregunta: "¿Cuáles son esos dos o tres intereses o hobbies tuyos que parecen no tener nada que ver entre sí, pero que en el fondo te encantaría combinar?",
  },
  {
    id: "detallista", titulo: "El Detallista", nombre: "Martín Navarro",
    emoji: "🔍", accent: "#5CA0C8", accentBg: "#EAF3F8", glow: "rgba(92,160,200,.16)",
    resumen: "Ya filtró el área pero no puede desempatar opciones.",
    descripcion: "\u201CYo ya filtré lo grueso; sé que lo mío son los negocios y los números. Pero me quedé trabado en lo fino. Leo los programas y no entiendo la diferencia real en el día a día entre Administración, Economía Empresarial o Finanzas. Son primas hermanas. Me da pánico estudiar \u2018casi\u2019 lo que quería y pifiarle por milímetros. Necesito poner los planes de estudio lado a lado y ver la salida laboral exacta.\u201D",
    pregunta: "¿Cuáles son exactamente esas dos o tres carreras que tenés en mente y que hoy necesitás desempatar con urgencia?",
  },
  {
    id: "desconectada", titulo: "La Desconectada", nombre: "Valentina Rojas",
    emoji: "💻", accent: "#C4826E", accentBg: "#F8EDEA", glow: "rgba(196,130,110,.16)",
    resumen: "Sus talentos reales no encajan en el sistema educativo.",
    descripcion: "\u201CSiento que el sistema educativo tradicional no es para mí. Veo las materias teóricas de la facultad y no me veo ahí ni a palos. En el colegio me decían que me faltaba ambición, pero la realidad es que me paso horas programando, armando setups o editando videos y soy una crack en eso. No encajo en el molde del estudiante de biblioteca, y quiero saber si lo que yo sé hacer sirve para armar una carrera en el mundo real.\u201D",
    pregunta: "¿Cuál es esa habilidad, tema o proyecto fuera del colegio en el que sabés que le ponés garra y te gustaría descubrir si tiene salida en el mundo real?",
  },
  {
    id: "convencido", titulo: "El Convencido", nombre: "Lucas Benítez",
    emoji: "🎯", accent: "#70B0A0", accentBg: "#EEF5F2", glow: "rgba(112,176,160,.16)",
    resumen: "Ya lo tiene decidido y solo busca confirmación externa.",
    descripcion: "\u201CYo lo tengo decidido desde que tengo uso de razón: voy a ser Odontólogo. En mi familia y en mi grupo de amigos ya me presentan así, es parte de quién soy. No vengo a buscar un test que me tire cinco opciones distintas ni a explorar cosas nuevas. Vengo a que un profesional con experiencia confirme que el camino que elegí está bien y me dé la tranquilidad de que me va a ir excelente.\u201D",
    pregunta: "¿Cuál es esa carrera que ya elegiste y qué duda puntual necesitás que te respondan hoy para irte 100% tranquilo?",
  },
  {
    id: "confirmada", titulo: "La Confirmada", nombre: "Camila Silva",
    emoji: "🚀", accent: "#6888B4", accentBg: "#EBF0F6", glow: "rgba(104,136,180,.16)",
    resumen: "Sabe qué quiere, ahora optimiza el cómo y el dónde.",
    descripcion: "\u201CLa vocación y las habilidades ya las tengo alineadas: voy por Ingeniería. No tengo dudas sobre el \u2018qué\u2019. Mi tema ahora es optimizar. Busco el \u2018dónde\u2019 y el \u2018cómo\u2019 para ser la mejor. Quiero datos duros y objetivos: qué universidad tiene los mejores convenios, qué especialización rinde más a futuro y cómo planificar mis próximos años al detalle para asegurarme la excelencia.\u201D",
    pregunta: "¿Qué carrera elegiste y qué dato duro necesitás comparar ahora mismo —universidades, especializaciones o proyección— para armar tu plan?",
  },
  {
    id: "tiburon", titulo: "El Tiburón", nombre: "Tomás Quiroga",
    emoji: "📈", accent: "#C4AE5A", accentBg: "#F8F4E4", glow: "rgba(196,174,90,.16)",
    resumen: "Ve la carrera como inversión pura, solo le importa la rentabilidad.",
    descripcion: "\u201CSiendo 100% sincero, para mí estudiar es estrictamente una inversión de tiempo y plata. No me mueve la \u2018pasión\u2019 ni encontrar mi propósito espiritual en el trabajo; me mueve el crecimiento y la rentabilidad. Veo la facultad como un escalón necesario para alcanzar mis metas económicas. Le tengo terror a la mediocridad y a ganar un sueldo promedio. Solo quiero saber qué carreras tienen los sueldos más altos y mayor proyección.\u201D",
    pregunta: "¿Tenés algún rubro en la mira, o querés ver directamente cuáles son las áreas con mejores sueldos y proyección hoy en día?",
  },
]

/* ══════════════════════════════════════
   FORM PROPS
══════════════════════════════════════ */
interface VibecheckFormProps {
  userId: number
  onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any
  onResponseChange?: (responses: any) => void
}

type State = {
  selectedId: string
  seen: string[]
  expanded: string[]
  followUpAnswer: string
}

export function VibecheckForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: VibecheckFormProps) {
  const [state, setState] = useState<State>(
    initialResponses ?? { selectedId: "", seen: [], expanded: [], followUpAnswer: "" }
  )
  const [isSaving, setIsSaving] = useState(false)
  const followUpRef = useRef<HTMLDivElement>(null)

  useEffect(() => { onResponseChange?.(state) }, [state]) // eslint-disable-line react-hooks/exhaustive-deps

  const selected = PERSONAS.find((p) => p.id === state.selectedId)
  const seenSet = new Set(state.seen)
  const expandedSet = new Set(state.expanded)

  const markSeen = (id: string) => {
    if (seenSet.has(id)) return
    setState((s) => ({ ...s, seen: [...s.seen, id] }))
  }

  const toggleExpand = (id: string) => {
    if (expandedSet.has(id)) {
      setState((s) => ({ ...s, expanded: s.expanded.filter((x) => x !== id) }))
    } else {
      markSeen(id)
      setState((s) => ({ ...s, expanded: [...s.expanded, id] }))
    }
  }

  const selectPersona = (id: string) => {
    markSeen(id)
    setState((s) => ({ ...s, selectedId: id, followUpAnswer: "" }))
    setTimeout(() => followUpRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150)
  }

  const backToPersonas = () => {
    setState((s) => ({ ...s, selectedId: "", followUpAnswer: "" }))
  }

  const handleSave = async () => {
    if (!selected || state.followUpAnswer.trim().length < 50) return
    setIsSaving(true)
    try {
      await onSave(0, [
        { questionNumber: 1, question: "¿Con quién te sentís identificado/a?", responseText: state.selectedId },
        { questionNumber: 2, question: selected.pregunta, responseText: state.followUpAnswer },
      ], { section: "vibecheck", persona: state.selectedId, personaTitulo: selected.titulo })
      onComplete()
    } catch (e) { console.error("Error saving Vibecheck:", e) }
    finally { setIsSaving(false) }
  }

  return (
    <div style={{ background: "#FAF7F2", minHeight: "100%" }}>
      {/* HERO */}
      <div className="mx-auto max-w-[680px] px-6 pt-12 pb-10 text-center">
        <span className="inline-block text-[10px] font-bold tracking-[2px] uppercase text-[#B2ADA6] bg-[#EDE8E0] rounded-full px-3.5 py-1 mb-5">
          Módulo 1
        </span>
        <h1 className="text-[clamp(24px,3.8vw,40px)] font-bold tracking-tight leading-[1.18] mb-4 text-[#2C2A27]">
          ¿Con quién te<br />sentís identificado/a?
        </h1>
        <p className="text-[15.5px] text-[#7A7570] leading-[1.72] max-w-[520px] mx-auto mb-7">
          Estas son historias de personas en el mismo momento que vos.
          Ninguna te va a describir exactamente —
          simplemente encontrá la que más resuena con lo que estás viviendo hoy.
        </p>

        {/* Progress dots */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#EDE8E0] rounded-full px-4 py-2 text-[12.5px] font-medium text-[#7A7570]">
          <div className="flex gap-[5px]">
            {PERSONAS.map((p) => (
              <div
                key={p.id}
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  background: seenSet.has(p.id) ? p.accent : "#EDE8E0",
                  border: `1.5px solid ${seenSet.has(p.id) ? p.accent : "#EDE8E0"}`,
                }}
              />
            ))}
          </div>
          <span>{seenSet.size} de {PERSONAS.length} leídas</span>
        </div>
      </div>

      {/* PERSONAS GRID */}
      <div className="mx-auto max-w-[1280px] px-6 pb-12 lg:px-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((p) => {
            const isExpanded = expandedSet.has(p.id)
            const isSelected = state.selectedId === p.id
            const isDimmed = state.selectedId !== "" && !isSelected

            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-3xl bg-white overflow-hidden transition-all duration-300",
                  "shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]",
                  !isDimmed && "hover:-translate-y-[3px] hover:shadow-[0_14px_44px_rgba(0,0,0,0.11),0_3px_10px_rgba(0,0,0,0.06)]",
                  isSelected && "shadow-[0_14px_44px_rgba(0,0,0,0.11)]",
                  isDimmed && "opacity-35 pointer-events-none"
                )}
                style={{
                  borderTop: `4px solid ${p.accent}`,
                  border: isSelected ? `2px solid ${p.accent}` : undefined,
                  boxShadow: isSelected ? `0 0 0 3px ${p.glow}, 0 14px 44px rgba(0,0,0,0.11)` : undefined,
                }}
              >
                {/* Card top (clickable) */}
                <div className="px-6 pt-6 cursor-pointer" onClick={() => toggleExpand(p.id)}>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    {/* Emoji box */}
                    <div
                      className="w-12 h-12 rounded-[13px] flex items-center justify-center text-[22px] shrink-0"
                      style={{ background: p.accentBg, color: p.accent }}
                    >
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[9px] font-bold tracking-[1.8px] uppercase" style={{ color: p.accent }}>
                        {p.titulo}
                      </span>
                      <span className="block text-[17px] font-bold tracking-tight">{p.nombre}</span>
                    </div>
                    {/* Badge */}
                    <span
                      className={cn(
                        "shrink-0 inline-flex items-center gap-[5px] text-[10.5px] font-semibold rounded-full px-2.5 py-1 border transition-colors whitespace-nowrap",
                        seenSet.has(p.id) ? "border-transparent" : "border-[#EDE8E0] text-[#B2ADA6]"
                      )}
                      style={seenSet.has(p.id) ? { borderColor: p.accent, color: p.accent, background: p.accentBg } : undefined}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: seenSet.has(p.id) ? p.accent : "#B2ADA6" }}
                      />
                      {seenSet.has(p.id) ? "Leída" : "Sin leer"}
                    </span>
                  </div>
                  <p className="text-sm text-[#7A7570] leading-relaxed pb-4">{p.resumen}</p>
                </div>

                {/* Read more button */}
                {!isSelected && (
                  <button
                    onClick={() => toggleExpand(p.id)}
                    className="w-full text-left px-6 py-3.5 border-t border-[#EDE8E0] text-[13px] font-semibold flex items-center justify-between transition-colors"
                    style={{ background: p.accentBg, color: p.accent }}
                  >
                    {isExpanded ? "Cerrar" : "Leer historia completa"}
                    <svg
                      className={cn("w-4 h-4 transition-transform duration-300", isExpanded && "rotate-180")}
                      viewBox="0 0 24 24" fill="none"
                    >
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {/* Expandable content */}
                <div
                  className="overflow-hidden transition-all duration-[450ms]"
                  style={{ maxHeight: isExpanded ? "600px" : "0px" }}
                >
                  <div className="px-6 pt-5 pb-6 border-t border-[#EDE8E0] space-y-4">
                    {/* Quote */}
                    <p
                      className="text-sm leading-[1.78] text-[#7A7570] italic pl-3.5"
                      style={{ borderLeft: `3px solid ${p.accentBg}` }}
                    >
                      {p.descripcion}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {!isSelected ? (
                        <button
                          onClick={() => selectPersona(p.id)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-colors"
                          style={{ background: p.accentBg, color: p.accent }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = p.accent; e.currentTarget.style.color = "#fff" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = p.accentBg; e.currentTarget.style.color = p.accent }}
                        >
                          Me resuena esta historia
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: p.accent }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Elegiste esta
                        </div>
                      )}

                      <button
                        onClick={() => toggleExpand(p.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#EDE8E0] rounded-full text-xs font-semibold text-[#7A7570] hover:text-[#2C2A27] hover:border-[#2C2A27] transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOLLOW-UP QUESTION */}
      {selected && (
        <div ref={followUpRef} className="mx-auto max-w-[660px] px-6 pb-20 lg:px-16 animate-fade-up">
          <div
            className="bg-white rounded-[28px] p-8 sm:p-9 shadow-[0_10px_44px_rgba(0,0,0,0.12),0_3px_10px_rgba(0,0,0,0.07)]"
            style={{
              border: `2px solid ${selected.accent}`,
              borderTopWidth: "5px",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button
                onClick={backToPersonas}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#EDE8E0] rounded-full text-[12.5px] font-semibold text-[#7A7570] hover:text-[#2C2A27] hover:border-[#2C2A27] hover:bg-[#EDE8E0] transition-colors mr-auto"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver a los perfiles
              </button>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shrink-0"
                style={{ background: selected.accent }}
              >
                {selected.emoji}
              </div>
              <div>
                <span className="block text-sm font-semibold">{selected.nombre}</span>
                <span className="block text-xs text-[#7A7570]">{selected.titulo}</span>
              </div>
            </div>

            {/* Question */}
            <p className="text-lg font-semibold tracking-tight leading-[1.52] mb-6">
              {selected.pregunta}
            </p>

            {/* Textarea */}
            <textarea
              value={state.followUpAnswer}
              onChange={(e) => setState((s) => ({ ...s, followUpAnswer: e.target.value }))}
              placeholder="Escribí tu respuesta acá\u2026"
              rows={4}
              className="w-full min-h-[130px] rounded-2xl border border-[#EDE8E0] px-4 py-4 text-[15px] leading-relaxed resize-y outline-none transition-colors"
              style={{
                background: "#FAF7F2",
                color: "#2C2A27",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = selected.accent
                e.currentTarget.style.boxShadow = `0 0 0 4px ${selected.glow}`
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#EDE8E0"
                e.currentTarget.style.boxShadow = "none"
              }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-5">
              <span
                className="text-xs"
                style={{
                  color: state.followUpAnswer.trim().length >= 50 ? "#6BCB77" : "#B2ADA6",
                }}
              >
                {state.followUpAnswer.trim().length}
                {state.followUpAnswer.trim().length >= 50 ? " ✓" : " / 50"}
                {" "}· Tu respuesta queda guardada en tu perfil.
              </span>

              <button
                onClick={handleSave}
                disabled={state.followUpAnswer.trim().length < 50 || isSaving}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                style={{
                  background: selected.accent,
                  boxShadow: `0 4px 18px ${selected.glow}`,
                }}
              >
                {isSaving ? "Guardando..." : "Guardar y continuar"}
                {!isSaving && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
