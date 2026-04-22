"use client"

import { useState, useRef, useEffect } from "react"
import { ChapterHeader, ProseBlock, StickyCTA, InsightCard } from "@/components/journey/narrative-blocks"
import { cn } from "@/lib/utils"

// Data interfaces
export interface MapaInternoData {
  riasec: {
    primary: { code: string; label: string; description: string }
    secondary: Array<{ code: string; label: string; score: number }>
    insight: string
  }
  inteligencias: Array<{
    name: string
    score: number
    icon: string
    description: string
  }>
  dominancia: {
    quadrants: Array<{
      id: "A" | "B" | "C" | "D"
      label: string
      sublabel: string
      score: number
      description: string
    }>
    insight: string
  }
  mips: {
    traits: Array<{
      name: string
      pole: string
      score: number
      description: string
    }>
    pattern: string
  }
}

interface ChapterMapaInternoProps {
  data: MapaInternoData
  onNext: () => void
}

// RIASEC color mapping
const riasecColors: Record<string, string> = {
  R: "bg-slate-500",
  I: "bg-indigo-500",
  A: "bg-violet-500",
  S: "bg-emerald-500",
  E: "bg-amber-500",
  C: "bg-sky-500",
}

const riasecBgColors: Record<string, string> = {
  R: "bg-slate-100",
  I: "bg-indigo-100",
  A: "bg-violet-100",
  S: "bg-emerald-100",
  E: "bg-amber-100",
  C: "bg-sky-100",
}

// Dominance quadrant colors
const quadrantColors: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  B: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  C: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  D: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
}

// Animated bar hook
function useAnimatedValue(targetValue: number, isVisible: boolean, delay: number = 0) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setValue(targetValue)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [isVisible, targetValue, delay])

  return value
}

// Tab components
const tabs = [
  { id: "riasec", label: "RIASEC" },
  { id: "inteligencias", label: "Inteligencias" },
  { id: "dominancia", label: "Dominancia" },
  { id: "mips", label: "Personalidad" },
]

export function ChapterMapaInterno({ data, onNext }: ChapterMapaInternoProps) {
  const [activeTab, setActiveTab] = useState("riasec")
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="03"
          title="Tu mapa interno"
          subtitle="Lo que las herramientas psicométricas revelaron"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            Antes de hablar de carreras, esto es lo que tu forma de ser nos mostró. Cada herramienta mira desde un ángulo diferente, pero todas cuentan partes de la misma historia.
          </p>
        </ProseBlock>

        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 min-w-[80px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div ref={sectionRef} className="min-h-[400px]">
          {activeTab === "riasec" && (
            <RiasecTab data={data.riasec} isVisible={isVisible} />
          )}
          {activeTab === "inteligencias" && (
            <InteligenciasTab data={data.inteligencias} isVisible={isVisible} />
          )}
          {activeTab === "dominancia" && (
            <DominanciaTab data={data.dominancia} isVisible={isVisible} />
          )}
          {activeTab === "mips" && (
            <MipsTab data={data.mips} isVisible={isVisible} />
          )}
        </div>

        <InsightCard
          quote="Estos resultados no te definen. Son una fotografía de tendencias, no un diagnóstico. Úsalos como brújula, no como destino."
          variant="default"
        />

        <StickyCTA
          label="Continuar"
          onClick={onNext}
          hint="Siguiente: Tu energía"
        />
      </div>
    </section>
  )
}

