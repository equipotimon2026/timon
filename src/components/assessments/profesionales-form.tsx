"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

/* ══════════════════════════════════════
   DATA — 1:1 from V0 profesionales.html
══════════════════════════════════════ */
type FlowItem = { t: "bot"; text: string; delay: number }
  | { t: "chips"; text: string; delay: number; items: string[] }
  | { t: "options"; text: string; delay: number; options: string[] }
  | { t: "text"; text: string; delay: number; placeholder: string }
  | { t: "end" }

type Professional = {
  id: string; name: string; role: string; color: string; emoji: string; area: string
  flow: FlowItem[]
}

const PROS: Professional[] = [
  { id: "negocios", name: "Lucía Ferreyra", role: "Emprendedora · Consultora de negocios", color: "#C87828", emoji: "💼", area: "Administración y Negocios", flow: [
    { t: "bot", text: "¡Hola! Soy Lucía 👋", delay: 800 },
    { t: "bot", text: "Empecé mi primer negocio a los 24 y hoy trabajo ayudando a empresas a crecer y detectar nuevas oportunidades. El mundo de los negocios mezcla números, estrategia y personas — está en todo lado, desde una startup de tecnología hasta una empresa familiar.", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte algunas actividades de mi área. Marcá las que reconocés como talentos tuyos — cosas que se te dan bien o que genuinamente disfrutás.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Trabajar con números","Liderar","Supervisar","Tareas de oficina"] },
    { t: "chips", text: "¿Y de estas?", delay: 800, items: ["Iniciar proyecto propio","Asumir riesgos","Detectar oportunidades","Convencer a otros"] },
    { t: "chips", text: "Último grupo...", delay: 700, items: ["Manejar contabilidad","Llevar cuentas","Planificar ganancias","Diseñar inversiones"] },
    { t: "options", text: "¿Alguna vez te imaginaste teniendo tu propio negocio o proyecto?", delay: 1200, options: ["Sí, es algo que me llama mucho","Lo pensé pero no sé por dónde empezar","No es lo que me imagino haciendo"] },
    { t: "text", text: "¿Hay algún aspecto del mundo de los negocios que siempre te generó curiosidad?", placeholder: "Lo que se te venga a la mente...", delay: 1300 },
    { t: "bot", text: "Perfecto. Con esto tengo una imagen clara de tu relación con este mundo. ¡Fue un placer! 🙌", delay: 1000 },
    { t: "end" },
  ]},
  { id: "sociales", name: "Mateo Vargas", role: "Sociólogo · Especialista en RRHH", color: "#248850", emoji: "🤝", area: "Sociales y RRHH", flow: [
    { t: "bot", text: "¡Hola! Soy Mateo 👋", delay: 800 },
    { t: "bot", text: "Soy sociólogo y llevo diez años trabajando en Recursos Humanos. Mi trabajo es entender qué necesita la gente — tanto dentro de las organizaciones como en la comunidad.", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte actividades del área social y de RRHH. Marcá las que reconocés en vos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Ayudar a otros","Aconsejar","Contención emocional","Trabajo en equipo"] },
    { t: "chips", text: "Seguimos...", delay: 800, items: ["Percibir necesidades","Tareas solidarias","Actividades con niños/ancianos","Incentivar relaciones"] },
    { t: "chips", text: "Y estas últimas...", delay: 700, items: ["Leer sobre problemas sociales","Interés en conducta humana"] },
    { t: "options", text: "¿Qué es lo que más te moviliza cuando se trata de trabajar con personas?", delay: 1200, options: ["Ayudar a resolver problemas concretos","Generar conexión y vínculo genuino","Entender por qué la gente hace lo que hace"] },
    { t: "text", text: "¿Hay algún grupo social, problemática o comunidad que te quite el sueño?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Gracias por la sinceridad. Se nota lo que te importa — eso es lo más valioso en este campo. ¡Hasta pronto! 🙌", delay: 1100 },
    { t: "end" },
  ]},
  { id: "humanidades", name: "Valentina Ros", role: "Psicóloga · Educadora", color: "#7B3FA0", emoji: "📚", area: "Humanidades y Educación", flow: [
    { t: "bot", text: "¡Hola! Soy Valentina 👋", delay: 800 },
    { t: "bot", text: "Soy psicóloga y trabajo en educación. Acompaño a personas de todas las edades a entenderse mejor y desarrollar su potencial.", delay: 1600 },
    { t: "bot", text: "Voy a mostrarte actividades del área de humanidades, educación y psicología. Marcá las que reconocés como talentos tuyos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Enseñar/Entrenar","Hablar en público","Facilitar comunicación","Planear recreación"] },
    { t: "chips", text: "¿Y de estas?", delay: 800, items: ["Idiomas","Escribir","Leer","Talleres literarios/culturales"] },
    { t: "chips", text: "Y las últimas...", delay: 700, items: ["Interés educativo","Reflexión filosófica","Retiros espirituales"] },
    { t: "options", text: "¿Qué rol te imaginás más naturalmente en el futuro?", delay: 1200, options: ["Guiar o enseñar a otros","Explorar ideas y generar contenido","Acompañar procesos internos de las personas"] },
    { t: "text", text: "¿Hay algún campo de las humanidades o la psicología que siempre te generó curiosidad?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Me alegra que hayas llegado hasta acá. Se nota que tenés un mundo interior rico. ¡Hasta pronto! 🙌", delay: 1100 },
    { t: "end" },
  ]},
  { id: "salud", name: "Diego Moreira", role: "Médico clínico", color: "#2E78C8", emoji: "🩺", area: "Salud", flow: [
    { t: "bot", text: "¡Hola! Soy Diego 👋", delay: 800 },
    { t: "bot", text: "Soy médico clínico con más de diez años de experiencia. El mundo de la salud es enorme: medicina, enfermería, nutrición, investigación...", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte actividades del área de la salud. Marcá las que reconocés en vos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Anatomía/Fisiología","Investigación en salud","Leer sobre medicina","Nutrición"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Ayudar enfermos","Voluntariado hospitalario","Prevención"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Emergencias","Primeros auxilios"] },
    { t: "options", text: "¿Qué aspecto del mundo de la salud te genera más vocación?", delay: 1200, options: ["El contacto directo con pacientes","La investigación y el conocimiento científico","La prevención y la salud pública"] },
    { t: "text", text: "¿Hay algo del mundo de la salud que siempre te llamó la atención?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Muy bien. Con esto tengo una imagen de tu relación con este mundo. ¡Gracias por la charla! 🙌", delay: 1000 },
    { t: "end" },
  ]},
  { id: "juridicas", name: "Camila Bravo", role: "Abogada · Asesora en política pública", color: "#C02828", emoji: "⚖️", area: "Jurídicas y Política", flow: [
    { t: "bot", text: "¡Hola! Soy Camila 👋", delay: 800 },
    { t: "bot", text: "Soy abogada especialista en derecho internacional y también trabajé en política pública. Este campo es para quienes quieren que el mundo sea más justo.", delay: 1800 },
    { t: "bot", text: "Voy a mostrarte actividades del área jurídica y política. Marcá las que reconocés como talentos tuyos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Defender causas justas","Defender derechos","Juzgar con objetividad","Conciliar disputas"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Política","Relaciones internacionales","Seguridad de los demás","Defensa del territorio"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Noticias delictivas","Prevención del delito"] },
    { t: "options", text: "¿Desde qué lugar te imaginás haciendo una diferencia?", delay: 1200, options: ["Desde la ley y los derechos","Desde la política y las instituciones","Desde la seguridad y la protección"] },
    { t: "text", text: "¿Hay alguna causa, injusticia o problemática que especialmente te movilice?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Muy interesante. Se nota que tenés convicciones. ¡Hasta la próxima! 🙌", delay: 1000 },
    { t: "end" },
  ]},
  { id: "ecologia", name: "Tomás Alvarado", role: "Biólogo · Conservacionista", color: "#3D7A52", emoji: "🌿", area: "Ecología y Naturaleza", flow: [
    { t: "bot", text: "¡Hola! Soy Tomás 👋", delay: 800 },
    { t: "bot", text: "Soy biólogo y trabajo en conservación de ecosistemas. Pasé años en campo — desde la Patagonia hasta el Amazonas.", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte actividades del área de ecología y naturaleza. Marcá las que reconocés en vos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Medio ambiente","Biología/Ecología","Vida marina","Preservación de especies"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Alimentación humana","Actividad agrícola/ganadera","Crianza de animales","Reservas animales"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Cocina","Genética","Geografía"] },
    { t: "options", text: "¿Qué es lo que más te conecta con el mundo natural?", delay: 1200, options: ["La complejidad de los ecosistemas","Los animales y su comportamiento","El impacto humano y cómo reducirlo"] },
    { t: "text", text: "¿Hay algún ecosistema, especie o problema ambiental que te apasione especialmente?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Genial. Se nota que el mundo natural te habla. ¡Hasta pronto! 🙌", delay: 1100 },
    { t: "end" },
  ]},
  { id: "exactas", name: "Sofía Méndez", role: "Ingeniera en Sistemas", color: "#5040B0", emoji: "⚙️", area: "Exactas e Ingeniería", flow: [
    { t: "bot", text: "¡Hola! Soy Sofía 👋", delay: 800 },
    { t: "bot", text: "Soy ingeniera en sistemas y llevo años trabajando en desarrollo de software. Me encanta la lógica, los problemas complejos y encontrar soluciones elegantes.", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte actividades del área de exactas e ingeniería. Marcá las que reconocés como talentos tuyos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Relacionar teorías","Lógica","Cálculos complejos","Fórmulas matemáticas/químicas"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Informática","Programar software","Organizar objetos/datos","Leer revistas científicas"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Manipular herramientas","Experimentos","Reparaciones"] },
    { t: "options", text: "¿Cómo sos cuando te encontrás con un problema difícil?", delay: 1200, options: ["Me meto de lleno hasta resolverlo","Lo analizo primero, después actúo","Prefiero colaborar con alguien más"] },
    { t: "text", text: "¿Hay algún problema técnico, científico o tecnológico que te parezca especialmente fascinante?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Muy bien. La forma en que procesás los problemas dice mucho. ¡Gracias por la charla! 🙌", delay: 1000 },
    { t: "end" },
  ]},
  { id: "comunicacion", name: "Nicolás Paredes", role: "Periodista · Comunicador", color: "#D4680A", emoji: "📡", area: "Comunicación y Medios", flow: [
    { t: "bot", text: "¡Hola! Soy Nico 👋", delay: 800 },
    { t: "bot", text: "Soy periodista con más de quince años de carrera. Lo que me apasiona de este campo es que siempre estás conectado con lo que pasa en el mundo.", delay: 1800 },
    { t: "bot", text: "Voy a mostrarte actividades del área de comunicación y medios. Marcá las que reconocés en vos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Relatar","Periodismo","Entrevistar","Transmitir comunicación"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Promocionar","Indagar culturas/historia","Crítica de espectáculos","Organizar eventos"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Planificar viajes/eventos","Luces y sonido","Operar sistemas electrónicos"] },
    { t: "options", text: "¿Qué forma de contar historias te llama más?", delay: 1200, options: ["En texto — artículos, crónicas, reportajes","En audio o video — podcast, radio, televisión","En redes — contenido digital, social media"] },
    { t: "text", text: "¿Hay algún medio, formato o historia que te haya impactado y que siempre recordás?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Buenísimo. Se nota que tenés ojo para las historias. ¡Hasta la próxima! 🙌", delay: 1000 },
    { t: "end" },
  ]},
  { id: "arte", name: "Ana Suárez", role: "Diseñadora · Artista visual", color: "#C83070", emoji: "🎨", area: "Arte y Diseño", flow: [
    { t: "bot", text: "¡Hola! Soy Ana 👋", delay: 800 },
    { t: "bot", text: "Soy diseñadora gráfica y artista visual. Trabajo con marcas, ilustración, fotografía y también doy clases de diseño.", delay: 1700 },
    { t: "bot", text: "Voy a mostrarte actividades del área de arte y diseño. Marcá las que reconocés como talentos tuyos.", delay: 1400 },
    { t: "chips", text: "¿Con cuáles de estas te identificás?", delay: 1100, items: ["Dibujar/Pintar","Fotografía","Diseño de objetos/imágenes","Decorar"] },
    { t: "chips", text: "¿Y estas?", delay: 800, items: ["Teatro","Danza","Tocar instrumento","Leer partituras"] },
    { t: "chips", text: "Últimas...", delay: 700, items: ["Historia del arte","Manualidades/Escultura","Confección de ropa","Maquetas","Diseño web"] },
    { t: "options", text: "¿Cómo definirías tu relación con el arte y la expresión?", delay: 1200, options: ["Es una parte central de quién soy","Me atrae pero no lo practiqué mucho","Me gusta apreciarlo más que crearlo"] },
    { t: "text", text: "¿Hay alguna forma artística que siempre quisiste explorar pero nunca te animaste?", placeholder: "Lo que se te venga a la mente...", delay: 1400 },
    { t: "bot", text: "Me alegra que hayas llegado hasta acá. La sensibilidad estética es un talento. ¡Hasta pronto! 🙌", delay: 1100 },
    { t: "end" },
  ]},
]

const ACK_NONE = ["Entendido, seguimos.", "Ok."]
const ACK_FEW = ["Hay algo ahí.", "Algunos de estos.", "Interesante."]
const ACK_MANY = ["¡Bastante de esto te resuena!", "Hay material.", "Interesante lo que marcás.", "Bien."]
const ACK_NINGUNO = ["No pasa nada — no necesariamente tenés que tener talentos en cada área.", "Totalmente válido.", "Está bien."]
const ACK_REG = ["Interesante.", "Tiene sentido.", "Bien pensado.", "Qué bueno.", "Me gusta eso.", "Eso dice mucho.", "Bueno saberlo."]
const rnd = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)]

