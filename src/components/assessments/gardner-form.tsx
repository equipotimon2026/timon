"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

/* V0 termometro.html — 1:1 replica */

const INTEL = [
  { name: "Lógico-Matemática", emoji: "🔬", questions: [
    "A la hora de tomar una decisión importante, ¿te basás principalmente en los datos concretos y en lo que tiene más lógica, dejando de lado la intuición o las emociones?",
    "Si tengo que dividir una cuenta entre amigos, puedo calcular números mentalmente con facilidad.",
    "Me gustan los juegos o retos donde tenés que pensar en estrategia: ajedrez, Catan, puzzles de lógica, acertijos, escape rooms.",
    "Cuando algo falla, naturalmente busco encontrar exactamente qué salió mal.",
    "Las matemáticas y/o ciencias estaban entre mis materias favoritas en la escuela.",
  ]},
  { name: "Lingüística", emoji: "📖", questions: [
    "Cuando escribo mensajes (chat, stories, mails) me importa cómo quedan redactados: elegiría otra palabra si la primera no suena bien.",
    "Suelo ser el que explica o traduce algo que los demás no entendieron, porque me resulta fácil encontrar las palabras justas.",
    "Disfruto leer o escuchar contenido que está bien escrito o narrado: un hilo de Twitter, un podcast, una novela, un ensayo.",
    "Me pasa que al hablar o escribir uso expresiones que la gente me pide que explique porque no son tan conocidas.",
    "Cuando tengo que convencer a alguien de algo, pienso en cómo voy a argumentarlo antes de hablar.",
  ]},
  { name: "Espacial", emoji: "🎨", questions: [
    "Me oriento bien en lugares nuevos, incluso en la primera visita, sin necesitar constantemente revisar el mapa.",
    "Cuando tengo que armar, decorar o reorganizar algo, pienso visualmente: me imagino el resultado antes de hacerlo.",
    "Disfruto el contenido visual: fotos, diseño, videos bien filmados, arte. Noto cuando algo está mal compuesto o mal editado.",
    "Prefiero entender algo con un esquema, diagrama o imagen que solo con texto.",
    "Cuando explico algo, naturalmente dibujo, gesticulo o señalo en el espacio para que la otra persona lo entienda.",
  ]},
  { name: "Corporal-Cinética", emoji: "🤸", questions: [
    "Me resulta difícil quedarme quieto mucho tiempo: necesito moverme, cambiar de posición, hacer algo con las manos.",
    "Aprendo mejor haciendo algo físicamente que leyendo o escuchando explicaciones: prefiero practicar antes que estudiar la teoría.",
    "Se me da bien usar las manos: armar cosas, tocar instrumentos, cocinar, dibujar, hacer trabajos manuales, deportes de contacto.",
    "Cuando estoy pensando algo importante, me ayuda caminar, hacer ejercicio o estar en movimiento.",
    "Me resulta natural seguir ritmos o coordinar movimientos: sea en un deporte, bailando o en cualquier actividad que requiera sincronización.",
  ]},
  { name: "Musical", emoji: "🎵", questions: [
    "Noto fácilmente cuando una canción está desafinada o tiene algo 'raro' en el ritmo o la melodía.",
    "La música ocupa un lugar importante en mi vida cotidiana: casi siempre escucho algo mientras hago otras cosas.",
    "Me aprendo las letras o melodías de canciones rápido, con pocas escuchas.",
    "Cuando escucho música, naturalmente sigo el ritmo con el cuerpo (golpeando, moviendo la cabeza, tarareando).",
    "Me imagino cómo sonaría algo si le cambiara la música de fondo, o me doy cuenta del impacto que tiene la música en una escena de serie o película.",
  ]},
  { name: "Naturalista", emoji: "🌿", questions: [
    "Me llama la atención observar la naturaleza: plantas, animales, paisajes, patrones climáticos.",
    "Soy bueno para notar diferencias entre cosas similares: razas de perros, tipos de hojas, características de distintos lugares.",
    "Me interesa entender cómo funcionan los ecosistemas, el clima o los procesos biológicos, más allá de lo que veo en la escuela.",
    "Cuando puedo elegir, prefiero estar al aire libre o en contacto con la naturaleza antes que en espacios cerrados.",
    "Cuando estoy en un lugar natural, noto detalles que otras personas no suelen mencionar.",
  ]},
  { name: "Intrapersonal", emoji: "🪞", questions: [
    "Cuando me pasa algo importante, necesito procesar en soledad antes de hablar con alguien sobre el tema.",
    "Tengo bastante claro qué cosas me importan de verdad, en qué soy bueno y en qué no.",
    "Suelo reflexionar sobre por qué actúo como actúo: analizo mis propias reacciones, emociones y decisiones.",
    "Tengo metas personales sobre las que pienso seguido: lo que quiero lograr, en qué quiero mejorar.",
    "Me resulta fácil estar solo sin aburrirme: disfruto del tiempo conmigo mismo.",
  ]},
  { name: "Interpersonal", emoji: "🫂", questions: [
    "Mis amigos suelen contarme sus problemas y pedirme opinión: se sienten cómodos hablando conmigo.",
    "Me doy cuenta rápido cuando alguien está incómodo o algo está mal, incluso si no lo dice directamente.",
    "Disfruto coordinar grupos, ya sea para estudiar, jugar, organizar algo o trabajar en proyectos.",
    "Se me hace relativamente fácil llevarme bien con personas muy distintas entre sí.",
    "Me resulta satisfactorio ayudar a alguien a entender algo o aprender algo nuevo: soy paciente explicando.",
  ]},
]