// RIASEC Tab
function RiasecTab({ data, isVisible }: { data: MapaInternoData["riasec"]; isVisible: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Primary Code Hero */}
      <div className={cn(
        "p-8 rounded-2xl border-2 transition-all duration-500",
        riasecBgColors[data.primary.code],
        `border-${data.primary.code === 'I' ? 'indigo' : data.primary.code === 'A' ? 'violet' : 'slate'}-200`
      )}>
        <div className="flex items-center gap-4 mb-4">
          <span className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-serif font-bold",
            riasecColors[data.primary.code]
          )}>
            {data.primary.code}
          </span>
          <div>
            <h3 className="text-2xl font-serif text-foreground">{data.primary.label}</h3>
            <p className="text-sm text-muted-foreground">Tu tipo dominante</p>
          </div>
        </div>
        <p className="text-foreground/80 leading-relaxed">
          {data.primary.description}
        </p>
      </div>

      {/* Secondary Codes */}
      <div className="space-y-3">
        {data.secondary.map((item, idx) => {
          const animatedValue = useAnimatedValue(item.score, isVisible, idx * 100)
          return (
            <div key={item.code} className="flex items-center gap-4">
              <span className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0",
                riasecColors[item.code]
              )}>
                {item.code}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground tabular-nums">{item.score}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", riasecColors[item.code])}
                    style={{ width: `${animatedValue}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight */}
      <p className="text-muted-foreground italic text-center pt-4 border-t border-border/50">
        {data.insight}
      </p>
    </div>
  )
}

// Inteligencias Tab
function InteligenciasTab({ data, isVisible }: { data: MapaInternoData["inteligencias"]; isVisible: boolean }) {
  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top 3 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {top3.map((item, idx) => (
          <div
            key={item.name}
            className={cn(
              "relative p-5 rounded-2xl border transition-all duration-500",
              idx === 0
                ? "bg-primary/5 border-primary/30"
                : "bg-card border-border/50",
              isVisible && "animate-fade-in-up"
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {idx === 0 && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Top
              </span>
            )}
            <div className="text-3xl mb-3">{item.icon}</div>
            <h4 className="font-medium text-foreground mb-1">{item.name}</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-serif text-primary">{item.score}</span>
              <svg className="w-8 h-8" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${(item.score / 100) * 75} 75`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-700"
                  transform="rotate(-90 16 16)"
                  style={{
                    strokeDasharray: isVisible ? `${(item.score / 100) * 75} 75` : "0 75"
                  }}
                />
              </svg>
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Rest as compact list */}
      <div className="space-y-2 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Otras inteligencias</p>
        {rest.map((item, idx) => {
          const animatedValue = useAnimatedValue(item.score, isVisible, (idx + 3) * 100)
          return (
            <div key={item.name} className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm text-foreground flex-1">{item.name}</span>
              <span className="text-sm text-muted-foreground tabular-nums w-10">{item.score}%</span>
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-muted-foreground/50 rounded-full transition-all duration-500"
                  style={{ width: `${animatedValue}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Dominancia Tab
function DominanciaTab({ data, isVisible }: { data: MapaInternoData["dominancia"]; isVisible: boolean }) {
  const dominant = data.quadrants.reduce((a, b) => a.score > b.score ? a : b)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.quadrants.map((q, idx) => {
          const colors = quadrantColors[q.id]
          const isDominant = q.id === dominant.id
          const animatedValue = useAnimatedValue(q.score, isVisible, idx * 100)

          return (
            <div
              key={q.id}
              className={cn(
                "relative p-5 rounded-xl border transition-all duration-500",
                colors.bg,
                colors.border,
                isDominant && "ring-2 ring-primary/50"
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {isDominant && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("text-lg font-serif font-bold", colors.text)}>{q.id}</span>
                <span className={cn("text-3xl font-serif", colors.text)}>{q.score}%</span>
              </div>
              <h4 className="font-medium text-foreground text-sm">{q.label}</h4>
              <p className="text-xs text-muted-foreground mb-3">{q.sublabel}</p>
              <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700",
                    q.id === 'A' ? 'bg-indigo-500' :
                    q.id === 'B' ? 'bg-amber-500' :
                    q.id === 'C' ? 'bg-emerald-500' : 'bg-violet-500'
                  )}
                  style={{ width: `${animatedValue}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Insight */}
      <p className="text-muted-foreground text-center pt-4 border-t border-border/50">
        {data.insight}
      </p>
    </div>
  )
}

// MIPS Tab
function MipsTab({ data, isVisible }: { data: MapaInternoData["mips"]; isVisible: boolean }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pattern Card */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 border border-primary/10 text-center">
        <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed text-balance">
          {data.pattern}
        </p>
      </div>

      {/* Traits */}
      <div className="space-y-4">
        {data.traits.map((trait, idx) => {
          const animatedValue = useAnimatedValue(trait.score, isVisible, idx * 100)
          return (
            <div
              key={trait.name}
              className="p-4 rounded-xl bg-card border border-border/50"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{trait.name}</span>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {trait.pole}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-serif text-foreground tabular-nums">{trait.score}%</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all duration-700"
                    style={{ width: `${animatedValue}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{trait.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Demo data for Valentina
export const demoMapaInterno: MapaInternoData = {
  riasec: {
    primary: {
      code: "I",
      label: "Investigador",
      description: "Te mueve la curiosidad intelectual. Preferís analizar, entender y resolver problemas complejos antes que seguir instrucciones o trabajar en equipo constantemente."
    },
    secondary: [
      { code: "A", label: "Artístico", score: 72 },
      { code: "S", label: "Social", score: 58 },
      { code: "C", label: "Convencional", score: 45 },
      { code: "E", label: "Emprendedor", score: 38 },
      { code: "R", label: "Realista", score: 25 },
    ],
    insight: "Tu perfil I-A sugiere que te atraen campos donde puedas investigar con libertad creativa."
  },
  inteligencias: [
    { name: "Lógico-Matemática", score: 88, icon: "🧮", description: "Razonamiento abstracto y resolución de problemas" },
    { name: "Lingüística", score: 82, icon: "📝", description: "Expresión verbal y escrita" },
    { name: "Intrapersonal", score: 78, icon: "🪞", description: "Autoconocimiento y reflexión" },
    { name: "Espacial", score: 65, icon: "🎨", description: "Visualización y diseño" },
    { name: "Interpersonal", score: 58, icon: "🤝", description: "Empatía y conexión social" },
    { name: "Musical", score: 45, icon: "🎵", description: "Sensibilidad al ritmo y melodía" },
    { name: "Naturalista", score: 40, icon: "🌿", description: "Conexión con la naturaleza" },
    { name: "Corporal", score: 35, icon: "🏃", description: "Coordinación física" },
  ],
  dominancia: {
    quadrants: [
      { id: "A", label: "Lógico", sublabel: "Analítico, crítico, factual", score: 75, description: "Procesamiento racional" },
      { id: "B", label: "Organizado", sublabel: "Secuencial, detallista, planificador", score: 55, description: "Estructura y control" },
      { id: "C", label: "Relacional", sublabel: "Emocional, expresivo, empático", score: 48, description: "Conexión interpersonal" },
      { id: "D", label: "Experimental", sublabel: "Intuitivo, integrador, innovador", score: 68, description: "Pensamiento holístico" },
    ],
    insight: "Predomina el hemisferio izquierdo con apertura a la innovación. Combinás lógica con visión de conjunto."
  },
  mips: {
    traits: [
      { name: "Apertura/Preservación", pole: "Apertura", score: 78, description: "Buscás nuevas experiencias y desafíos intelectuales." },
      { name: "Modificación/Acomodación", pole: "Modificación", score: 72, description: "Preferís cambiar el entorno antes que adaptarte pasivamente." },
      { name: "Individualismo/Protección", pole: "Individualismo", score: 65, description: "Priorizás tus metas pero mantenés sensibilidad social." },
      { name: "Reflexión/Afectividad", pole: "Reflexión", score: 82, description: "Procesás información de forma lógica y analítica." },
    ],
    pattern: "Pensadora independiente con orientación hacia la modificación activa del entorno"
  }
}
