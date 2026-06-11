import type { Career } from "@/lib/career-data"

export interface AgentCareerNew {
  id: string
  name: string
  field: string
  matchPercentage: number
  programSearchGroup?: string
  lifeGlimpse?: string
  detail: {
    professionDescription: string
    matchSummary: string
    whyMatch?: string[]
    challenges?: string[]
    professionalPaths?: Career["detail"]["professionalPaths"]
    academics: Career["detail"]["academics"]
  }
}

export function transformCareer(c: AgentCareerNew): Career {
  return {
    id: String(c.id),
    name: c.name,
    field: c.field,
    matchPercentage: c.matchPercentage,
    programSearchGroup: c.programSearchGroup ?? null,
    lifeGlimpse: c.lifeGlimpse ?? "",
    detail: {
      professionDescription: c.detail.professionDescription,
      matchSummary: c.detail.matchSummary,
      whyMatch: c.detail.whyMatch ?? [],
      challenges: c.detail.challenges ?? [],
      professionalPaths: c.detail.professionalPaths ?? [],
      academics: c.detail.academics,
    },
  }
}