const BG_PHASES = ["#F9F8F6", "#F5F2F8", "#F2F6F3", "#F8F4F0"]

type FlowItem = { type: "question"; text: string; intelIdx: number; qIdx: number }
  | { type: "cleanser"; text: string; emoji: string }
  | { type: "checkpoint"; bgPhase: number }

function buildFlow(): FlowItem[] {
  const items: FlowItem[] = []
  const allQs: { text: string; intelIdx: number; qIdx: number }[] = []
  INTEL.forEach((intel, ii) => intel.questions.forEach((q, qi) => allQs.push({ text: q, intelIdx: ii, qIdx: qi })))
  for (let i = 0; i < allQs.length; i++) {
    items.push({ type: "question", ...allQs[i] })
    if (i === 9) items.push({ type: "cleanser", text: "La pizza con piña es un delito internacional.", emoji: "🍕" })
    if (i === 19) items.push({ type: "checkpoint", bgPhase: 1 })
    if (i === 29) items.push({ type: "cleanser", text: "Madrugar un domingo para hacer deporte tiene su encanto.", emoji: "⏰" })
  }
  return items
}

const FLOW = buildFlow()
const TOTAL_VOC = 40
const THUMB_W = 30

function getZone(val: number) {
  if (val < 1.8) return { text: "Nunca", color: "#62B8E8" }
  if (val < 2.6) return { text: "Casi nunca", color: "#80B8D8" }
  if (val < 3.4) return { text: "A veces", color: "#D4A830" }
  if (val < 4.2) return { text: "Casi siempre", color: "#E07030" }
  return { text: "Siempre", color: "#D03820" }
}

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

