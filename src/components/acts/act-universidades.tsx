"use client"

import { useState, useMemo } from "react"
import { University } from "@/lib/university-data"
import { Career } from "@/lib/career-data"
import {
  ChapterHeader,
  TransitionBlock,
  InsightCard,
  ProseBlock,
  ProgressBar,
  CTAButton,
  StatusIndicator
} from "@/components/journey/narrative-blocks"
import { UniversityCard } from "@/components/journey/university-card"
import { ArrowLeft, ExternalLink, MapPin, DollarSign, Clock, Building2, BookOpen, Award, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActUniversidadesProps {
  universities: University[]
  careers: Career[]
  currentChapter: string
  selectedUniversity: University | null
  onSelectUniversity: (university: University) => void
  onBack: () => void
  onNextChapter: () => void
  onNavigateToFuturo: () => void
}

export function ActUniversidades({
  universities,
  careers,
  currentChapter,
  selectedUniversity,
  onSelectUniversity,
  onBack,
  onNextChapter,
  onNavigateToFuturo
}: ActUniversidadesProps) {

  const renderChapter = () => {
    switch (currentChapter) {
      case "unis-intro":
        return <ChapterIntro onNext={onNextChapter} />
      case "unis-filtros":
        return (
          <ChapterFiltros
            universities={universities}
            careers={careers}
            onSelectUniversity={onSelectUniversity}
            onNavigateToFuturo={onNavigateToFuturo}
          />
        )
      case "unis-detalle":
        return selectedUniversity ? (
          <ChapterDetalle
            university={selectedUniversity}
            onBack={onBack}
          />
        ) : (
          <ChapterFiltros
            universities={universities}
            careers={careers}
            onSelectUniversity={onSelectUniversity}
            onNavigateToFuturo={onNavigateToFuturo}
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

// Chapter: Introduction
function ChapterIntro({ onNext }: { onNext: () => void }) {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12">
      <div className="max-w-2xl mx-auto w-full">
        <div className="animate-fade-in-up">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-6">
            Acto 03 — Dónde construir
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground leading-tight mb-8">
            El mismo camino, distintas experiencias
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed mb-6">
            Elegir universidad no es solo elegir prestigio. Es elegir una experiencia, un entorno, un estilo de vida durante varios años de tu vida.
          </p>

          <p className="text-lg text-foreground/70 leading-relaxed">
            Dos personas pueden estudiar la misma carrera y tener experiencias completamente diferentes según dónde la estudien. Ahora vamos a ver qué opciones hacen más sentido para vos.
          </p>
        </div>

        <TransitionBlock variant="highlight">
          La universidad ideal no existe. Pero sí existe la que mejor se adapta a tu situación, tus prioridades y tu forma de aprender.
        </TransitionBlock>

        <div className="mt-8">
          <CTAButton onClick={onNext}>
            Encontrar tu lugar
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Chapter: Filters & List
function ChapterFiltros({
  universities,
  careers,
  onSelectUniversity,
  onNavigateToFuturo
}: {
  universities: University[]
  careers: Career[]
  onSelectUniversity: (university: University) => void
  onNavigateToFuturo: () => void
}) {
  const [filters, setFilters] = useState({
    career: "",
    type: "",
    modality: "",
    religious: "",
    location: ""
  })

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      if (filters.career && uni.careerOffered !== filters.career) return false
      if (filters.type && uni.type !== filters.type) return false
      if (filters.modality && uni.modality !== filters.modality) return false
      if (filters.religious === "Sí" && !uni.religious) return false
      if (filters.religious === "No" && uni.religious) return false
      if (filters.location && uni.location.zone !== filters.location) return false
      return true
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)
  }, [universities, filters])

  const uniqueCareers = [...new Set(universities.map(u => u.careerOffered))]
  const uniqueLocations = [...new Set(universities.map(u => u.location.zone))]

  return (
    <section className="px-6 md:px-12 lg:px-16 py-12 lg:py-16">
      <div className="max-w-3xl mx-auto">
        <ChapterHeader
          number="01"
          title="Encontrá tu lugar"
          subtitle="Filtrá según lo que es importante para vos"
        />

        {/* Filters */}
        <div className="mb-10 p-6 rounded-2xl bg-card border border-border/50">
          <h3 className="font-medium text-foreground mb-4">Filtros</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Career filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Carrera</label>
              <select
                value={filters.career}
                onChange={(e) => setFilters(f => ({ ...f, career: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas</option>
                {uniqueCareers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas</option>
                <option value="Pública">Pública</option>
                <option value="Privada">Privada</option>
              </select>
            </div>

            {/* Modality filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Modalidad</label>
              <select
                value={filters.modality}
                onChange={(e) => setFilters(f => ({ ...f, modality: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>

            {/* Religious filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Religiosa</label>
              <select
                value={filters.religious}
                onChange={(e) => setFilters(f => ({ ...f, religious: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Indistinto</option>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Location filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Ubicación</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear filters */}
          {Object.values(filters).some(v => v !== "") && (
            <button
              onClick={() => setFilters({ career: "", type: "", modality: "", religious: "", location: "" })}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredUniversities.length} {filteredUniversities.length === 1 ? 'universidad' : 'universidades'}
          </p>
        </div>

        {/* University Cards */}
        <div className="space-y-6 stagger-children">
          {filteredUniversities.slice(0, 5).map((university, idx) => (
            <UniversityCard
              key={university.id}
              university={university}
              rank={idx + 1}
              onSelect={() => onSelectUniversity(university)}
            />
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No encontramos universidades con esos filtros.</p>
            <button
              onClick={() => setFilters({ career: "", type: "", modality: "", religious: "", location: "" })}
              className="mt-2 text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* CTA to continue to Futuro */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 text-center">
          <h3 className="text-xl font-serif text-foreground mb-4">
            Ya exploraste tus opciones
          </h3>
          <p className="text-muted-foreground mb-6">
            Ahora veamos cómo sería tu vida en cada camino que elegiste. Te mostramos escenas reales de tu futuro.
          </p>
          <CTAButton onClick={onNavigateToFuturo}>
            Ver mi futuro
          </CTAButton>
        </div>
      </div>
    </section>
  )
}

// Chapter: University Detail
function ChapterDetalle({
  university,
  onBack
}: {
  university: University
  onBack: () => void
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
          <span>Volver a universidades</span>
        </button>

        {/* Hero */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              university.type === "Pública"
                ? "bg-accent/30 text-accent-foreground"
                : "bg-secondary text-secondary-foreground"
            )}>
              {university.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {university.matchPercentage}% compatible
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-foreground leading-tight mb-4">
            {university.name}
          </h1>

          <p className="text-lg text-muted-foreground">
            {university.careerOffered} · {university.modality}
          </p>
        </div>

        {/* Section 1: Match reasons */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Por qué es {university.matchPercentage >= 80 ? '' : 'o no '}un buen match para vos
          </h2>

          <div className="space-y-3">
            {university.compatibility.reasons.map((reason, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-4 p-5 rounded-xl border",
                  reason.positive
                    ? "bg-accent/10 border-accent/30"
                    : "bg-muted/50 border-border/50"
                )}
              >
                {reason.positive ? (
                  <Check className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <p className={cn(
                  "text-sm leading-relaxed",
                  reason.positive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {reason.text}
                </p>
              </div>
            ))}
          </div>

          <InsightCard
            quote={university.compatibility.summary}
            variant="primary"
          />
        </div>

        {/* Section 2: Experience */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué experiencia te ofrece
          </h2>

          {/* Prestige & Quality */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-muted-foreground">Ranking nacional</h4>
              </div>
              <p className="text-2xl font-light text-foreground">{university.prestige.ranking}</p>
            </div>

            <div className="p-5 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-medium text-muted-foreground">Calidad académica</h4>
              </div>
              <p className="text-foreground">{university.prestige.academicQuality}</p>
            </div>
          </div>

          <div className="space-y-4">
            <ProgressBar
              value={university.prestige.employability}
              label="Empleabilidad de egresados"
              color="primary"
            />
            <ProgressBar
              value={university.prestige.marketReputation}
              label="Reputación en el mercado"
              color="secondary"
            />
          </div>
        </div>

        {/* Section 3: Daily life */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué implica en tu día a día
          </h2>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{university.location.address}</h4>
                <p className="text-sm text-muted-foreground mt-1">{university.location.zone}</p>
                <p className="text-sm text-muted-foreground">{university.location.transport}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <Clock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{university.studyPlan.duration}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {university.studyPlan.totalCredits} créditos · {university.studyPlan.practiceHours} horas de práctica
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{university.modality}</h4>
                <p className="text-sm text-muted-foreground mt-1">{university.location.campusInfo}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Investment */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Inversión
          </h2>

          <div className="p-6 rounded-2xl bg-muted/30 mb-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cuota mensual</p>
                <p className="text-2xl font-light text-foreground">{university.investment.monthlyFee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matrícula</p>
                <p className="text-lg text-foreground">{university.investment.enrollmentFee}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimado anual</p>
                <p className="text-lg text-foreground">{university.investment.annualEstimate}</p>
              </div>
            </div>
            {university.investment.paymentOptions && (
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50">
                {university.investment.paymentOptions}
              </p>
            )}
          </div>

          {/* Scholarships */}
          {university.scholarships.length > 0 && (
            <div>
              <h3 className="font-medium text-foreground mb-4">Becas y accesos especiales</h3>
              <div className="space-y-3">
                {university.scholarships.map((scholarship, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{scholarship.name}</h4>
                      <span className="text-sm text-accent-foreground font-medium">
                        {scholarship.coverage}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{scholarship.requirements}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Valores y enfoque institucional
          </h2>

          <p className="text-muted-foreground leading-relaxed mb-6">
            {university.values.description}
          </p>

          <div className="space-y-4">
            {university.values.distribution.map((item, idx) => (
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

        {/* CTA: Website */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/10 border border-primary/10 text-center">
          <h3 className="text-xl font-serif text-foreground mb-4">
            Seguí investigando
          </h3>
          <p className="text-muted-foreground mb-6">
            Visitá el sitio oficial de la universidad para ver más detalles sobre programas, inscripción y vida estudiantil.
          </p>
          <a
            href={university.studyPlan.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Visitar sitio oficial
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
