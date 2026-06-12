"use client"

import { useState, useMemo } from "react"
import { University } from "@/lib/university-data"
import {
  ChapterHeader,
  InsightCard,
  CTAButton
} from "@/components/journey/narrative-blocks"
import { UniversityCard } from "@/components/journey/university-card"
import { ArrowLeft, MapPin, Building2, BookOpen, Award, Check, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActUniversidadesProps {
  universities: University[]
  currentChapter: string
  selectedUniversity: University | null
  selectedCareerName?: string | null
  onSelectUniversity: (university: University) => void
  onBack: () => void
  onNavigateToFuturo: () => void
}

export function ActUniversidades({
  universities,
  currentChapter,
  selectedUniversity,
  selectedCareerName = null,
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
            highlightCareer={selectedCareerName}
            onBack={onBack}
          />
        ) : (
          <ChapterFiltros
            universities={universities}
            onSelectUniversity={onSelectUniversity}
            onNavigateToFuturo={onNavigateToFuturo}
          />
        )
      case "unis-filtros":
      default:
        return (
          <ChapterFiltros
            universities={universities}
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
  onSelectUniversity,
  onNavigateToFuturo
}: {
  universities: University[]
  onSelectUniversity: (university: University) => void
  onNavigateToFuturo: () => void
}) {
  const uniqueLocations = useMemo(
    () => [...new Set(universities.map(u => u.detail.location.zone).filter((z): z is string => z !== null))],
    [universities]
  )

  const [filters, setFilters] = useState({
    type: "",
    modality: "",
    location: ""
  })

  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      if (filters.type && uni.type !== filters.type) return false
      if (filters.modality && uni.modality !== filters.modality) return false
      if (filters.location && uni.detail.location.zone !== filters.location) return false
      return true
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)
  }, [universities, filters])

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

          {/* Clear filters */}
          {(filters.type || filters.modality || filters.location) && (
            <button
              onClick={() => setFilters({ type: "", modality: "", location: "" })}
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
              onClick={() => setFilters({ type: "", modality: "", location: "" })}
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

// Scholarships as a scannable table: Beca | Beneficio, requirements on expand.
function ScholarshipsTable({
  scholarships,
}: {
  scholarships: University["detail"]["scholarships"]
}) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
      <div className="hidden sm:grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-muted/40 text-xs font-medium text-muted-foreground">
        <span>Beca</span>
        <span>Beneficio</span>
      </div>
      {scholarships.map((s, idx) => {
        const isOpen = open === idx
        const hasReq = !!s.requirements
        return (
          <div key={idx}>
            <button
              type="button"
              onClick={() => hasReq && setOpen(isOpen ? null : idx)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors",
                hasReq && "hover:bg-muted/30"
              )}
            >
              <span className="flex items-center gap-2 min-w-0">
                {hasReq && (
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                )}
                <span className="font-medium text-foreground">{s.name}</span>
              </span>
              <span className="text-sm font-semibold text-emerald-700 text-right shrink-0">
                {s.coverage}
              </span>
            </button>
            {isOpen && hasReq && (
              <div className="px-4 pb-4 sm:pl-10">
                <p className="text-sm text-muted-foreground leading-relaxed">
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

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim()

// "Programas que dicta": the career the user came from is pinned on top and
// flagged; the rest collapse behind a "+ otras N" toggle to cut visual noise.
function ProgramsList({
  programs,
  highlightCareer,
}: {
  programs: University["detail"]["programs"]
  highlightCareer?: string | null
}) {
  const [showAll, setShowAll] = useState(false)
  const target = highlightCareer ? normalize(highlightCareer) : null

  const isMatch = (name: string) => {
    if (!target) return false
    const n = normalize(name)
    return n.includes(target) || target.includes(n)
  }

  const sorted = useMemo(() => {
    if (!target) return programs
    return [...programs].sort(
      (a, b) => (isMatch(b.name) ? 1 : 0) - (isMatch(a.name) ? 1 : 0)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, target])

  const VISIBLE = 4
  const visible = showAll ? sorted : sorted.slice(0, VISIBLE)
  const hidden = sorted.length - visible.length

  return (
    <div className="space-y-3">
      {visible.map((program, idx) => {
        const matched = isMatch(program.name)
        return (
          <div
            key={idx}
            className={cn(
              "p-5 rounded-xl border",
              matched
                ? "bg-primary/5 border-primary/30"
                : "bg-card border-border/50"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium text-foreground">
                {program.name}
                {program.duration ? ` · ${program.duration}` : ""}
                {program.modality ? ` · ${program.modality}` : ""}
              </h4>
              {matched && (
                <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  ⭐ Tu carrera
                </span>
              )}
            </div>
          </div>
        )
      })}

      {hidden > 0 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          + otras {hidden} {hidden === 1 ? "carrera" : "carreras"} del área
        </button>
      )}
      {showAll && sorted.length > VISIBLE && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver menos
        </button>
      )}
    </div>
  )
}

// Chapter: University Detail
function ChapterDetalle({
  university,
  highlightCareer,
  onBack
}: {
  university: University
  highlightCareer?: string | null
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

          {detail.matchSummary && (
            <InsightCard
              quote={detail.matchSummary}
              variant="primary"
            />
          )}
        </div>

        {/* Section: Programs */}
        {detail.programs.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-serif text-foreground mb-1">
              Carreras de tu área que se dictan acá
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Programas afines a tu perfil que ofrece esta universidad.
            </p>

            <ProgramsList programs={detail.programs} highlightCareer={highlightCareer} />
          </div>
        )}

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
