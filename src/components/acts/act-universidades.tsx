"use client"

import { useState, useMemo } from "react"
import { University } from "@/lib/university-data"
import { Career } from "@/lib/career-data"
import {
  ChapterHeader,
  CTAButton
} from "@/components/journey/narrative-blocks"
import { UniversityCard } from "@/components/journey/university-card"
import { ArrowLeft, MapPin, Building2, BookOpen, Award, Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActUniversidadesProps {
  universities: University[]
  /** Per-career rankings keyed by programSearchGroup (for the "Carrera" filter). */
  universitiesByGroup?: Record<string, University[]>
  /** The user's matched careers, used to label the "Carrera" filter options. */
  careers?: Career[]
  /** programSearchGroup of the career the user came from (preselects the filter). */
  defaultCareerGroup?: string | null
  currentChapter: string
  selectedUniversity: University | null
  onSelectUniversity: (university: University) => void
  onBack: () => void
  onNavigateToFuturo: () => void
}

export function ActUniversidades({
  universities,
  universitiesByGroup = {},
  careers = [],
  defaultCareerGroup = null,
  currentChapter,
  selectedUniversity,
  onSelectUniversity,
  onBack,
  onNavigateToFuturo
}: ActUniversidadesProps) {

  const renderChapter = () => {
    switch (currentChapter) {
      case "unis-detalle":
        return selectedUniversity ? (
          <ChapterDetalle
            university={selectedUniversity}
            onBack={onBack}
          />
        ) : (
          <ChapterFiltros
            universities={universities}
            universitiesByGroup={universitiesByGroup}
            careers={careers}
            defaultCareerGroup={defaultCareerGroup}
            onSelectUniversity={onSelectUniversity}
            onNavigateToFuturo={onNavigateToFuturo}
          />
        )
      case "unis-filtros":
      default:
        return (
          <ChapterFiltros
            universities={universities}
            universitiesByGroup={universitiesByGroup}
            careers={careers}
            defaultCareerGroup={defaultCareerGroup}
            onSelectUniversity={onSelectUniversity}
            onNavigateToFuturo={onNavigateToFuturo}
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

// Chapter: Filters & List
function ChapterFiltros({
  universities,
  universitiesByGroup,
  careers,
  defaultCareerGroup,
  onSelectUniversity,
  onNavigateToFuturo
}: {
  universities: University[]
  universitiesByGroup: Record<string, University[]>
  careers: Career[]
  defaultCareerGroup: string | null
  onSelectUniversity: (university: University) => void
  onNavigateToFuturo: () => void
}) {
  // Career filter options: only the user's careers we actually have a uni
  // ranking for (programSearchGroup present in universitiesByGroup).
  const careerOptions = useMemo(
    () =>
      careers
        .filter((c) => c.programSearchGroup && universitiesByGroup[c.programSearchGroup]?.length)
        .map((c) => ({ group: c.programSearchGroup as string, label: c.name })),
    [careers, universitiesByGroup]
  )
  const hasCareerFilter = careerOptions.length > 0

  // Preselect the career the user came from (if we have its ranking), else "all".
  const initialCareer =
    defaultCareerGroup && universitiesByGroup[defaultCareerGroup]?.length
      ? defaultCareerGroup
      : ""

  const [filters, setFilters] = useState({
    career: initialCareer,
    type: "",
    modality: "",
    location: ""
  })

  // Base list depends on the selected career: its dedicated ranking, or the flat
  // list when "Todas" (or when no grouped data is available).
  const baseList =
    filters.career && universitiesByGroup[filters.career]
      ? universitiesByGroup[filters.career]
      : universities

  const uniqueLocations = useMemo(
    () => [...new Set(baseList.map(u => u.detail.location.zone).filter((z): z is string => z !== null))],
    [baseList]
  )

  const filteredUniversities = useMemo(() => {
    return baseList.filter(uni => {
      if (filters.type && uni.type !== filters.type) return false
      if (filters.modality && uni.modality !== filters.modality) return false
      if (filters.location && uni.detail.location.zone !== filters.location) return false
      return true
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)
  }, [baseList, filters])

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

          {/* Carrera filter — scopes the list to one career's universities */}
          {hasCareerFilter && (
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">Carrera</label>
              <select
                value={filters.career}
                onChange={(e) => setFilters(f => ({ ...f, career: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas las carreras</option>
                {careerOptions.map(opt => (
                  <option key={opt.group} value={opt.group}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Cuota filter (Pública/Privada → cuota o no) */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Cuota</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todas</option>
                <option value="Pública">Sin cuota (pública)</option>
                <option value="Privada">Con cuota (privada)</option>
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
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
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

          {/* Clear filters (keeps the selected career scope) */}
          {(filters.type || filters.modality || filters.location) && (
            <button
              onClick={() => setFilters(f => ({ ...f, type: "", modality: "", location: "" }))}
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
          {filteredUniversities.slice(0, 8).map((university, idx) => (
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
              onClick={() => setFilters(f => ({ ...f, type: "", modality: "", location: "" }))}
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

const fallbackColors = [
  "bg-indigo-600",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-rose-500"
]

// Scholarships as scannable cards: name + benefit (coverage) on its own line,
// requisitos behind an expand toggle. Coverage is a full sentence (not a short
// chip), so stacking it under the name avoids the cramped/overlapping layout.
function ScholarshipsTable({
  scholarships,
}: {
  scholarships: University["detail"]["scholarships"]
}) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {scholarships.map((s, idx) => {
        const isOpen = open === idx
        const hasReq = !!s.requirements
        return (
          <div
            key={idx}
            className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => hasReq && setOpen(isOpen ? null : idx)}
              className={cn(
                "w-full text-left p-4 flex items-start gap-3",
                hasReq && "hover:bg-emerald-100/50 transition-colors"
              )}
            >
              {hasReq ? (
                <ChevronDown
                  className={cn(
                    "w-4 h-4 mt-0.5 shrink-0 text-emerald-700 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-emerald-900">{s.name}</h4>
                {s.coverage && (
                  <p className="text-sm font-medium text-emerald-700 mt-0.5 leading-relaxed">
                    {s.coverage}
                  </p>
                )}
              </div>
            </button>
            {isOpen && hasReq && (
              <div className="px-4 pb-4 pl-11">
                <p className="text-sm text-emerald-900/80 leading-relaxed">
                  {s.requirements}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
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
  const { detail } = university

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
            {university.modality}
          </p>

          {university.glimpse && (
            <p className="mt-4 text-base text-foreground/70 leading-relaxed">
              {university.glimpse}
            </p>
          )}
        </div>

        {/* Section: Match reasons */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Por qué es {university.matchPercentage >= 80 ? '' : 'o no '}un buen match para vos
          </h2>

          <div className="space-y-3">
            {detail.matchReasons.map((reason, idx) => (
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

        </div>

        {/* Section: Experience */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué experiencia te ofrece
          </h2>

          {/* Prestige & Quality */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {detail.prestige.ranking && (
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">Ranking nacional</h4>
                </div>
                <p className="text-2xl font-light text-foreground">{detail.prestige.ranking}</p>
              </div>
            )}

            {detail.prestige.academicQuality && (
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-medium text-muted-foreground">Calidad académica</h4>
                </div>
                <p className="text-foreground">{detail.prestige.academicQuality}</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {detail.prestige.employability && (
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Empleabilidad de egresados</h4>
                <p className="text-foreground">{detail.prestige.employability}</p>
              </div>
            )}

            {detail.prestige.marketReputation && (
              <div className="p-5 rounded-xl bg-card border border-border/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Reputación en el mercado</h4>
                <p className="text-foreground">{detail.prestige.marketReputation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Section: Daily life / Location */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Qué implica en tu día a día
          </h2>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                {detail.location.address && (
                  <h4 className="font-medium text-foreground">{detail.location.address}</h4>
                )}
                {detail.location.zone && (
                  <p className="text-sm text-muted-foreground mt-1">{detail.location.zone}</p>
                )}
                {detail.location.transport && (
                  <p className="text-sm text-muted-foreground">{detail.location.transport}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/30">
              <Building2 className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground">{university.modality}</h4>
                {detail.location.campusInfo && (
                  <p className="text-sm text-muted-foreground mt-1">{detail.location.campusInfo}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Investment */}
        <div className="mb-16">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Inversión
          </h2>

          <div className="p-6 rounded-2xl bg-muted/30 mb-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Cuota mensual</p>
                <p className="text-2xl font-light text-foreground">{detail.costs.monthlyFee ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matrícula</p>
                <p className="text-lg text-foreground">{detail.costs.enrollmentFee ?? "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimado anual</p>
                <p className="text-lg text-foreground">{detail.costs.annualEstimate ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Scholarships */}
          {detail.scholarships.length > 0 && (
            <div>
              <h3 className="font-medium text-foreground mb-4">Becas y accesos especiales</h3>
              <ScholarshipsTable scholarships={detail.scholarships} />
            </div>
          )}
        </div>

        {/* Section: Values */}
        {(detail.values.description || detail.values.distribution.length > 0) && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-foreground mb-6">
              Valores y enfoque institucional
            </h2>

            {detail.values.description && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {detail.values.description}
              </p>
            )}

            <div className="space-y-4">
              {detail.values.distribution.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-foreground font-medium">{item.area}</span>
                    <span className="text-muted-foreground tabular-nums">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", fallbackColors[idx % fallbackColors.length])}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
