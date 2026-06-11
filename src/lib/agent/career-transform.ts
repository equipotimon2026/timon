import type { Career } from "@/lib/career-data"

export interface AgentCareerNew {
  id: string
  name: string
  field: string
  matchPercentage: number
  programSearchGroup?: string
  lifeGlimpse?: string
  detail: {
    professionDescription?: string
    matchSummary?: string
    whyMatch?: string[]
    challenges?: string[]
    professionalPaths?: Career["detail"]["professionalPaths"]
    academics?: Partial<Career["detail"]["academics"]>
  }
}

// Transform thin del contrato nuevo → modelo interno. Defaults defensivos en
// todos los campos anidados: un assessment de shape viejo (sin estos campos)
// degrada a vacío en vez de crashear el render.
export function transformCareer(c: AgentCareerNew): Career {
  const a = c.detail.academics
  return {
    id: String(c.id),
    name: c.name,
    field: c.field,
    matchPercentage: c.matchPercentage,
    programSearchGroup: c.programSearchGroup ?? null,
    lifeGlimpse: c.lifeGlimpse ?? "",
    detail: {
      professionDescription: c.detail.professionDescription ?? "",
      matchSummary: c.detail.matchSummary ?? "",
      whyMatch: c.detail.whyMatch ?? [],
      challenges: c.detail.challenges ?? [],
      professionalPaths: c.detail.professionalPaths ?? [],
      academics: {
        academicComposition: a?.academicComposition ?? "",
        subjectDistribution: a?.subjectDistribution ?? [],
        keySkills: a?.keySkills ?? [],
        alerts: {
          studyHoursLevel: a?.alerts?.studyHoursLevel ?? "media",
          durationYears: a?.alerts?.durationYears ?? null,
          workStudyCapacity: a?.alerts?.workStudyCapacity ?? "",
        },
      },
    },
  }
}