function chipAck(sel: string[]) {
  if (sel.length === 1 && sel[0] === "Ninguno de estos") return rnd(ACK_NINGUNO)
  if (sel.length === 0) return rnd(ACK_NONE)
  if (sel.length <= 2) return rnd(ACK_FEW)
  return rnd(ACK_MANY)
}

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
interface ProfesionalesFormProps {
  userId: number; onComplete: () => void
  onSave: (sectionId: number, responses: any, meta: object) => Promise<void>
  initialResponses?: any; onResponseChange?: (responses: any) => void
}

type Msg = { type: "bot" | "user" | "typing"; text: string }
type ProfData = { talents: string[]; answers: Record<string, string> }

export function ProfesionalesForm({ userId, onComplete, onSave, initialResponses, onResponseChange }: ProfesionalesFormProps) {
  const [completedProfs, setCompletedProfs] = useState<Set<string>>(new Set(initialResponses?.completed ?? []))
  const [profData, setProfData] = useState<Record<string, ProfData>>(initialResponses?.data ?? {})
  const [activeProf, setActiveProf] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [inputMode, setInputMode] = useState<"none" | "chips" | "options" | "text" | "end">("none")
  const [chipItems, setChipItems] = useState<string[]>([])
  const [chipSelected, setChipSelected] = useState<string[]>([])
  const [optionItems, setOptionItems] = useState<string[]>([])
  const [placeholder, setPlaceholder] = useState("")
  const [textVal, setTextVal] = useState("")
  const [flowIdx, setFlowIdx] = useState(0)
  const [talents, setTalents] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const msgRef = useRef<HTMLDivElement>(null)
  const processingRef = useRef(false)
  const talentsRef = useRef(talents)
  talentsRef.current = talents
  const answersRef = useRef(answers)
  answersRef.current = answers

  useEffect(() => { onResponseChange?.({ completed: [...completedProfs], data: profData }) }, [completedProfs, profData]) // eslint-disable-line react-hooks/exhaustive-deps

  const scroll = useCallback(() => { setTimeout(() => { msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" }) }, 60) }, [])
  const addMsg = useCallback((m: Msg) => { setMessages((p) => [...p, m]); setTimeout(scroll, 80) }, [scroll])

  const prof = activeProf ? PROS.find((p) => p.id === activeProf) : null

  const processStep = useCallback(async (idx: number) => {
    if (processingRef.current || !prof) return
    processingRef.current = true
    const step = prof.flow[idx]
    if (!step) { processingRef.current = false; return }

    if (step.t === "end") {
      setCompletedProfs((s) => new Set([...s, prof.id]))
      // Use refs to get latest values (avoids stale closure)
      setProfData((d) => ({ ...d, [prof.id]: { talents: talentsRef.current, answers: answersRef.current } }))
      setInputMode("end")
      processingRef.current = false
      return
    }

    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMessages((p) => p.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: step.text })

      if (step.t === "bot") {
        processingRef.current = false
        setTimeout(() => processStep(idx + 1), 480)
      } else if (step.t === "chips") {
        setChipItems(step.items)
        setChipSelected([])
        setInputMode("chips")
        setFlowIdx(idx)
        processingRef.current = false
      } else if (step.t === "options") {
        setOptionItems(step.options)
        setInputMode("options")
        setFlowIdx(idx)
        processingRef.current = false
      } else if (step.t === "text") {
        setPlaceholder(step.placeholder)
        setTextVal("")
        setInputMode("text")
        setFlowIdx(idx)
        processingRef.current = false
      }
    }, step.delay)
  }, [prof, addMsg, talents, answers]) // eslint-disable-line react-hooks/exhaustive-deps

  const openProfessional = (id: string) => {
    setActiveProf(id)
    setChatOpen(true)
    setMessages([])
    setInputMode("none")
    setTalents([])
    setAnswers({})
    setFlowIdx(0)
    processingRef.current = false
    setTimeout(() => processStep(0), 100)
  }

  // Re-trigger processStep when prof changes
  useEffect(() => {
    if (activeProf && messages.length === 0 && !processingRef.current) {
      processStep(0)
    }
  }, [activeProf]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChipConfirm = () => {
    const selected = chipSelected.filter((c) => c !== "Ninguno de estos")
    setTalents((t) => [...t, ...selected])
    addMsg({ type: "user", text: chipSelected.join(", ") })
    setInputMode("none")
    const ack = chipAck(chipSelected)
    addMsg({ type: "typing", text: "" })
    setTimeout(() => {
      setMessages((p) => p.filter((m) => m.type !== "typing"))
      addMsg({ type: "bot", text: ack })
      setTimeout(() => processStep(flowIdx + 1), 480)
    }, 650)
  }

  const handleOptionSelect = (opt: string) => {
    if (!prof) return
    const step = prof.flow[flowIdx]
    const qText = "text" in step ? step.text : ""
    setAnswers((a) => ({ ...a, [qText]: opt }))
    addMsg({ type: "user", text: opt })
    setInputMode("none")
    if (Math.random() < 0.3) {
      const ack = rnd(ACK_REG)
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMessages((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: ack })
        setTimeout(() => processStep(flowIdx + 1), 480)
      }, 650)
    } else {
      setTimeout(() => processStep(flowIdx + 1), 400)
    }
  }

  const handleTextSubmit = () => {
    if (!textVal.trim() || !prof) return
    const step = prof.flow[flowIdx]
    const qText = "text" in step ? step.text : ""
    setAnswers((a) => ({ ...a, [qText]: textVal.trim() }))
    addMsg({ type: "user", text: textVal.trim() })
    setInputMode("none")
    setTextVal("")
    if (Math.random() < 0.3) {
      const ack = rnd(ACK_REG)
      addMsg({ type: "typing", text: "" })
      setTimeout(() => {
        setMessages((p) => p.filter((m) => m.type !== "typing"))
        addMsg({ type: "bot", text: ack })
        setTimeout(() => processStep(flowIdx + 1), 480)
      }, 650)
    } else {
      setTimeout(() => processStep(flowIdx + 1), 400)
    }
  }

  const toggleChip = (chip: string) => {
    if (chip === "Ninguno de estos") {
      setChipSelected(["Ninguno de estos"])
    } else {
      setChipSelected((s) => {
        const without = s.filter((c) => c !== "Ninguno de estos")
        return without.includes(chip) ? without.filter((c) => c !== chip) : [...without, chip]
      })
    }
  }

  // Save all when all 9 done
  const allDone = completedProfs.size === PROS.length
  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      const r: any[] = []
      let n = 1
      PROS.forEach((p) => {
        const d = profData[p.id]
        if (!d) return
        r.push({ questionNumber: n++, question: `[${p.area}] Actividades`, responseArray: d.talents })
        Object.entries(d.answers).forEach(([q, a]) => {
          r.push({ questionNumber: n++, question: q, responseText: a })
        })
      })
      await onSave(0, r, { section: "profesionales" })
      onComplete()
    } catch (e) { console.error("Error saving Profesionales:", e) }
    finally { setIsSaving(false) }
  }

  return (
    <div style={{ background: "#F9F8F6" }} className="flex h-full min-h-full">
      {/* Sidebar */}
      <div className={cn("flex flex-col border-r shrink-0 overflow-hidden transition-transform duration-300", chatOpen ? "hidden md:flex" : "flex", "w-full md:w-[280px] lg:w-[300px]")} style={{ background: "#F0EDE8", borderColor: "#E8E3DC" }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: "#E8E3DC" }}>
          <div className="flex-1">
            <div className="text-base font-bold" style={{ letterSpacing: "-0.3px", color: "#2D2D2D" }}>Profesionales</div>
            <div className="text-xs mt-0.5" style={{ color: "#9A9590" }}>{completedProfs.size} de {PROS.length} completados</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {PROS.map((p) => (
            <button
              key={p.id}
              onClick={() => openProfessional(p.id)}
              className={cn("flex items-center gap-3.5 w-full px-5 py-3.5 border-b text-left transition-colors", activeProf === p.id ? "bg-black/[0.06]" : "hover:bg-black/[0.04]")}
              style={{ borderColor: "#E8E3DC" }}
            >
              <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: p.color + "20", border: `2px solid ${p.color}40` }}>
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: "#2D2D2D" }}>{p.name}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: "#9A9590" }}>{p.area}</div>
              </div>
              <div className={cn("w-[9px] h-[9px] rounded-full shrink-0", completedProfs.has(p.id) ? "bg-[#6BCB77]" : "")} style={!completedProfs.has(p.id) ? { background: "#E8E3DC" } : undefined} />
            </button>
          ))}
        </div>

        {allDone && (
          <div className="p-4 border-t shrink-0" style={{ borderColor: "#E8E3DC" }}>
            <button onClick={handleSaveAll} disabled={isSaving} className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80" style={{ background: "#2D2D2D" }}>
              {isSaving ? "Guardando..." : "Guardar y Finalizar"}
            </button>
          </div>
        )}
      </div>

      {/* Chat panel */}
      <div className={cn("flex-1 flex flex-col overflow-hidden", !chatOpen ? "hidden md:flex" : "flex")} style={{ background: "#F9F8F6" }}>
        {!prof ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <span className="text-[44px] mb-4 opacity-40">💬</span>
            <div className="text-lg font-semibold" style={{ color: "#2D2D2D" }}>Elegí un profesional</div>
            <p className="text-[13px] mt-1.5 max-w-[240px] leading-relaxed" style={{ color: "#9A9590" }}>Seleccioná una conversación para empezar.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0" style={{ borderColor: "#E8E3DC" }}>
              <button onClick={() => setChatOpen(false)} className="md:hidden text-lg shrink-0 p-1" style={{ color: "#9A9590" }}>←</button>
              <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: prof.color }}>
                {prof.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold" style={{ letterSpacing: "-0.2px" }}>{prof.name}</div>
                <div className="text-xs" style={{ color: "#9A9590" }}>
                  <span className="inline-block w-[7px] h-[7px] rounded-full mr-1" style={{ background: "#6BCB77" }} />
                  {prof.role}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="h-0.5 shrink-0" style={{ background: "#E8E3DC" }}>
              <div className="h-full transition-all duration-300" style={{ width: completedProfs.has(prof.id) ? "100%" : "0%", background: prof.color }} />
            </div>

            {/* Messages */}
            <div ref={msgRef} className="flex-1 overflow-y-auto flex flex-col gap-2 px-4 py-5" style={{ scrollBehavior: "smooth" }}>
              {messages.map((m, i) => {
                if (m.type === "typing") return (
                  <div key={i} className="self-start" style={{ animation: "popIn 0.2s ease forwards", opacity: 0 }}>
                    <div className="flex items-center gap-[5px] px-4 py-3 bg-white rounded-[20px] rounded-tl-[5px]" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                      {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: "#C8C2BB", animation: `dotBounce 1.1s ease-in-out infinite ${d * 0.18}s` }} />)}
                    </div>
                  </div>
                )
                return (
                  <div key={i} className={cn("flex max-w-[82%]", m.type === "bot" ? "self-start" : "self-end")} style={{ animation: "popIn 0.22s ease-out forwards", opacity: 0 }}>
                    <div className={cn("px-3.5 py-2.5 text-[14.5px] leading-relaxed rounded-[20px]", m.type === "bot" ? "rounded-tl-[5px] bg-white" : "rounded-tr-[5px]")}
                      style={{ boxShadow: m.type === "bot" ? "0 1px 6px rgba(0,0,0,0.06)" : undefined, background: m.type === "user" ? "#EDE8DF" : undefined, color: "#2D2D2D" }}>
                      {m.text}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input area */}
            <div className="shrink-0 px-4 py-3 border-t" style={{ borderColor: "#E8E3DC", minHeight: "68px" }}>
              {inputMode === "chips" && (
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="flex flex-wrap gap-[7px]">
                    {[...chipItems, "Ninguno de estos"].map((c) => (
                      <button key={c} onClick={() => toggleChip(c)}
                        className={cn("px-3.5 py-[7px] rounded-full border text-[13px] font-medium transition-all active:scale-[0.97]",
                          c === "Ninguno de estos" && !chipSelected.includes(c) && "border-dashed"
                        )}
                        style={{
                          background: chipSelected.includes(c) ? prof.color : "#F9F8F6",
                          color: chipSelected.includes(c) ? "white" : c === "Ninguno de estos" ? "#9A9590" : "#2D2D2D",
                          borderColor: chipSelected.includes(c) ? prof.color : "#E8E3DC",
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleChipConfirm} disabled={chipSelected.length === 0}
                    className="self-end px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-opacity hover:opacity-80 active:scale-[0.97] disabled:opacity-40"
                    style={{ background: "#2D2D2D" }}>
                    Listo →
                  </button>
                </div>
              )}

              {inputMode === "options" && (
                <div className="flex flex-wrap gap-2 w-full">
                  {optionItems.map((o) => (
                    <button key={o} onClick={() => handleOptionSelect(o)}
                      className="px-[17px] py-[9px] rounded-full border text-[13.5px] font-medium transition-all hover:bg-[#2D2D2D] hover:text-[#F9F8F6] hover:border-[#2D2D2D] active:scale-[0.96]"
                      style={{ background: "#F9F8F6", borderColor: "#E8E3DC", color: "#2D2D2D" }}>
                      {o}
                    </button>
                  ))}
                </div>
              )}

              {inputMode === "text" && (
                <div className="flex items-end gap-2.5 w-full">
                  <textarea value={textVal} onChange={(e) => { setTextVal(e.target.value); e.currentTarget.style.height = "auto"; e.currentTarget.style.height = Math.min(e.currentTarget.scrollHeight, 108) + "px" }}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (textVal.trim()) handleTextSubmit() } }}
                    placeholder={placeholder} rows={1}
                    className="flex-1 px-4 py-2.5 rounded-3xl border text-[14.5px] outline-none resize-none transition-colors"
                    style={{ background: "white", borderColor: "#E8E3DC", color: "#2D2D2D", lineHeight: "1.5", minHeight: "44px", maxHeight: "108px", fontFamily: "inherit" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#AAA49D" }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E8E3DC" }} />
                  <button onClick={handleTextSubmit} disabled={!textVal.trim()}
                    className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 transition-all hover:opacity-80 active:scale-[0.94] disabled:opacity-40"
                    style={{ background: prof.color }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                </div>
              )}

              {inputMode === "end" && (
                <div className="flex justify-center w-full">
                  <button onClick={() => setChatOpen(false)} className="px-6 py-2.5 rounded-full text-[13.5px] font-semibold text-white transition-opacity hover:opacity-80" style={{ background: "#2D2D2D" }}>
                    ← Ver otros profesionales
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes popIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-3px); } }
      `}</style>
    </div>
  )
}
