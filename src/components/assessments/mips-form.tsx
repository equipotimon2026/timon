"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

/* V0 orientacion-vocacional.html Part 1 — 92 statements × 3 options + icebreakers */

const STATEMENTS = [
  "Soy una persona tranquila y colaboradora.","Siempre he hecho lo que he querido y he aceptado las consecuencias.","Me gusta ser la persona que asume el control de las cosas.","Tengo una manera habitual de hacer las cosas, con lo que evito equivocarme.","Preferiría ser un seguidor más que un líder.","Con frecuencia me siento tenso en situaciones sociales.","A veces siento que algunas figuras de autoridad abusan del poder que tienen.","Algunas veces he tenido que ser bastante brusco con la gente.","No me importaría tener pocos amigos.","Soy tímido e inhibido en situaciones sociales.","Aunque esté en desacuerdo, por lo general dejo que la gente haga lo que quiera.","Puedo hacer comentarios desagradables si considero que las personas se los merecen.","Me gusta cumplir con lo establecido y hacer lo que se espera de mí.","Siempre trato de hacer lo que es correcto.","Dependo poco de la amistad de los demás.","Cuando hay un límite claro, trato de respetarlo.","Me gusta organizar todas las cosas hasta en sus mínimos detalles.","A menudo los demás logran irritarme.","Me costaba desobedecer las indicaciones de mis padres.","Siempre logro conseguir lo que quiero aunque tenga que presionar a los demás.","Me importa mucho cuidar mi reputación personal.","Ya no expreso lo que realmente siento.","A veces siento que lo que tengo para decir no les interesa a los demás.","Soy una persona dura, nada sentimental.","Me pone nervioso conocer y conversar con gente nueva.","Soy una persona colaboradora que cede ante los demás.","A veces actúo según el momento y las circunstancias.","Primero planifico y luego sigo activamente el plan trazado.","Me parece importante controlar las emociones.","Tengo muy pocos lazos afectivos fuertes con otras personas.","Me siento intranquilo con personas que no conozco muy bien.","A veces siento que las reglas pueden interpretarse de forma flexible.","Con frecuencia siento que los demás no tienen una buena opinión de mí.","Sistemáticamente ordeno mis papeles y materiales de trabajo.","Las situaciones nuevas me ponen más tenso que a la mayoría.","Siempre trato de evitar las discusiones, por más que esté convencido de tener razón.","Busco situaciones novedosas y excitantes para mí.","Siempre termino mi trabajo antes de descansar.","Espero que las cosas sigan su curso antes de decidir qué hacer.","Procuro ocuparme más de los demás que de mí mismo.","El solo hecho de estar con otras personas me hace sentir inspirado.","Suelo respetar las reglas, incluso cuando nadie me está controlando.","Uso mi cabeza y no mi corazón para tomar decisiones.","A veces me guío más por mi intuición que por la información disponible.","En el colegio me gustaban más las materias prácticas que las teóricas.","Planifico las cosas con anticipación y actúo enérgicamente para que mis planes se cumplan.","A veces siento que mis emociones influyen más que mi razón.","Siempre puedo ver el lado positivo de la vida.","A menudo espero que alguien solucione mis problemas.","Hago lo que quiero, sin pensar cómo va a afectar a los otros.","Reacciono rápido ante situaciones que podrían convertirse en un problema.","Sólo me siento una buena persona cuando ayudo a los demás.","Si algo sale mal, aunque no sea importante, se me arruina todo el día.","Me siento satisfecho dejando que las cosas ocurran.","Trato de ser más lógico que emocional.","Prefiero lo concreto antes que lo puramente imaginario.","Me resulta difícil conversar con alguien que acabo de conocer.","Me interesan más las posibilidades futuras que los hechos del pasado.","Me resulta fácil disfrutar de las cosas.","Vivo según mis propias necesidades y no basado en las de los demás.","Nunca espero que las cosas pasen, hago que sucedan como yo quiero.","Suelo evitar responder bruscamente cuando estoy molesto.","La necesidad de ayudar a otros guía mi vida.","A menudo me siento muy tenso, a la espera de que algo salga mal.","Nunca intenté copiarme en un examen.","Soy una persona difícil de conocer bien.","Es fácil para mí controlar mis estados de ánimo.","Soy algo pasivo y lento en temas relacionados con la organización de mi vida.","Mis amigos y familiares recurren a mí para encontrar afecto y apoyo.","Aunque todo esté bien, a veces pienso que podría pasar algo malo.","Planifico y organizo con cuidado mi trabajo antes de empezar a hacerlo.","Soy impersonal y objetivo al tratar de resolver un problema.","Soy una persona realista a la que no le gustan las especulaciones.","Primero me preocupo por mí y después de los demás.","Dedico mucho esfuerzo para que las cosas me salgan bien.","Suelo mantener la compostura, incluso en momentos difíciles.","Demuestro mucho afecto hacia mis amigos.","Me gusta conocer gente nueva y saber cosas sobre sus vidas.","Puedo dejar de lado lo emocional para concentrarme en el trabajo.","Necesito mucho tiempo para poder estar a solas con mis pensamientos.","Me atraen más las personas soñadoras que las muy realistas.","Tiendo a evitar discutir, incluso cuando estoy muy enojado.","Expreso lo que pienso de manera franca y abierta.","Me desagrada sentir que voy a depender demasiado de alguien en mi trabajo.","Trato de asegurar que las cosas salgan como yo quiero.","Disfruto más de las realidades concretas que de las fantasías.","Aprendo bien observando y conversando con otras personas.","No me satisface dejar que las cosas sucedan y simplemente contemplarlas.","Confío más en mis intuiciones que en lo que observo.","Me gusta tomar mis propias decisiones, evitando los consejos de los otros.","Me gusta ser popular y participar en muchas actividades sociales.","Decido cuáles son las cosas prioritarias y luego actúo firmemente para poder lograrlas.",
]

