import type { University } from "@/lib/university-data"

export interface AgentUniversity {
  id: string
  name: string
  type: string
  modality?: string
  matchPercentage: number
  glimpse?: string
  detail: {
    matchReasons?: Array<{ positive: boolean; text: string }>
    matchSummary?: string
    prestige?: Partial<University["detail"]["prestige"]>
    values?: { description?: string | null; distribution?: Array<{ area: string; percentage: number }> }
    costs?: Partial<University["detail"]["costs"]>
    scholarships?: University["detail"]["scholarships"]
    programs?: University["detail"]["programs"]
    location?: Partial<University["detail"]["location"]>
  }
}

export interface AgentUniversities {
  intro?: string
  ranking?: AgentUniversity[]
  rankingBySearchTerm?: Array<{ programSearchGroup: string; ranking: AgentUniversity[] }>
}

export function transformUniversity(u: AgentUniversity): University {
  return {
    id: String(u.id),
    name: u.name,
    type: u.type,
    modality: u.modality ?? "",
    matchPercentage: u.matchPercentage,
    glimpse: u.glimpse ?? "",
    detail: {
      matchReasons: u.detail.matchReasons ?? [],
      matchSummary: u.detail.matchSummary ?? "",
      prestige: {
        ranking: u.detail.prestige?.ranking ?? null,
        academicQuality: u.detail.prestige?.academicQuality ?? null,
        employability: u.detail.prestige?.employability ?? null,
        marketReputation: u.detail.prestige?.marketReputation ?? null
      },
      values: {
        description: u.detail.values?.description ?? null,
        distribution: u.detail.values?.distribution ?? []
      },
      costs: {
        monthlyFee: u.detail.costs?.monthlyFee ?? null,
        enrollmentFee: u.detail.costs?.enrollmentFee ?? null,
        annualEstimate: u.detail.costs?.annualEstimate ?? null
      },
      scholarships: u.detail.scholarships ?? [],
      programs: u.detail.programs ?? [],
      location: {
        address: u.detail.location?.address ?? null,
        zone: u.detail.location?.zone ?? null,
        transport: u.detail.location?.transport ?? null,
        campusInfo: u.detail.location?.campusInfo ?? null
      }
    }
  }
}

export function transformUniversities(data: AgentUniversities | undefined): University[] {
  return (data?.ranking ?? []).map(transformUniversity)
}
