export interface RiasecScores {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface RiasecScoreData {
  scores: RiasecScores;
  primaryType: string;
  totalResponses: number;
}

type ResponseItem = {
  questionNumber?: number;
  question?: string;
  responseArray?: string[] | null;
};

const TYPE_LABEL_TO_KEY: Record<string, keyof RiasecScores> = {
  Realista: 'realistic',
  Investigador: 'investigative',
  Artístico: 'artistic',
  Social: 'social',
  Emprendedor: 'enterprising',
  Convencional: 'conventional',
};

export function calculateScore(responses: unknown): RiasecScoreData {
  const scores: RiasecScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  const arr: ResponseItem[] = Array.isArray(responses) ? (responses as ResponseItem[]) : [];

  for (const r of arr) {
    const items = Array.isArray(r.responseArray) ? r.responseArray : [];
    const q = r.question ?? '';
    for (const label of Object.keys(TYPE_LABEL_TO_KEY)) {
      if (q.includes(label)) {
        scores[TYPE_LABEL_TO_KEY[label]] += items.length;
        break;
      }
    }
  }

  const primaryType = Object.entries(scores).reduce((a, b) =>
    (a[1] as number) >= (b[1] as number) ? a : b
  )[0];

  return {
    scores,
    primaryType,
    totalResponses: arr.length,
  };
}
