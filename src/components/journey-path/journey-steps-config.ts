import type { JourneyStepData } from "./types"

/**
 * Maps current assessment section slugs to journey path steps
 * with colors and metadata from the V0 prototype.
 *
 * Order follows the V0 dashboard path (13 modules).
 * Modules without existing forms get assessmentSlug: null.
 */
export interface JourneyStepConfig {
  id: string
  order: number
  title: string
  subtitle: string
  /** Slug used in /assessment/[id] route. null = no form yet */
  assessmentSlug: string | null
  /** Supabase section_id if exists. null = new module */
  sectionId: number | null
  color: {
    accent: string
    bg: string
    glow: string
  }
}

export const JOURNEY_STEPS_CONFIG: JourneyStepConfig[] = [
  {
    id: "vibecheck",
    order: 1,
    title: "¿Con quién te sentís identificado?",
    subtitle: "Conocé experiencias de personas en tu misma situación.",
    assessmentSlug: "vibecheck",
    sectionId: 13,
    color: { accent: "#10B981", bg: "#ECFDF5", glow: "rgba(16,185,129,.15)" },
  },
  {
    id: "voscolegio",
    order: 2,
    title: "Vos y el colegio",
    subtitle: "Tu historia dentro del sistema educativo.",
    assessmentSlug: "voscolegio",
    sectionId: 14,
    color: { accent: "#F59E0B", bg: "#FFFBEB", glow: "rgba(245,158,11,.15)" },
  },
  {
    id: "familia",
    order: 3,
    title: "Contexto Familiar",
    subtitle: "Tu árbol familiar y el entorno que te formó.",
    assessmentSlug: "arbol-genealogico",
    sectionId: 11,
    color: { accent: "#EC4899", bg: "#FDF2F8", glow: "rgba(236,72,153,.15)" },
  },
  {
    id: "padres",
    order: 4,
    title: "Perspectiva Familiar",
    subtitle: "Para que lo complete un padre, tutor o familiar cercano.",
    assessmentSlug: "padres",
    sectionId: 15,
    color: { accent: "#D97706", bg: "#FFFBEB", glow: "rgba(217,119,6,.15)" },
  },
  {
    id: "dominancia",
    order: 5,
    title: "Dominancia",
    subtitle: "Cómo pensás, aprendés y tomás decisiones.",
    assessmentSlug: "herrmann",
    sectionId: 4,
    color: { accent: "#6366F1", bg: "#EEF2FF", glow: "rgba(99,102,241,.15)" },
  },
  {
    id: "riasec",
    order: 6,
    title: "RIASEC Holland",
    subtitle: "Tu perfil vocacional con el test de Holland.",
    assessmentSlug: "riasec",
    sectionId: 3,
    color: { accent: "#0EA5E9", bg: "#E0F2FE", glow: "rgba(14,165,233,.15)" },
  },
  {
    id: "termometro",
    order: 7,
    title: "Inteligencias Múltiples",
    subtitle: "¿En qué sos brillante sin saberlo?",
    assessmentSlug: "gardner",
    sectionId: 5,
    color: { accent: "#D97706", bg: "#FEF3C7", glow: "rgba(217,119,6,.15)" },
  },
  {
    id: "charla1",
    order: 8,
    title: "Chatiemos · Parte 1",
    subtitle: "Preguntas de personalidad con opciones.",
    assessmentSlug: "mips",
    sectionId: 2,
    color: { accent: "#4361EE", bg: "#EEF2FF", glow: "rgba(67,97,238,.15)" },
  },
  {
    id: "charla2",
    order: 9,
    title: "Chatiemos · Parte 2",
    subtitle: "Preguntas abiertas para desarrollar.",
    assessmentSlug: "proyectivas",
    sectionId: 6,
    color: { accent: "#7C3AED", bg: "#F5F3FF", glow: "rgba(124,58,237,.15)" },
  },
  {
    id: "autobiografia",
    order: 10,
    title: "Autobiografía",
    subtitle: "Tu historia en tus palabras.",
    assessmentSlug: "autodescubrimiento",
    sectionId: 7,
    color: { accent: "#E11D48", bg: "#FFF1F2", glow: "rgba(225,29,72,.15)" },
  },
  {
    id: "estilovida",
    order: 11,
    title: "Estilo de Vida",
    subtitle: "Cómo te imaginás tu vida laboral ideal.",
    assessmentSlug: "estilo-vida",
    sectionId: 9,
    color: { accent: "#2563EB", bg: "#EFF6FF", glow: "rgba(37,99,235,.15)" },
  },
  {
    id: "profesionales",
    order: 12,
    title: "Hablemos con Profesionales",
    subtitle: "Charlas con profesionales de distintas áreas.",
    assessmentSlug: "profesionales",
    sectionId: 16,
    color: { accent: "#9333EA", bg: "#FAF5FF", glow: "rgba(147,51,234,.15)" },
  },
  {
    id: "universidad",
    order: 13,
    title: "Universidad",
    subtitle: "Tus preferencias para elegir universidad.",
    assessmentSlug: "universidad",
    sectionId: 12,
    color: { accent: "#059669", bg: "#ECFDF5", glow: "rgba(5,150,105,.15)" },
  },
]

/** Section IDs that have existing forms (for status calculation) */
const SECTION_ID_TO_STEP = new Map(
  JOURNEY_STEPS_CONFIG
    .filter((s) => s.sectionId !== null)
    .map((s) => [s.sectionId!, s.id])
)

/**
 * Build JourneyStepData[] from config + completed section IDs.
 * First incomplete step → "current", completed → "done",
 * steps without forms yet → "active" (Pendiente), rest → "active".
 */
export function buildJourneySteps(
  completedSectionIds: number[],
  onNavigate: (slug: string) => void
): JourneyStepData[] {
  const completedSet = new Set(completedSectionIds)
  let foundCurrent = false

  return JOURNEY_STEPS_CONFIG.map((config) => {
    const isDone = config.sectionId !== null && completedSet.has(config.sectionId)
    const hasForm = config.assessmentSlug !== null

    let status: JourneyStepData["status"]
    if (isDone) {
      status = "done"
    } else if (!foundCurrent) {
      status = "current"
      foundCurrent = true
    } else {
      status = "active"
    }

    return {
      id: config.id,
      order: config.order,
      title: config.title,
      subtitle: config.subtitle,
      status,
      color: config.color,
      onClick: hasForm
        ? () => onNavigate(config.assessmentSlug!)
        : undefined,
    }
  })
}

/** Calculate completion percentage: done steps / ALL steps (13 total) */
export function calcCompletionPercent(completedSectionIds: number[]): number {
  const completedSet = new Set(completedSectionIds)
  const total = JOURNEY_STEPS_CONFIG.length
  const done = JOURNEY_STEPS_CONFIG.filter(
    (s) => s.sectionId !== null && completedSet.has(s.sectionId)
  ).length
  return Math.round((done / total) * 100)
}
