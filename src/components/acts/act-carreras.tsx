"use client"

import { useState } from "react"
import { Career, ProfessionalPath } from "@/lib/career-data"
import {
  ChapterHeader,
  TransitionBlock,
  ProseBlock,
  CTAButton,
} from "@/components/journey/narrative-blocks"
import { CareerCard, CareerFitBreakdown } from "@/components/journey/career-card"
import { CareerBubbles } from "@/components/journey/career-bubbles"
import { ClampText } from "@/components/ui/clamp-text"
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Users,
  Clock,
  Compass,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Hourglass,
  Briefcase,
  Building2,
  Store,
  Rocket,
  Laptop,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SUBJECT_COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-600",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
  slate: "bg-slate-600",
}

const FALLBACK_COLORS = [
  "bg-indigo-600",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500",
  "bg-slate-600",
]

function resolveBarColor(color: string, idx: number): string {
  const trimmed = (color ?? "").trim()
  if (trimmed.startsWith("bg-")) return trimmed
  if (trimmed in SUBJECT_COLOR_MAP) return SUBJECT_COLOR_MAP[trimmed]
  return FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
}

const STUDY_HOURS_LABEL: Record<"alta" | "media" | "baja", string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
}

interface ActCarrerasProps {
  careers: Career[]
  currentChapter: string
  selectedCareer: Career | null
  onSelectCareer: (career: Career) => void
  onBack: () => void
  onNavigateToUniversidades: () => void
  printMode?: boolean
}

export function ActCarreras({
  careers,
  currentChapter,
  selectedCareer,
  onSelectCareer,
  onBack,
  onNavigateToUniversidades,
  printMode = false,
}: ActCarrerasProps) {

  // Print mode (PDF export): render the full list AND the complete detail of
  // EVERY career expanded linearly — no navigation, no interaction.
  if (printMode) {
    return (
      <div className="min-h-screen">
        <ChapterLista
          careers={careers}
          onSelectCareer={onSelectCareer}
          onNavigateToUniversidades={onNavigateToUniversidades}
          printMode
        />
        {careers.map((career) => (
          <ChapterDetalle
            key={career.id}
            career={career}
            onBack={onBack}
            onNavigateToUniversidades={onNavigateToUniversidades}
            printMode
          />
        ))}
      </div>
    )
  }

  const renderChapter = () => {
    switch (currentChapter) {
      case "carreras-detalle":
        return selectedCareer ? (
          <ChapterDetalle
            career={selectedCareer}
            onBack={onBack}
            onNavigateToUniversidades={onNavigateToUniversidades}
          />
        ) : (
          <ChapterLista
            careers={careers}
            onSelectCareer={onSelectCareer}
            onNavigateToUniversidades={onNavigateToUniversidades}
          />
        )
      case "carreras-lista":
      default:
        return (
          <ChapterLista
            careers={careers}
            onSelectCareer={onSelectCareer}
            onNavigateToUniversidades={onNavigateToUniversidades}
          />
        )
    }
  }

  return (
    <div className="min-h-screen">
      {renderChapter()}
    </div>
  )
}

// Chapter: Career List
function ChapterLista({
  careers,
  onSelectCareer,
  onNavigateToUniversidades,
  printMode = false,
}: {
  careers: Career[]
  onSelectCareer: (career: Career) => void
  onNavigateToUniversidades: () => void
  printMode?: boolean
}) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <ChapterHeader
          number="01"
          title="Tus 5 caminos principales"
          subtitle="Ordenados por compatibilidad con tu perfil"
        />

        <ProseBlock>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8">
            Cada uno representa un futuro posible. Explorá los que te generen curiosidad para entender qué tipo de vida podrían habilitar.
          </p>
        </ProseBlock>

        {/* Career Cards */}
        <div className={cn("space-y-6 my-10", !printMode && "stagger-children")}>
          {careers.map((career, idx) => (
            <CareerCard
              key={career.id}
              career={career}
              rank={idx + 1}
              onSelect={() => onSelectCareer(career)}
            />
          ))}
        </div>

        <TransitionBlock>
          Explorá cada carrera para entender no solo qué estudiás, sino cómo sería vivir ese camino.
        </TransitionBlock>

        {!printMode && (
          <div className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-secondary">
            <p className="text-foreground mb-4">
              Cuando tengas una idea más clara de qué camino te interesa, podemos ver dónde podrías construirlo.
            </p>
            <CTAButton onClick={onNavigateToUniversidades} variant="secondary">
              Ver universidades
            </CTAButton>
          </div>
        )}
      </div>
    </section>
  )
}

