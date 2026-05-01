"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

/* V0 sobrevivientes.html — RIASEC Holland 1:1 replica */

const TYPES = ["R", "I", "A", "S", "E", "C"] as const
type RType = (typeof TYPES)[number]

const TYPE_INFO: Record<RType, { name: string; color: string }> = {
  R: { name: "Realista", color: "#C87828" },
  I: { name: "Investigador", color: "#2E78C8" },
  A: { name: "Artístico", color: "#A83080" },
  S: { name: "Social", color: "#248850" },
  E: { name: "Emprendedor", color: "#C02828" },
  C: { name: "Convencional", color: "#6048A8" },
}

const SECTIONS = [
  { title: "Características de Personalidad", subtitle: "Marcá las que sentís que te describen.", items: {
    R: ["Dinámico","Concreto","Conservador","Franco","Independiente","Persistente","Práctico","Bien coordinado","Rígido","Fuerte","Ahorrador","Tradicional","Individualista"],
    I: ["Original","Metódico","Explorador","Independiente","Investigador","Intelectual","Lógico","Observador","Racional","Curioso","Reservado","Preciso","Investigativo"],
    A: ["Soñador","Informal","Emocional","Impulsivo","Imaginativo","Original","Espontáneo","No conformista","Expresivo","Independiente","Práctico","Sensible","Creativo"],
    S: ["Cálido","Sensible","Cooperativo","Honesto","Amigable","Generoso","Responsable","Genuino","Perceptivo","Sociable","Comprensivo","Soñador","Prudente"],
    E: ["Aventurero","Dinámico","Dominante","Popular","Seguro de sí","Sociable","Curioso","Extrovertido","Optimista","Colaborador","Persuasivo","Decidido","Competitivo"],
    C: ["Preciso","Ordenado","Cuidadoso","Organizado","Conformista","Conservador","Eficiente","Prudente","Detallista","Responsable","Práctico","Predecible","Callado"],
  }},
  { title: "Habilidades", subtitle: "Marcá las habilidades que reconocés en vos.", items: {
    R: ["Mecánica","Atlética","Manual","Precisión","Practicidad","Estabilidad","Analítica","Crítica","Uso del cuerpo","Espacial"],
    I: ["Analítica","Abstracta","Matemática","Científica","Verbal","Resolutiva","Metódica","Observación","Paciencia","Investigación"],
    A: ["Creativa","Expresiva","Intuitiva","Introspectiva","Musical","Diseño","Espacial","Imaginación","Detalle","Innovación"],
    S: ["Enseñanza","Comprensión","Escucha","Ayuda al otro","Comunicación","Imaginación","Responsabilidad","Mediador","Persuasión","Astucia"],
    E: ["Persuasión","Responsabilidad","Liderazgo","Comunicación","Expresión oral","Organización","Objetividad","Practicidad","Tolerancia","Ambición"],
    C: ["Cálculo","Finanzas","Prolijidad","Planificación","Método","Orden","Responsabilidad","Practicidad","Detalle","Exactitud"],
  }},
  { title: "Intereses", subtitle: "Marcá los que observás más en tu persona.", items: {
    R: ["Cálculo","Científico","Manual","Ser preciso","Planificación"],
    I: ["Ordenar","Numérico","Análisis/síntesis","Orden/precisión","Investigación"],
    A: ["Estético","Equilibrado","Manual","Visual","Auditivo"],
    S: ["Precisión verbal","Organización","Comunicación","Ayuda","Justicia"],
    E: ["Organización","Supervisión","Colaboración","Análisis/síntesis","Estrategias"],
    C: ["Orden","Supervisión","Computación","Detalle","Cálculo"],
  }},
  { title: "Motivaciones", subtitle: "Marcá las que registrás en tu vida.", items: {
    R: ["Lo tradicional","Vida al aire libre","Trabajo manual","Sentido común","Naturaleza","Deportes"],
    I: ["Conocimiento","Resolución de problemas","Independencia","Teorías","Ciencia","Curiosidad"],
    A: ["Ayuda","Arte","Lograr armonía","Observación","Expresión","La belleza"],
    S: ["Cooperación","Trabajo en equipo","Comunicación","Protección","Curar","El desarrollo personal"],
    E: ["Desafíos","Competencia","Organización","Poder/servicio","El estatus","Emprender"],
    C: ["Seguridad","Precisión","Eficiencia","Estadísticas","Métodos","Pertenencia"],
  }},
]