const OPTS = ["Me siento identificado/a", "A veces", "No me identifica"]

const ICEBREAKERS = [
  { q: "¿Café o mate?", opts: ["Café ☕", "Mate 🧉", "Ninguno"], after: 20, ack: "Dato importante. Seguimos." },
  { q: "¿Prefiero las mañanas o las noches?", opts: ["Mañanas 🌅", "Noches 🌙", "Igual"], after: 45, ack: "Bien. Continuamos." },
  { q: "¿Perro o gato?", opts: ["Perro 🐶", "Gato 🐱", "Ninguno"], after: 65, ack: "Fundamental saberlo. Seguimos." },
  { q: "Pizza con piña: ¿exquisitez o crimen?", opts: ["Exquisitez total 🍕", "Crimen. Sin dudas."], after: 80, ack: "Posición clara. Seguimos." },
]

const ACK = ["Bien pensado.","Me gusta eso.","Interesante.","Tiene sentido.","Eso dice mucho.","Bueno saberlo.","Qué bueno."]
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

interface Props {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

type Msg = { type: "bot" | "user" | "typing" | "divider"; text: string }

export function MIPSForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialResponses?.answers ?? {})
  const [qIdx, setQIdx] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [inputMode, setInputMode] = useState<"statement" | "icebreaker" | "none" | "end">("none")
  const [icebreakerOpts, setIcebreakerOpts] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)
  const msgRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef(false)

  useEffect(() => { onResponseChange?.({ answers }) }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = useCallback(() => { setTimeout(() => { msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" }) }, 60) }, [])
  const addMsg = useCallback((m: Msg) => { setMsgs((p) => [...p, m]); setTimeout(scroll, 80) }, [scroll])

  const progress = (Object.keys(answers).length / STATEMENTS.length) * 100

  const showStatement = useCallback((idx: number) => {
    if (idx >= STATEMENTS.length) { if (!saving) handleSave(); return }
    // Check icebreaker
    const ib = ICEBREAKERS.find((i) => i.after === idx)
    if (ib) {
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMsgs((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: ib.q })
        setIcebreakerOpts(ib.opts)
        setInputMode("icebreaker")
      }, 800)
      return
    }

    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMsgs((p) => p.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: STATEMENTS[idx] })
      setQIdx(idx)
      setInputMode("statement")
    }, 600)
  }, [addMsg]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started) {
      setStarted(true)
      addMsg({ type: "bot", text: "Vamos a leer unas frases. Para cada una, elegí qué tan identificado/a te sentís." })
      addMsg({ type: "divider", text: "— Parte 1: Personalidad —" })
      setTimeout(() => showStatement(0), 1200)
    }
  }, [started]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (ans: string) => {
    setAnswers((a) => ({ ...a, [qIdx]: ans }))
    addMsg({ type: "user", text: ans })
    setInputMode("none")

    // Ack every 5
    const nextIdx = qIdx + 1
    if (nextIdx % 5 === 0 && nextIdx < STATEMENTS.length) {
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMsgs((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: rnd(ACK) })
        setTimeout(() => showStatement(nextIdx), 400)
      }, 500)
    } else {
      setTimeout(() => showStatement(nextIdx), 300)
    }
  }

  const handleIcebreaker = (ans: string) => {
    addMsg({ type: "user", text: ans })
    setInputMode("none")
    // Show custom icebreaker ack
    const ib = ICEBREAKERS.find((i) => i.after === qIdx)
    if (ib?.ack) {
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMsgs((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: ib.ack })
        setTimeout(() => showStatement(qIdx), 400)
      }, 500)
    } else {
      setTimeout(() => showStatement(qIdx), 400)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const r = STATEMENTS.map((s, i) => ({ questionNumber: i + 1, question: s, responseText: answers[i] ?? "" }))
      await onSave(0, r, { section: "mips" })
      setInputMode("end")
      addMsg({ type: "bot", text: "¡Terminamos la primera parte! Tus respuestas quedaron guardadas. 🎉" })
      setTimeout(() => onComplete(), 1500)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  return (
    <div style={{ background: "#F9F8F6" }} className="flex flex-col h-full min-h-full">
      <div className="shrink-0 flex gap-3 px-5 py-4 border-b" style={{ borderColor: "#E8E3DC" }}>
        <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-base shrink-0" style={{ background: "#2D2D2D", color: "white" }}>✦</div>
        <div className="flex-1">
          <h1 className="text-[15px] font-semibold" style={{ color: "#2D2D2D" }}>Chatiemos · Parte 1</h1>
          <p className="text-xs mt-0.5" style={{ color: "#9A9590" }}>{Object.keys(answers).length} / {STATEMENTS.length}</p>
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
        {inputMode === "statement" && (
          <div className="flex flex-wrap gap-2 w-full">
            {OPTS.map((o) => (
              <button key={o} onClick={() => handleAnswer(o)}
                className="px-5 py-2.5 rounded-full border-[1.5px] text-sm font-medium transition-all hover:bg-[#2D2D2D] hover:text-[#F9F8F6] hover:border-[#2D2D2D] active:scale-[0.96]"
                style={{ background: "#F9F8F6", borderColor: "#E8E3DC", color: "#2D2D2D" }}>
                {o}
              </button>
            ))}
          </div>
        )}
        {inputMode === "icebreaker" && (
          <div className="flex flex-wrap gap-2 w-full">
            {icebreakerOpts.map((o) => (
              <button key={o} onClick={() => handleIcebreaker(o)}
                className="px-5 py-2.5 rounded-full border-[1.5px] text-sm font-medium transition-all hover:bg-[#2D2D2D] hover:text-[#F9F8F6] hover:border-[#2D2D2D] active:scale-[0.96]"
                style={{ background: "#F9F8F6", borderColor: "#E8E3DC", color: "#2D2D2D" }}>
                {o}
              </button>
            ))}
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