// Reusable accordion section using native <details>/<summary>
function DetailSection({
  title,
  defaultOpen = false,
  printMode = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  printMode?: boolean
  children: React.ReactNode
}) {
  return (
    <details
      open={printMode || defaultOpen}
      className="group rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 select-none hover:bg-muted/30 transition-colors">
        <h2 className="text-lg md:text-xl font-serif text-foreground">{title}</h2>
        <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-6 pt-1 border-t border-border/40">{children}</div>
    </details>
  )
}

// Icons per path position — kept consistent so the same archetype slot shows the
// same icon across careers (the archetype content itself comes from the agent).
const PATH_ICONS = [Building2, Store, Rocket, Laptop]

// "Los caminos": 2x2 grid of compact cards (icon + title + "Ver esta vida").
// Selecting one opens its full detail in a panel below the grid.
function ProfessionalPaths({
  paths,
  printMode = false,
}: {
  paths: ProfessionalPath[]
  printMode?: boolean
}) {
  const [selected, setSelected] = useState<number | null>(null)

  // Print mode: every path stacked with its full detail, no selection buttons.
  if (printMode) {
    return (
      <div className="space-y-5">
        {paths.map((path, idx) => {
          const Icon = PATH_ICONS[idx % PATH_ICONS.length]
          return (
            <div key={`${path.title}-${idx}`} className="space-y-4">
              <article className="rounded-2xl border border-border/50 bg-muted/20 p-5 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground leading-snug">
                  {path.title}
                </h3>
              </article>
              <PathDetail path={path} printMode />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paths.map((path, idx) => {
          const Icon = PATH_ICONS[idx % PATH_ICONS.length]
          const active = selected === idx
          return (
            <article
              key={`${path.title}-${idx}`}
              className={cn(
                "rounded-2xl border bg-muted/20 p-5 flex flex-col gap-4 transition-colors",
                active ? "border-primary/40 bg-primary/5" : "border-border/50"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground leading-snug line-clamp-2">
                {path.title}
              </h3>
              <button
                onClick={() => setSelected(active ? null : idx)}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-auto"
              >
                <span>{active ? "Ocultar" : "Ver esta vida"}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    active && "rotate-180"
                  )}
                />
              </button>
            </article>
          )
        })}
      </div>

      {selected !== null && paths[selected] && (
        <PathDetail key={selected} path={paths[selected]} />
      )}
    </div>
  )
}

// Full detail panel for a selected professional path.
function PathDetail({
  path,
  printMode = false,
}: {
  path: ProfessionalPath
  printMode?: boolean
}) {
  return (
    <article className="rounded-2xl border border-border/50 bg-muted/20 overflow-hidden">
      <div className={cn("px-5 py-6 space-y-6", !printMode && "animate-fade-in")}>
        {/* Summary */}
        <p className="text-muted-foreground leading-relaxed">{path.summary}</p>

        {/* Fit vs Challenges */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-emerald-900">
                Natural para vos
              </h4>
            </div>
            <ul className="space-y-2">
              {path.lifestyleFit.map((item, idx) => (
                <li
                  key={idx}
                  className="text-sm text-emerald-900/80 leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-semibold text-amber-900">
                Te va a desafiar
              </h4>
            </div>
            <ul className="space-y-2">
              {path.lifestyleChallenges.map((item, idx) => (
                <li
                  key={idx}
                  className="text-sm text-amber-900/80 leading-relaxed"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Day to day */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">El día a día</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: MapPin, label: "Entorno", value: path.dayToDay.entorno },
                { icon: Users, label: "Con quién", value: path.dayToDay.conQuien },
                { icon: Clock, label: "Horarios", value: path.dayToDay.horarios },
                { icon: Compass, label: "Autonomía", value: path.dayToDay.autonomia },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50"
                >
                  <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="text-sm text-foreground mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trajectory */}
          {path.trajectory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Trayectoria</h4>
              <ol className="relative border-l border-border/60 ml-2 space-y-5">
                {path.trajectory.map((step, idx) => (
                  <li key={idx} className="ml-5">
                    <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-foreground text-sm">{step.title}</p>
                      <span className="text-xs font-medium text-primary tabular-nums">
                        {step.salaryRange}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

        {/* Reflective question */}
        {path.reflectiveQuestion && (
          <div className="p-5 rounded-xl bg-primary/5 border border-primary/15">
            <p className="text-foreground font-serif italic leading-relaxed">
              {path.reflectiveQuestion}
            </p>
          </div>
        )}
      </div>
    </article>
  )
}

// Chapter: Career Detail
function ChapterDetalle({
  career,
  onBack,
  onNavigateToUniversidades,
  printMode = false,
}: {
  career: Career
  onBack: () => void
  onNavigateToUniversidades: () => void
  printMode?: boolean
}) {
  const { detail } = career
  const { academics } = detail
  const { alerts } = academics

  const durationLabel =
    alerts.durationYears == null ? "—" : `${alerts.durationYears} años`

  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        {!printMode && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a las carreras</span>
          </button>
        )}

        {/* Hero */}
        <div className={cn("mb-10", !printMode && "animate-fade-in-up")}>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {career.matchPercentage}% compatible
            </span>
            <span className="text-sm text-muted-foreground">{career.field}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight mb-6">
            {career.name}
          </h1>

          {detail.professionDescription && (
            <ClampText
              lines={4}
              printMode={printMode}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              {detail.professionDescription}
            </ClampText>
          )}
        </div>

        {/* Bubbles: where it's offered */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Dónde se dicta</h2>
          <CareerBubbles programSearchGroup={career.programSearchGroup} />
        </div>

        {/* Accordion sections */}
        <div className="space-y-4">
          {/* a) What we saw in your profile */}
          <DetailSection title="Qué vimos en tu perfil" defaultOpen printMode={printMode}>
            {detail.matchSummary && (
              <div className="mt-4 mb-6">
                <ClampText
                  lines={4}
                  printMode={printMode}
                  className="text-muted-foreground leading-relaxed"
                >
                  {detail.matchSummary}
                </ClampText>
              </div>
            )}
            <CareerFitBreakdown career={career} />
          </DetailSection>

          {/* b) The paths — hidden when there are none */}
          {detail.professionalPaths.length > 0 && (
            <DetailSection title="Los caminos" printMode={printMode}>
              <p className="text-sm text-muted-foreground mt-4 mb-5">
                Una misma carrera abre vidas muy distintas. Explorá cada una.
              </p>
              <ProfessionalPaths paths={detail.professionalPaths} printMode={printMode} />
            </DetailSection>
          )}

          {/* c) What the university degree is like */}
          <DetailSection title="Cómo es la carrera universitaria" printMode={printMode}>
            {academics.academicComposition && (
              <div className="mt-4 mb-6">
                <ClampText
                  lines={4}
                  printMode={printMode}
                  className="text-muted-foreground leading-relaxed"
                >
                  {academics.academicComposition}
                </ClampText>
              </div>
            )}

            {/* Subject distribution bars */}
            {academics.subjectDistribution.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium text-foreground mb-4">Qué vas a estudiar</h3>
                <div className="space-y-4">
                  {academics.subjectDistribution.map((item, idx) => (
                    <div key={`${item.area}-${idx}`}>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-foreground font-medium">{item.area}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            resolveBarColor(item.color, idx)
                          )}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key skills */}
            {academics.keySkills.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium text-foreground mb-4">
                  Competencias que desarrollás
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {academics.keySkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-accent/10 border border-accent/20"
                    >
                      <p className="text-sm text-foreground">{skill}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-5 rounded-xl bg-secondary/30 border border-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Horas de estudio
                  </h4>
                </div>
                <p className="text-foreground font-medium">
                  {STUDY_HOURS_LABEL[alerts.studyHoursLevel]}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-secondary/30 border border-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <Hourglass className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">Duración</h4>
                </div>
                <p className="text-foreground font-medium">{durationLabel}</p>
              </div>

              <div className="p-5 rounded-xl bg-secondary/30 border border-secondary">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Estudiar y trabajar
                  </h4>
                </div>
                <p className="text-foreground text-sm">{alerts.workStudyCapacity}</p>
              </div>
            </div>
          </DetailSection>
        </div>

        {/* d) Navigation buttons */}
        {!printMode && (
          <div className="mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a las carreras</span>
            </button>
            <CTAButton onClick={onNavigateToUniversidades} size="default">
              Ver universidades de esta carrera
            </CTAButton>
          </div>
        )}
      </div>
    </section>
  )
}