export function GardnerForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>(initialResponses?.answers ?? {})
  const [sliderVal, setSliderVal] = useState(3)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [bgPhase, setBgPhase] = useState(0)
  const [toast, setToast] = useState<{ text: string; visible: boolean }>({ text: "", visible: false })
  const lastAnswerTime = useRef(Date.now())
  const streak = useRef(0)
  const sliderRef = useRef<HTMLInputElement>(null)

  useEffect(() => { onResponseChange?.({ answers }) }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const item = FLOW[idx]
  const vocNum = FLOW.slice(0, idx + 1).filter((f) => f.type === "question").length
  const progress = (vocNum / TOTAL_VOC) * 100
  const zone = getZone(sliderVal)

  // Floating label position
  const pct = (sliderVal - 1) / 4
  const labelLeft = `calc(${pct * 100}% - ${THUMB_W / 2}px + ${THUMB_W / 2}px)`

  const showToast = useCallback((text: string) => {
    setToast({ text, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800)
  }, [])

  const advance = () => {
    const now = Date.now()
    const elapsed = now - lastAnswerTime.current

    if (item.type === "question") {
      const key = `${item.intelIdx}_${item.qIdx}`
      setAnswers((a) => ({ ...a, [key]: sliderVal }))

      // Speed detection
      if (elapsed < 700) {
        showToast("Tomáte un momento para pensar 🙏")
        streak.current = 0
      } else {
        streak.current++
        if (streak.current >= 5) {
          showToast("¡En racha! Seguí así 🔥")
          streak.current = 0
        }
      }
    }

    lastAnswerTime.current = now
    setSliderVal(3)

    // Check for bgPhase change
    if (item.type === "checkpoint" && "bgPhase" in item) {
      setBgPhase(item.bgPhase)
    }

    if (idx < FLOW.length - 1) setIdx(idx + 1)
    else handleSave()
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const r: any[] = []
      let n = 1
      INTEL.forEach((intel, ii) => {
        intel.questions.forEach((q, qi) => {
          r.push({ questionNumber: n++, question: q, responseInteger: Math.round((answers[`${ii}_${qi}`] ?? 3) * 100) / 100 })
        })
      })
      const scores: Record<string, number> = {}
      INTEL.forEach((intel, ii) => {
        let total = 0
        intel.questions.forEach((_, qi) => { total += answers[`${ii}_${qi}`] ?? 3 })
        scores[intel.name] = Math.round((total / intel.questions.length) * 100) / 100
      })
      await onSave(0, r, { section: "gardner", scores })
      setDone(true); setTimeout(() => onComplete(), 2500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  if (done) return (
    <div style={{ background: "#F9F8F6", minHeight: "100%" }} className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-screen">
      <span className="text-[48px] mb-7">✦</span>
      <h2 className="text-[26px] font-bold tracking-tight mb-2.5" style={{ color: "#1A1918" }}>Módulo completado</h2>
      <p className="text-[15px] mb-10 leading-relaxed" style={{ color: "#A09D98" }}>Registramos tus respuestas.<br />Ya casi tenemos tu perfil completo.</p>
      <button onClick={() => onComplete()} className="px-8 py-3.5 rounded-full text-[15px] font-bold text-white hover:opacity-[0.85] transition-opacity" style={{ background: "#1A1918" }}>
        Volver al inicio →
      </button>
    </div>
  )

  const renderSlider = () => (
    <div className="space-y-1 w-full relative">
      {/* Floating zone label */}
      <div className="relative h-7 mb-3 pointer-events-none">
        <span
          className="absolute text-[13px] font-bold transition-all duration-150 -translate-x-1/2"
          style={{ color: zone.color, left: labelLeft }}
        >
          {zone.text}
        </span>
      </div>
      <input
        ref={sliderRef}
        type="range" min={1} max={5} step={0.01} value={sliderVal}
        onChange={(e) => setSliderVal(Number(e.target.value))}
        className="termometro-slider w-full h-2.5 rounded-full appearance-none cursor-pointer"
        style={{ background: "linear-gradient(to right, #7BC8F0, #A8D8E8, #F5D060, #F08848, #E04838)" }}
      />
      <div className="flex justify-between text-[11px] mt-1" style={{ color: "#B2ADA6" }}>
        <span>Nunca</span><span>Siempre</span>
      </div>
    </div>
  )

  return (
    <div style={{ background: BG_PHASES[bgPhase], minHeight: "100%", transition: "background 0.5s ease" }} className="flex flex-col">
      {/* Fixed progress bar */}
      <div className="sticky top-0 z-10 h-0.5" style={{ background: "#E8E6E1" }}>
        <div className="h-full transition-all duration-[400ms]" style={{ width: `${progress}%`, background: "#1A1918", transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)" }} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-7 py-16 max-w-[860px] mx-auto w-full">
        {item.type === "checkpoint" ? (
          <div className="text-center">
            <span className="text-[44px] block mb-1">😅</span>
            <h2 className="text-[22px] font-bold mb-2 whitespace-pre-line" style={{ color: "#1A1918" }}>{"20 preguntas.\nA la mitad — muy bien."}</h2>
            <p className="text-sm mb-3" style={{ color: "#7A7570" }}>Tomáte un segundo. Estás yendo muy bien.</p>
            <button onClick={advance} className="mt-3 px-8 py-3.5 rounded-full text-[15px] font-bold text-white" style={{ background: "#1A1918" }}>
              Dale, sigo
            </button>
          </div>
        ) : item.type === "cleanser" ? (
          <div className="text-center w-full max-w-lg">
            <span className="inline-flex items-center gap-[7px] px-3.5 py-1.5 rounded-full text-[13px] font-semibold mb-8" style={{ background: "#FFF0E6", color: "#C04818" }}>
              {item.emoji} Pausa mental
            </span>
            <p className="text-[22px] font-semibold mb-10 leading-snug lg:text-[26px] xl:text-[30px]" style={{ color: "#1A1918" }}>{item.text}</p>
            {renderSlider()}
            <button onClick={advance} className="mt-10 px-8 py-3.5 rounded-full text-[15px] font-bold text-white hover:opacity-[0.88] transition-opacity" style={{ background: "#1A1918" }}>
              Siguiente →
            </button>
          </div>
        ) : (
          <div className="text-center w-full max-w-lg">
            {/* Badge + Counter row */}
            <div className="flex items-center justify-between mb-8">
              <span className="inline-flex items-center gap-[7px] px-3.5 py-1.5 rounded-full text-[13px] font-semibold" style={{ background: "#EEECEA", color: "#3A3835" }}>
                {INTEL[item.intelIdx].emoji} {INTEL[item.intelIdx].name}
              </span>
              <span className="text-xs font-medium" style={{ color: "#A09D98" }}>{vocNum} / {TOTAL_VOC}</span>
            </div>

            {/* Question */}
            <p className="text-[22px] font-semibold mb-10 leading-[1.35] lg:text-[26px] xl:text-[30px]" style={{ color: "#1A1918", letterSpacing: "-0.3px" }}>{item.text}</p>

            {renderSlider()}

            <button onClick={advance} className="mt-10 px-8 py-3.5 rounded-full text-[15px] font-bold text-white hover:opacity-[0.88] transition-opacity" style={{ background: "#1A1918" }}>
              {idx === FLOW.length - 1 ? "Finalizar →" : "Siguiente →"}
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-250 pointer-events-none z-30",
          toast.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
        )}
        style={{ background: toast.text.includes("🙏") ? "#C84818" : "#1A1918" }}
      >
        {toast.text}
      </div>

      {/* Custom slider thumb CSS */}
      <style jsx>{`
        .termometro-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.22);
          cursor: grab;
          transition: transform 0.12s;
        }
        .termometro-slider:active::-webkit-slider-thumb {
          transform: scale(1.18);
          cursor: grabbing;
        }
        .termometro-slider::-moz-range-thumb {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 12px rgba(0,0,0,0.22);
          border: none;
          cursor: grab;
        }
      `}</style>
    </div>
  )
}
