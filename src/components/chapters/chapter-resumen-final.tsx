"use client"

import { useState, useEffect, useRef } from "react"
import { ChapterHeader, ProseBlock, CTAButton, TransitionBlock } from "@/components/journey/narrative-blocks"
import { cn } from "@/lib/utils"
import { Sparkles, Share2, Check, Copy } from "lucide-react"

// Data interface
export interface ResumenFinalData {
  name: string
  centralPhrase: string
  shareableTag: string
  elaboration: string
  orbits: Array<{
    label: string
    sublabel?: string
    tier: 1 | 2 | 3
    icon: string
    color: "indigo" | "violet" | "emerald" | "amber" | "sky"
  }>
  esencia: {
    riasecCode: string
    topInteligencia: string
    dominanciaStyle: string
    millonPattern: string
  }
}

interface ChapterResumenFinalProps {
  data: ResumenFinalData
  onNext: () => void
}

// Color mapping for orbit nodes
const orbitColors: Record<string, { bg: string; border: string; text: string }> = {
  indigo: { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  violet: { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700" },
  emerald: { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700" },
  amber: { bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-700" },
  sky: { bg: "bg-sky-100", border: "border-sky-300", text: "text-sky-700" },
}

// Calculate node positions on orbits
function calculateNodePosition(index: number, total: number, radius: number, tier: number) {
  // Offset by tier to create visual interest
  const baseAngle = (2 * Math.PI * index) / total - Math.PI / 2 + (tier * Math.PI / 6)
  const x = 170 + Math.cos(baseAngle) * radius
  const y = 170 + Math.sin(baseAngle) * radius
  return { x, y }
}

export function ChapterResumenFinal({ data, onNext }: ChapterResumenFinalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showElements, setShowElements] = useState({
    rings: false,
    lines: false,
    nodes: false,
    content: false,
  })
  const [copied, setCopied] = useState(false)
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

  // Progressive reveal animation
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setShowElements(prev => ({ ...prev, rings: true })), 300)
      setTimeout(() => setShowElements(prev => ({ ...prev, lines: true })), 800)
      setTimeout(() => setShowElements(prev => ({ ...prev, nodes: true })), 1200)
      setTimeout(() => setShowElements(prev => ({ ...prev, content: true })), 1800)
    }
  }, [isVisible])

  // Share functionality
  const handleShare = async () => {
    const shareText = `${data.shareableTag}\n\nDescubrí mi esencia vocacional con Timon.`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi Esencia Vocacional",
          text: shareText,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Group orbits by tier
  const tier1 = data.orbits.filter(o => o.tier === 1)
  const tier2 = data.orbits.filter(o => o.tier === 2)
  const tier3 = data.orbits.filter(o => o.tier === 3)

  return (
    <section ref={sectionRef} className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto">
        <ChapterHeader
          number="08"
          title="Tu esencia"
          subtitle="Todo lo que descubrimos, en una mirada"
        />

        {/* Constellation Map */}
        <div className="relative flex justify-center my-12">
          <svg
            viewBox="0 0 340 340"
            className="w-full max-w-[340px] h-auto"
          >
            {/* Orbit Rings */}
            <g className={cn(
              "transition-opacity duration-700",
              showElements.rings ? "opacity-100" : "opacity-0"
            )}>
              <circle cx="170" cy="170" r="64" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/40" />
              <circle cx="170" cy="170" r="110" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/30" />
              <circle cx="170" cy="170" r="150" fill="none" stroke="currentColor" strokeWidth="1" className="text-border/20" />
            </g>

            {/* Connection Lines */}
            <g className={cn(
              "transition-opacity duration-700",
              showElements.lines ? "opacity-100" : "opacity-0"
            )}>
              {/* Lines from center to tier 1 */}
              {tier1.map((node, idx) => {
                const pos = calculateNodePosition(idx, tier1.length, 64, 1)
                return (
                  <line
                    key={`line-t1-${idx}`}
                    x1="170"
                    y1="170"
                    x2={pos.x}
                    y2={pos.y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-primary/20"
                  />
                )
              })}
              {/* Lines from tier 1 to nearest tier 2 */}
              {tier2.map((node, idx) => {
                const pos = calculateNodePosition(idx, tier2.length, 110, 2)
                const nearestT1Idx = Math.floor((idx / tier2.length) * tier1.length)
                const t1Pos = calculateNodePosition(nearestT1Idx, tier1.length, 64, 1)
                return (
                  <line
                    key={`line-t2-${idx}`}
                    x1={t1Pos.x}
                    y1={t1Pos.y}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-border/50"
                  />
                )
              })}
            </g>

            {/* Center Name */}
            <g className={cn(
              "transition-all duration-500",
              showElements.rings ? "opacity-100" : "opacity-0"
            )}>
              <circle cx="170" cy="170" r="28" className="fill-primary/10" />
              <text
                x="170"
                y="175"
                textAnchor="middle"
                className="fill-primary text-xs font-medium"
              >
                {data.name}
              </text>
            </g>

            {/* Tier 1 Nodes (inner ring, largest) */}
            {tier1.map((node, idx) => {
              const pos = calculateNodePosition(idx, tier1.length, 64, 1)
              const colors = orbitColors[node.color]
              return (
                <g
                  key={`t1-${idx}`}
                  className={cn(
                    "transition-all duration-500",
                    showElements.nodes ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="22"
                    className={cn(colors.bg, colors.border, "stroke-2")}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    className="text-lg"
                  >
                    {node.icon}
                  </text>
                </g>
              )
            })}

            {/* Tier 2 Nodes (middle ring) */}
            {tier2.map((node, idx) => {
              const pos = calculateNodePosition(idx, tier2.length, 110, 2)
              const colors = orbitColors[node.color]
              return (
                <g
                  key={`t2-${idx}`}
                  className={cn(
                    "transition-all duration-500",
                    showElements.nodes ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${(tier1.length + idx) * 100}ms` }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="16"
                    className={cn(colors.bg, colors.border, "stroke-1")}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    className="text-sm"
                  >
                    {node.icon}
                  </text>
                </g>
              )
            })}

            {/* Tier 3 Nodes (outer ring, smallest) */}
            {tier3.map((node, idx) => {
              const pos = calculateNodePosition(idx, tier3.length, 150, 3)
              const colors = orbitColors[node.color]
              return (
                <g
                  key={`t3-${idx}`}
                  className={cn(
                    "transition-all duration-500",
                    showElements.nodes ? "opacity-100" : "opacity-0"
                  )}
                  style={{ transitionDelay: `${(tier1.length + tier2.length + idx) * 100}ms` }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    className={cn(colors.bg, colors.border, "stroke-1")}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 3}
                    textAnchor="middle"
                    className="text-xs"
                  >
                    {node.icon}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Orbit Legend */}
        <div className={cn(
          "flex flex-wrap justify-center gap-2 mb-10 transition-all duration-500",
          showElements.content ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {[...tier1, ...tier2].map((node, idx) => {
            const colors = orbitColors[node.color]
            return (
              <span
                key={idx}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  colors.bg, colors.text
                )}
              >
                <span>{node.icon}</span>
                <span>{node.label}</span>
              </span>
            )
          })}
        </div>

        {/* Central Phrase Card */}
        <div className={cn(
          "relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/6 via-secondary/15 to-accent/6 border border-primary/10 mb-10 transition-all duration-700",
          showElements.content ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <Sparkles className="absolute top-6 right-6 w-5 h-5 text-primary/30" />
          <p className="text-2xl md:text-3xl font-serif text-foreground leading-relaxed text-center text-balance">
            {data.centralPhrase}
          </p>
          <p className="text-sm tracking-widest text-muted-foreground uppercase text-center mt-6">
            {data.shareableTag}
          </p>
        </div>

        {/* Esencia Grid */}
        <div className={cn(
          "grid grid-cols-2 gap-3 mb-10 transition-all duration-500",
          showElements.content ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xs text-indigo-600 uppercase tracking-wider mb-1">RIASEC</p>
            <p className="font-serif text-lg text-indigo-900">{data.esencia.riasecCode}</p>
          </div>
          <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
            <p className="text-xs text-violet-600 uppercase tracking-wider mb-1">Inteligencia Top</p>
            <p className="font-serif text-lg text-violet-900">{data.esencia.topInteligencia}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">Dominancia</p>
            <p className="font-serif text-lg text-emerald-900">{data.esencia.dominanciaStyle}</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-600 uppercase tracking-wider mb-1">Millon</p>
            <p className="font-serif text-lg text-amber-900">{data.esencia.millonPattern}</p>
          </div>
        </div>

        {/* Elaboration */}
        <ProseBlock>
          <p className={cn(
            "text-lg text-foreground/70 leading-relaxed transition-all duration-500",
            showElements.content ? "opacity-100" : "opacity-0"
          )}
            style={{ transitionDelay: "400ms" }}
          >
            {data.elaboration}
          </p>
        </ProseBlock>

        {/* Share Button */}
        <div className={cn(
          "flex justify-center my-8 transition-all duration-500",
          showElements.content ? "opacity-100" : "opacity-0"
        )}
          style={{ transitionDelay: "500ms" }}
        >
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/50 hover:bg-secondary/70 text-foreground text-sm font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Compartir mi esencia
              </>
            )}
          </button>
        </div>

        {/* Bridge to Careers */}
        <TransitionBlock variant="bridge">
          Ya entendimos quién sos. Ahora veamos qué caminos se alinean con tu esencia.
        </TransitionBlock>

        <div className="mt-12 text-center">
          <CTAButton onClick={onNext} size="large">
            Ver los caminos que aparecen
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Demo data for Valentina
export const demoResumenFinal: ResumenFinalData = {
  name: "Valentina",
  centralPhrase: "Sos alguien que encuentra sentido en entender cómo funcionan las cosas, construir soluciones que funcionen, y tener la autonomía para hacerlo a tu manera.",
  shareableTag: "Investigadora. Analítica. Creativa.",
  elaboration: "Funcionás mejor en contextos donde hay problemas claros que resolver, donde tu capacidad analítica sea un activo, y donde puedas profundizar sin que te apuren. Te potenciás cuando tenés espacio para pensar, cuando el trabajo tiene una lógica que podés seguir, y cuando podés ver el impacto de lo que hacés. Esto no define quién sos. Es una foto de este momento. Pero es una foto útil para pensar qué sigue.",
  orbits: [
    // Tier 1 - Core traits (inner ring)
    { label: "Análisis", icon: "🔍", tier: 1, color: "indigo" },
    { label: "Creatividad", icon: "✨", tier: 1, color: "violet" },
    { label: "Autonomía", icon: "🎯", tier: 1, color: "emerald" },

    // Tier 2 - Supporting traits (middle ring)
    { label: "Curiosidad", sublabel: "Siempre preguntando", icon: "💡", tier: 2, color: "amber" },
    { label: "Profundidad", sublabel: "Vas al fondo", icon: "🌊", tier: 2, color: "indigo" },
    { label: "Expresión", sublabel: "Ideas claras", icon: "📝", tier: 2, color: "violet" },
    { label: "Reflexión", sublabel: "Pensás antes", icon: "🪞", tier: 2, color: "sky" },

    // Tier 3 - Contextual traits (outer ring)
    { label: "Lógica", icon: "🧮", tier: 3, color: "indigo" },
    { label: "Innovación", icon: "🚀", tier: 3, color: "violet" },
    { label: "Foco", icon: "🎯", tier: 3, color: "emerald" },
    { label: "Independencia", icon: "🦅", tier: 3, color: "amber" },
    { label: "Visión", icon: "👁", tier: 3, color: "sky" },
  ],
  esencia: {
    riasecCode: "I-A",
    topInteligencia: "Lógico-Matemática",
    dominanciaStyle: "Analítico-Experimental",
    millonPattern: "Modificador Independiente"
  }
}
