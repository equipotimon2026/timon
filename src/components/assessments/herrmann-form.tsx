"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

type StepDef = { title: string; hint?: string; mode: "multi" | "single" | "exact"; min?: number; max?: number; options: string[] }

const STEPS: StepDef[] = [
  { title: "¿Qué te energiza más al estudiar o trabajar?", hint: "Elegí hasta 3", mode: "multi", min: 1, max: 3, options: ["Trabajar solo","Oportunidades para probar cosas nuevas","Expresar mis ideas","Planificar","Tener el control de la situación","Trabajar comunicándome con otros","Provocar cambios","Hacer que algo funcione","Explicar y conversar","Arriesgarse","Crear o usar recursos visuales","Analizar datos","Prestarle atención a los detalles","Pensar escenarios futuros","Aspectos técnicos","Producir y organizar","Trabajar con personas","Ser parte de un equipo","Usar números, estadísticas","Realizar las tareas siempre en el plazo previsto"] },
  { title: "Cuando aprendés, ¿qué te gusta más?", hint: "Elegí hasta 3", mode: "multi", min: 1, max: 3, options: ["Evaluar y testar teorías","Recibir informaciones paso a paso","Trabajar con hechos y datos","Tomar iniciativas","Oír y compartir ideas","Elaborar teorías","Usar mi imaginación","Involucrarme emocionalmente","Aplicar análisis y lógica","Trabajar en grupo","Un ambiente bien informal","Orientaciones claras","Verificar mi comprensión","Descubrir cosas nuevas","Hacer experiencias prácticas","Criticar","Pensar sobre las ideas","Ver rápido el panorama general","Confiar en las intuiciones","Adquirir habilidades por la práctica"] },
  { title: "¿Cómo preferís aprender?", hint: "Elegí hasta 3", mode: "multi", min: 1, max: 3, options: ["Demostraciones","Utilizando historias y música","Debates guiados","Discusiones de casos orientados hacia los números y hechos","Actividades paso a paso","Ejercicios que usan la intuición","Clases formales","Métodos tradicionales comprobados","Lectura de libros-textos","Ejercicios de análisis","Experiencias","Agenda flexible","Discusiones de casos orientados hacia las personas","Actividades paso a paso con orden claro","Trabajos con estructura clara"] },
  { title: "¿Cuál es la pregunta que más te gusta hacer?", mode: "single", options: ["¿Qué?","¿Cómo?","¿Por qué?","¿Quién?"] },
  { title: "¿Qué te gusta más hacer?", hint: "Elegí exactamente 2", mode: "exact", min: 2, max: 2, options: ["Descubrir","Teorizar","Cuantificar","Resumir","Agrupar","Evaluar","Organizar","Reflexionar","Conceptuar","Procesar","Analizar","Ordenar","Sentir","Explorar","Practicar","Compartir"] },
  { title: "¿Cómo definís tu comportamiento?", mode: "single", options: ["Me gusta Organizar","Me gusta Compartir","Me gusta Analizar","Me gusta Descubrir"] },
  { title: "Cuando tengo que resolver un problema, generalmente yo...", mode: "single", options: ["Miro el panorama completo y confío en lo que me dice mi instinto para encontrar la solución.","Organizo los \"hechos\" tratándolos de forma realista y cronológica.","Siento los \"hechos\" y pienso en cómo nos afecta a todos, tratando de resolverlo compartiendo lo que sentimos.","Analizo los \"hechos\" tratándolos de forma lógica y racional."] },
  { title: "Cuando tengo que resolver un problema, busco...", mode: "single", options: ["Una visión interpersonal, emocional, \"humana\".","Una visión organizada, detallada, \"cronológica\".","Una visión analítica, lógica, racional, \"de resultados\".","Una visión intuitiva, conceptual, visual, de \"contexto general\"."] },
]

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function HerrmannForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [step, setStep] = useState(0)
  const [responses, setResponses] = useState<Record<number, string[]>>(initialResponses ?? {})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => { onResponseChange?.(responses) }, [responses]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = STEPS[step]
  const sel = responses[step] ?? []
  const progress = ((step + 1) / STEPS.length) * 100
  const atMax = cur.max ? sel.length >= cur.max : false

  const isReady = () => {
    if (cur.mode === "single") return sel.length === 1
    if (cur.mode === "exact") return sel.length === (cur.min ?? 1)
    return sel.length >= (cur.min ?? 1)
  }

  const toggle = (opt: string) => {
    if (cur.mode === "single") { setResponses((r) => ({ ...r, [step]: [opt] })); return }
    if (sel.includes(opt)) setResponses((r) => ({ ...r, [step]: sel.filter((x) => x !== opt) }))
    else if (!atMax) setResponses((r) => ({ ...r, [step]: [...sel, opt] }))
  }

  const next = () => { if (step < STEPS.length - 1) setStep(step + 1); else handleSave() }

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = STEPS.map((s, i) => ({
        questionNumber: i + 1, question: s.title,
        ...(s.mode === "single" ? { responseText: (responses[i] ?? [])[0] ?? "" } : { responseArray: responses[i] ?? [] }),
      }))
      await onSave(0, r, { section: "dominancia" })
      setDone(true); setTimeout(() => onComplete(), 2000)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16">
      <span className="text-3xl mb-4">✦</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2" style={{ color: "#1A1918" }}>Módulo completado</h2>
      <p className="text-[15px]" style={{ color: "#7A7570" }}>Registramos tus respuestas.</p>
    </div>
  )

  return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col">
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F9F8F6", borderColor: "#EDE8E1" }}>
        <div className="flex items-center justify-between px-5 py-3.5">
          <span className="text-[15px] font-bold" style={{ color: "#1A1918" }}>Dominancia</span>
          <span className="text-xs font-medium" style={{ color: "#B2ADA6" }}>{step + 1} / {STEPS.length}</span>
        </div>
        <div className="h-0.5" style={{ background: "#EDE8E1" }}>
          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: "#1A1918", transitionTimingFunction: "cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>

      <div className="flex-1 px-4 pt-8 pb-24 max-w-[1100px] mx-auto w-full lg:px-12">
        <div className="bg-white rounded-[18px] p-6 lg:p-10" style={{ boxShadow: "0 1px 4px rgba(0,0,0,.05), 0 0 0 1px rgba(0,0,0,.04)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#B2ADA6" }}>Sección {step + 1} de {STEPS.length}</div>
          <h2 className="text-lg font-bold leading-snug mb-1" style={{ color: "#1A1918" }}>{cur.title}</h2>
          {cur.hint && <p className="text-xs mb-5" style={{ color: "#7A7570" }}>{cur.hint}</p>}
          {!cur.hint && <div className="mb-5" />}

          <div className="flex flex-wrap gap-[9px]">
            {cur.options.map((opt) => {
              const on = sel.includes(opt)
              const dis = !on && atMax && cur.mode !== "single"
              return (
                <button key={opt} onClick={() => !dis && toggle(opt)}
                  className={cn("px-4 py-[9px] rounded-full border text-[13px] font-medium transition-all",
                    dis && "opacity-[0.38] cursor-default", !dis && "active:scale-[0.95] cursor-pointer")}
                  style={{ background: on ? "#1A1918" : "white", color: on ? "white" : "#1A1918", borderColor: on ? "#1A1918" : "#EDE8E1" }}>
                  {opt}
                </button>
              )
            })}
          </div>

          {cur.mode !== "single" && (
            <div className="mt-4 text-xs" style={{ color: "#B2ADA6" }}>
              {sel.length} seleccionado{sel.length !== 1 ? "s" : ""}{cur.max && ` de ${cur.max} máximo`}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-10 px-4 pb-7 pt-3 flex items-center justify-between lg:px-12" style={{ background: "linear-gradient(transparent, #F9F8F6 40%)" }}>
        <button onClick={() => setStep((s) => s - 1)} disabled={step === 0}
          className="px-5 py-3 rounded-[14px] border text-sm font-semibold transition-opacity disabled:opacity-0"
          style={{ borderColor: "#EDE8E1", color: "#7A7570" }}>← Anterior</button>
        <button onClick={next} disabled={!isReady() || saving}
          className={cn("px-8 py-3.5 rounded-[14px] text-[15px] font-bold text-white transition-all",
            isReady() ? "opacity-100 hover:opacity-[0.84] active:opacity-[0.76]" : "opacity-35 pointer-events-none")}
          style={{ background: "#1A1918" }}>
          {saving ? "Guardando..." : step === STEPS.length - 1 ? "Finalizar →" : "Continuar →"}
        </button>
      </div>
    </div>
  )
}
