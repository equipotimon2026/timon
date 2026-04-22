"use client"

import { Career } from "@/lib/career-data"
import {
  ChapterHeader,
  TransitionBlock,
  InsightCard,
  ProseBlock,
  ProgressBar,
  CTAButton,
  StickyCTA,
  StatusIndicator
} from "@/components/journey/narrative-blocks"
import { CareerCard, CareerFitBreakdown } from "@/components/journey/career-card"
import { ArrowLeft, ExternalLink, Briefcase, GraduationCap, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActCarrerasProps {
  careers: Career[]
  currentChapter: string
  selectedCareer: Career | null
  onSelectCareer: (career: Career) => void
  onBack: () => void
  onNextChapter: () => void
  onNavigateToUniversidades: () => void
}

export function ActCarreras({
  careers,
  currentChapter,
  selectedCareer,
  onSelectCareer,
  onBack,
  onNextChapter,
  onNavigateToUniversidades
}: ActCarrerasProps) {

  const renderChapter = () => {
    switch (currentChapter) {
      case "carreras-intro":
        return <ChapterIntro onNext={onNextChapter} />
      case "carreras-lista":
        return (
          <ChapterLista
            careers={careers}
            onSelectCareer={onSelectCareer}
            onNavigateToUniversidades={onNavigateToUniversidades}
          />
        )
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
      default:
        return <ChapterIntro onNext={onNextChapter} />
    }
  }

  return (
    <div className="min-h-screen">
      {renderChapter()}
    </div>
  )
}

// Chapter: Introduction to Careers
function ChapterIntro({ onNext }: { onNext: () => void }) {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-6">
            Acto 02 — Los caminos
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-8">
            No hay una carrera perfecta
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            Pero sí hay caminos que encajan mucho mejor con tu forma de pensar, vivir y proyectarte.
          </p>

          <p className="text-lg text-foreground/70 leading-relaxed">
            Lo que vas a ver ahora no es un ranking de &ldquo;las mejores carreras&rdquo;. Es una selección de caminos que, según todo lo que analizamos, tienen sentido para quien sos hoy y quien podrías querer ser.
          </p>
        </div>

        <InsightCard
          quote="Cada carrera es una puerta a un tipo de vida diferente. No estás eligiendo solo qué estudiar, sino cómo vas a pasar tus días."
          variant="primary"
        />

        <div className="mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CTAButton onClick={onNext} size="large">
            Ver mis caminos
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Chapter: Career List
function ChapterLista({
  careers,
  onSelectCareer,
  onNavigateToUniversidades
}: {
  careers: Career[]
  onSelectCareer: (career: Career) => void
  onNavigateToUniversidades: () => void
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
        <div className="space-y-6 my-10 stagger-children">
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

        <div className="mt-12 p-6 rounded-2xl bg-secondary/30 border border-secondary">
          <p className="text-foreground mb-4">
            Cuando tengas una idea más clara de qué camino te interesa, podemos ver dónde podrías construirlo.
          </p>
          <CTAButton onClick={onNavigateToUniversidades} variant="secondary">
            Ver universidades
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Chapter: Career Detail
function ChapterDetalle({
  career,
  onBack,
  onNavigateToUniversidades
}: {
  career: Career
  onBack: () => void
  onNavigateToUniversidades: () => void
}) {
  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a los caminos</span>
        </button>

        {/* Hero */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {career.matchPercentage}% compatible
            </span>
            <span className="text-sm text-muted-foreground">{career.field}</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight mb-6">
            {career.name}
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            {career.definition.description}
          </p>
        </div>

        {/* Section 1: Why this appeared */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Por qué apareció este camino para vos
          </h2>

          <CareerFitBreakdown career={career} />
        </div>

        {/* Section 2: What life looks like */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Cómo se vive este camino
          </h2>

          <div className="p-6 rounded-2xl bg-muted/30 mb-6">
            <h3 className="font-medium text-foreground mb-3">El día a día</h3>
            <p className="text-muted-foreground leading-relaxed">
              {career.operative.dailyLoad}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Entorno típico</h4>
              <p className="text-foreground">{career.operative.environment}</p>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Nivel de incertidumbre</h4>
              <p className="text-foreground">{career.operative.uncertaintyLevel}</p>
            </div>
          </div>
        </div>

        {/* Section 3: What it asks of you */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué te pediría este camino
          </h2>

          <div className="grid gap-4 mb-6">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{career.academic.complexity}</h4>
                <p className="text-sm text-muted-foreground">nivel de complejidad conceptual</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{career.academic.weeklyHours} horas semanales</h4>
                <p className="text-sm text-muted-foreground">de dedicación promedio</p>
              </div>
            </div>
          </div>

          {/* Demand profile */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium text-foreground">Perfil de exigencia</h3>
            <ProgressBar
              value={career.academic.theoreticalPercentage}
              label="Carga teórica"
              color="primary"
            />
            <ProgressBar
              value={career.academic.practicalPercentage}
              label="Carga práctica"
              color="secondary"
            />
            <ProgressBar
              value={career.academic.presentialPercentage}
              label="Presencialidad"
              color="accent"
            />
          </div>

          {/* Filter subjects */}
          {career.academic.filterSubjects.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h4 className="font-medium text-amber-800">Filtros de retención</h4>
              </div>
              <p className="text-sm text-amber-700 mb-3">
                Estas materias suelen ser desafiantes y determinan si vas a poder avanzar:
              </p>
              <ul className="space-y-2">
                {career.academic.filterSubjects.map((subject, idx) => (
                  <li key={idx} className="text-sm text-amber-800">
                    <strong>{subject.name}</strong> — forja la capacidad de {subject.skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: Study Plan */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué vas a estudiar
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {career.academic.studyPlan.description}
          </p>

          <div className="space-y-4">
            {career.academic.studyPlan.distribution.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-foreground font-medium">{item.area}</span>
                  <span className="text-muted-foreground tabular-nums">{item.percentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", item.color)}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: What you get */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué te devuelve
          </h2>

          {/* Competencies */}
          <div className="mb-8">
            <h3 className="font-medium text-foreground mb-4">Competencias que desarrollás</h3>
            <div className="space-y-3">
              {career.competencies.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-accent/10 border border-accent/20"
                >
                  <p className="text-foreground font-medium text-sm">{comp.title}</p>
                  <p className="text-muted-foreground text-sm mt-1">{comp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Market */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Panorama laboral</h3>

            <div className="grid gap-4 mb-6">
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">Escalabilidad salarial</h4>
                </div>
                <p className="text-foreground">
                  {career.market.salaryScalability}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-card border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Salidas laborales principales</h4>
                <div className="space-y-3">
                  {career.market.jobOutlets.slice(0, 3).map((job, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{job.position}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{job.salarySenior}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automation risk */}
            <StatusIndicator
              status={career.market.automationRisk <= 25 ? "optimal" : career.market.automationRisk <= 50 ? "alert" : "neutral"}
              label={`Riesgo de automatización: ${career.market.automationRisk}%`}
              description="Qué tan probable es que este trabajo sea reemplazado por tecnología en los próximos años."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/10 text-center">
          <h3 className="text-xl font-serif text-foreground mb-4">
            Si este camino te hace sentido...
          </h3>
          <p className="text-muted-foreground mb-6">
            El siguiente paso es ver dónde podrías construirlo. Cada universidad ofrece una experiencia diferente del mismo camino.
          </p>
          <CTAButton onClick={onNavigateToUniversidades} size="large">
            Ver dónde estudiar esto
          </CTAButton>
        </div>
      </div>
    </section>
  )
}
