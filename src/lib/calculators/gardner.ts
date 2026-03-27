export interface GardnerIntelligences {
  linguistic: number;
  logicalMathematical: number;
  spatial: number;
  musical: number;
  bodilyKinesthetic: number;
  interpersonal: number;
  intrapersonal: number;
  naturalistic: number;
}

export interface GardnerScoreData {
  intelligences: GardnerIntelligences;
  strongestIntelligence: string;
  totalResponses: number;
}

export function calculateScore(responses: Record<number, number>): GardnerScoreData {
  const intelligences: GardnerIntelligences = {
    linguistic: 0,
    logicalMathematical: 0,
    spatial: 0,
    musical: 0,
    bodilyKinesthetic: 0,
    interpersonal: 0,
    intrapersonal: 0,
    naturalistic: 0,
  };

  const keys = Object.keys(intelligences) as (keyof GardnerIntelligences)[];

  Object.entries(responses).forEach(([questionNum, score]) => {
    const qNum = parseInt(questionNum);
    const intelligenceIndex = qNum % 8;
    intelligences[keys[intelligenceIndex]] += score;
  });

  const strongestIntelligence = Object.entries(intelligences).reduce((a, b) =>
    intelligences[a[0] as keyof GardnerIntelligences] >
    intelligences[b[0] as keyof GardnerIntelligences]
      ? a
      : b
  )[0];

  return {
    intelligences,
    strongestIntelligence,
    totalResponses: Object.keys(responses).length,
  };
}
