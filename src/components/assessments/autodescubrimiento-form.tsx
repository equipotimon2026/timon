"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/* V0 autobiografia.html — guided writing with hints panels */

type Section = { id: string; title: string; questions: { id: string; label: string; hints: string[]; tall?: boolean }[] }

const SECTIONS: Section[] = [
  { id: "yo_soy", title: "Yo Soy", questions: [
    { id: "descripcion", label: "Contá cómo sos como persona. Podés arrancar con \"Yo soy…\" y usar adjetivos o frases cortas.", tall: true, hints: [
      "¿Cuáles son los tres adjetivos con los que más te identificás?",
      "¿Cómo te describirían las personas que te conocen bien?",
      "¿Qué cualidades tuyas aparecen de forma natural, sin esfuerzo?",
      "¿Cómo actuás bajo presión o cuando las cosas se complican?",
      "¿Hay aspectos de tu personalidad que estás trabajando para mejorar?",
      "¿Qué te diferencia de los demás?",
    ]},
  ]},
  { id: "conceptos", title: "Conceptos", questions: [
    { id: "felicidad", label: "Felicidad: ¿Qué cosas te hacen feliz en el día a día, por más pequeñas que sean?", hints: ["¿Qué tipo de personas o situaciones te generan bienestar genuino?","¿Cuándo fue la última vez que te sentiste profundamente contento/a?","¿Hay cosas simples que otros no notan pero a vos te alegran el día?"] },
    { id: "infelicidad", label: "Infelicidad: ¿Qué cosas te hacen infeliz y quisieras evitar o minimizar?", hints: ["¿Qué situaciones o ambientes te drenan la energía?","¿Hay cosas que tenés que hacer y te generan malestar genuino?","¿Qué tipo de relaciones o dinámicas te afectan negativamente?","¿Qué es lo que más te frustra o te genera ansiedad?"] },
    { id: "exito", label: "Éxito: ¿Cómo definirías con tus palabras el \"éxito profesional\"?", hints: ["¿El éxito para vos es individual o también implica impactar a otros?","¿Incluye el dinero, el reconocimiento, la libertad, la trascendencia, o algo más?","¿Hay algún modelo de éxito que rechazás? ¿Por qué?"] },
    { id: "certeza", label: "Si supieras que las próximas cinco cosas que hagas te saldrán como querés, ¿cuáles serían?", hints: ["¿Estas cinco cosas reflejan lo que realmente querés o lo que creés que deberías querer?","¿Hay alguna que venís postergando por miedo al fracaso?","¿Qué te dice esta lista sobre tus prioridades reales?"] },
  ]},
  { id: "historia", title: "Autobiografía", questions: [
    { id: "origenes", label: "Orígenes — Mi familia, mi casa, mi barrio. ¿Qué cosas de ahí me marcaron?", hints: ["¿Qué valores heredaste de tu familia?","¿Hay alguna persona que te marcó positiva o negativamente?","¿Cómo influye el lugar donde creciste en quien sos hoy?"] },
    { id: "pasado", label: "Pasado — Mi infancia, mis juegos, mis amigos y mi escuela.", hints: ["¿A qué jugabas de chico/a?","¿Quién eras antes de preocuparte por lo que pensaban los demás?","¿Qué aprendiste en esa etapa que todavía usás hoy?"] },
    { id: "perfil", label: "Perfil — Mis intereses y habilidades. Lo que se me da bien.", hints: ["¿En qué actividades perdés la noción del tiempo?","¿Qué habilidades venís desarrollando sin darte cuenta?","¿Cuáles son tus ambiciones más genuinas?"] },
    { id: "presente", label: "Presente — ¿Cómo es mi vida hoy?", hints: ["¿Qué aspectos de tu vida actual te satisfacen más?","¿Qué te genera más incertidumbre o preocupación hoy?","¿Sentís que tu vida de hoy refleja quién realmente sos?"] },
    { id: "futuro", label: "Futuro — Mis sueños y proyectos.", hints: ["¿Qué proyecto o sueño querés comenzar cuanto antes?","¿Qué cosas querés que estén — y cuáles que NO estén — en tu vida futura?","¿Qué legado te gustaría dejar?"] },
  ]},
  { id: "hvt", title: "Historia Vital", questions: [
    { id: "recuerdo1", label: "Recuerdo de Satisfacción #1 — Un hecho que te haya producido mucha satisfacción, donde hayas tenido un papel activo.", tall: true, hints: ["¿Cuántos años tenías? ¿Qué contexto rodeaba ese momento?","¿Cuál fue tu papel específico?","¿Qué habilidades tuyas contribuyeron al resultado?","¿Por qué ese momento todavía te genera satisfacción?"] },
    { id: "recuerdo2", label: "Recuerdo de Satisfacción #2 — Otro hecho inolvidable donde hayas tenido protagonismo.", tall: true, hints: ["¿Es un recuerdo de una etapa diferente al primero?","¿Qué competencias o talentos se pusieron en juego?","¿Qué dice ese recuerdo sobre el tipo de tareas donde más florecés?"] },
    { id: "reflexion", label: "Reflexión — ¿Qué patrones o talentos encontrás en común entre estos dos recuerdos?", hints: ["¿Qué tienen en común ambos momentos?","¿Aparecen las mismas habilidades o valores en los dos?","¿Qué te dicen sobre qué trabajo podría darte satisfacción genuina?"] },
  ]},
]

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function AutodescubrimientoForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [sec, setSec] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(initialResponses?.answers ?? {})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [expandedHints, setExpandedHints] = useState<Record<string, boolean>>({})

  useEffect(() => { onResponseChange?.({ answers }) }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const allQs = SECTIONS.flatMap((s) => s.questions)
  const filled = allQs.filter((q) => (answers[q.id] ?? "").trim().length > 0).length
  const progress = (filled / allQs.length) * 100
  const curSection = SECTIONS[sec]

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = allQs.map((q, i) => ({ questionNumber: i + 1, question: q.label, responseText: answers[q.id] ?? "" }))
      await onSave(0, r, { section: "autodescubrimiento" })
      setDone(true); setTimeout(() => onComplete(), 1500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="text-3xl mb-4">✦</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2" style={{ color: "#1A1918" }}>Módulo completado</h2>
      <p className="text-[15px]" style={{ color: "#7A7570" }}>Tu autobiografía quedó guardada.</p>
    </div>
  )

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Autobiografía</span>
          <span className="text-xs font-medium" style={{ color: "#B2ADA6" }}>{sec + 1} / {SECTIONS.length}</span>
        </div>
        <div className="h-0.5" style={{ background: "#EDE8E1" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: "#1A1918" }} />
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 pb-2">
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => setSec(i)}
            className={cn("px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors",
              sec === i ? "bg-[#1A1918] text-white border-[#1A1918]" : "bg-white border-[#EDE8E1] text-[#7A7570]")}>
            {s.title}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pt-4 pb-24 max-w-[1000px] mx-auto w-full lg:px-12 space-y-5">
        <h2 className="text-lg font-bold" style={{ color: "#1A1918" }}>{curSection.title}</h2>

        {curSection.questions.map((q) => (
          <div key={q.id} className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A1918", lineHeight: "1.35" }}>{q.label}</label>

            {/* Hints panel */}
            <button onClick={() => setExpandedHints((h) => ({ ...h, [q.id]: !h[q.id] }))}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-3 cursor-pointer"
              style={{ color: "#B2ADA6" }}>
              {expandedHints[q.id] ? "▼" : "▶"} Para desarrollar mejor tu respuesta
            </button>
            {expandedHints[q.id] && (
              <div className="rounded-[10px] px-4 py-3 mb-3 text-xs leading-relaxed space-y-1" style={{ background: "#F5F2EC", color: "#7A7570" }}>
                {q.hints.map((h, i) => <p key={i}>→ {h}</p>)}
              </div>
            )}

            <textarea value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
              rows={q.tall ? 6 : 4} placeholder="Escribí tu respuesta..."
              className="w-full px-3.5 py-3 rounded-xl border text-sm resize-y outline-none transition-colors"
              style={{ background: "#F9F8F6", borderColor: "#EDE8E1", color: "#1A1918", lineHeight: "1.6", minHeight: q.tall ? "180px" : "96px", fontFamily: "inherit" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#1A1918" }} onBlur={(e) => { e.currentTarget.style.borderColor = "#EDE8E1" }} />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 flex items-center justify-between lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button onClick={() => setSec((s) => s - 1)} disabled={sec === 0}
          className="px-5 py-3 rounded-[14px] border text-sm font-semibold transition-opacity disabled:opacity-0"
          style={{ borderColor: "#EDE8E1", color: "#7A7570" }}>← Anterior</button>
        {sec < SECTIONS.length - 1 ? (
          <button onClick={() => setSec((s) => s + 1)} className="px-8 py-3.5 rounded-[14px] text-[15px] font-bold text-white hover:opacity-[0.88]" style={{ background: "#1A1918" }}>
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving || filled < 5}
            className={cn("px-8 py-3.5 rounded-[14px] text-[15px] font-bold text-white", filled >= 5 ? "hover:opacity-[0.88]" : "opacity-35 pointer-events-none")}
            style={{ background: "#1A1918" }}>
            {saving ? "Guardando..." : "Finalizar →"}
          </button>
        )}
      </div>
    </div>
  )
}