const MAX_SCORE = 34 // 13+10+5+6

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

type Selections = Record<number, Record<RType, Set<string>>>

function initSelections(): Selections {
  const s: Selections = {}
  SECTIONS.forEach((_, i) => { s[i] = {} as Record<RType, Set<string>>; TYPES.forEach((t) => { s[i][t] = new Set() }) })
  return s
}

export function RIASECForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [sec, setSec] = useState(0)
  const [selections, setSelections] = useState<Selections>(() => {
    if (initialResponses?.selections) {
      const s: Selections = {}
      Object.entries(initialResponses.selections).forEach(([si, types]: [string, any]) => {
        s[Number(si)] = {} as Record<RType, Set<string>>
        Object.entries(types).forEach(([t, items]: [string, any]) => { s[Number(si)][t as RType] = new Set(items) })
      })
      return s
    }
    return initSelections()
  })
  const [saving, setSaving] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // Serialize for draft
  useEffect(() => {
    const serialized: Record<number, Record<RType, string[]>> = {}
    Object.entries(selections).forEach(([si, types]) => {
      serialized[Number(si)] = {} as Record<RType, string[]>
      Object.entries(types).forEach(([t, set]) => { serialized[Number(si)][t as RType] = [...(set as Set<string>)] })
    })
    onResponseChange?.({ selections: serialized })
  }, [selections]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback((type: RType, word: string) => {
    setSelections((prev) => {
      const next = { ...prev, [sec]: { ...prev[sec] } }
      const set = new Set(next[sec][type])
      if (set.has(word)) set.delete(word); else set.add(word)
      next[sec][type] = set
      return next
    })
  }, [sec])

  // Scores
  const scores: Record<RType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }
  Object.values(selections).forEach((types) => {
    TYPES.forEach((t) => { scores[t] += types[t].size })
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const r: any[] = []
      let n = 1
      SECTIONS.forEach((section, si) => {
        TYPES.forEach((t) => {
          const items = [...selections[si][t]]
          if (items.length > 0) r.push({ questionNumber: n++, question: `[${section.title}] ${TYPE_INFO[t].name}`, responseArray: items })
        })
      })
      const sorted = [...TYPES].sort((a, b) => scores[b] - scores[a])
      const code = sorted.slice(0, 3).join("")
      await onSave(0, r, { section: "riasec", scores, riasecCode: code })
      setShowResults(true)
      setTimeout(() => onComplete(), 3000)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  // Results screen
  if (showResults) {
    const sorted = [...TYPES].sort((a, b) => scores[b] - scores[a])
    const code = sorted.slice(0, 3).join("")
    return (
      <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center px-6 py-12">
        <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1918" }}>Tu perfil RIASEC</h2>
        <div className="flex gap-1 mb-8">
          {sorted.slice(0, 3).map((t) => (
            <span key={t} className="text-5xl font-black" style={{ color: TYPE_INFO[t].color }}>{t}</span>
          ))}
        </div>
        <div className="w-full max-w-md space-y-4">
          {sorted.map((t) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ background: TYPE_INFO[t].color }} />
              <span className="text-sm w-28" style={{ color: "rgba(255,255,255,0.85)" }}>{TYPE_INFO[t].name}</span>
              <div className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(scores[t] / MAX_SCORE) * 100}%`, background: TYPE_INFO[t].color }} />
              </div>
              <span className="text-xs font-semibold w-6 text-right">{scores[t]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const curSection = SECTIONS[sec]

  return (
    <div style={{ background: "#F9F8F6" }} className="flex flex-col h-full min-h-full md:flex-row">
      {/* LEFT: Content area */}
      <div className="flex-1 flex flex-col overflow-hidden md:flex-[62]">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 shrink-0 px-5 pt-4 pb-3 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium" style={{ color: "#B2ADA6" }}>Sección {sec + 1} de 4</span>
            {sec > 0 && (
              <button onClick={() => setSec((s) => s - 1)} className="text-xs font-semibold" style={{ color: "#9A9590" }}>← Anterior</button>
            )}
          </div>
          {/* Progress dots */}
          <div className="flex gap-2 mb-3">
            {SECTIONS.map((_, i) => (
              <div key={i} className="h-[3px] flex-1 rounded-[2px] transition-colors" style={{ background: i < sec ? "#B2ADA6" : i === sec ? "#1A1918" : "#EDE8E1" }} />
            ))}
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1918" }}>{curSection.title}</h2>
          <p className="text-sm mt-0.5" style={{ color: "#7A7570" }}>{curSection.subtitle}</p>
        </div>

        {/* Words body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 pb-40 md:pb-24 space-y-6">
          {TYPES.map((type) => {
            const items = curSection.items[type]
            const sel = selections[sec][type]
            const count = sel.size
            return (
              <div key={type} className="type-group">
                {/* Type header */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: TYPE_INFO[type].color }} />
                  <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: TYPE_INFO[type].color }}>
                    {TYPE_INFO[type].name}
                  </span>
                  {count > 0 && (
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: TYPE_INFO[type].color }}>
                      {count}
                    </span>
                  )}
                </div>
                {/* Chips */}
                <div className="flex flex-wrap gap-2">
                  {items.map((word) => {
                    const on = sel.has(word)
                    return (
                      <button key={word} onClick={() => toggle(type, word)}
                        className="px-3.5 py-[8px] rounded-full border text-[13px] font-medium transition-all active:scale-[0.95]"
                        style={{
                          background: on ? TYPE_INFO[type].color : "white",
                          color: on ? "white" : "#1A1918",
                          borderColor: on ? "transparent" : "#EDE8E1",
                        }}>
                        {word}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop footer */}
        <div className="hidden md:block shrink-0 px-5 py-4 border-t" style={{ borderColor: "#EDE8E1" }}>
          {sec < SECTIONS.length - 1 ? (
            <button onClick={() => setSec((s) => s + 1)}
              className="w-full py-3 rounded-[14px] text-[15px] font-bold text-white hover:opacity-[0.88]"
              style={{ background: "#1A1918" }}>Siguiente →</button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-[14px] text-[15px] font-bold text-white hover:opacity-[0.88]"
              style={{ background: "#1A1918" }}>{saving ? "Guardando..." : "Ver mi perfil →"}</button>
          )}
        </div>
      </div>

      {/* RIGHT: Analysis panel (dark sidebar — desktop) */}
      <div className="hidden md:flex flex-col shrink-0 p-6" style={{ background: "#1A1918", flex: "0 0 38%" }}>
        <span className="text-[10px] font-bold uppercase tracking-wider mb-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          Análisis en tiempo real
        </span>
        <div className="space-y-5">
          {TYPES.map((t) => (
            <div key={t}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: TYPE_INFO[t].color }} />
                  <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }}>{TYPE_INFO[t].name}</span>
                </div>
                <span className="text-[13px] font-medium" style={{ color: scores[t] > 0 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)" }}>
                  {scores[t]}
                </span>
              </div>
              <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(scores[t] / MAX_SCORE) * 100}%`, background: TYPE_INFO[t].color, transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE: Fixed bottom panel */}
      <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden" style={{ maxWidth: "100%" }}>
        {/* Scroll fade */}
        <div className="h-8 pointer-events-none" style={{ background: "linear-gradient(transparent, #F9F8F6)" }} />

        <div className="px-5 pt-3 pb-5" style={{ background: "#1A1918" }}>
          {/* Mini bars: 3x2 grid */}
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-3">
            {TYPES.map((t) => (
              <div key={t} className="flex flex-col gap-1">
                <span className="text-[10px] font-bold" style={{ color: TYPE_INFO[t].color }}>{t}</span>
                <div className="h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(scores[t] / MAX_SCORE) * 100}%`, background: TYPE_INFO[t].color }} />
                </div>
              </div>
            ))}
          </div>

          {sec < SECTIONS.length - 1 ? (
            <button onClick={() => setSec((s) => s + 1)}
              className="w-full py-3 rounded-[14px] text-[14px] font-bold" style={{ background: "white", color: "#1A1918" }}>
              Siguiente →
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-[14px] text-[14px] font-bold" style={{ background: "white", color: "#1A1918" }}>
              {saving ? "Guardando..." : "Ver mi perfil →"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
