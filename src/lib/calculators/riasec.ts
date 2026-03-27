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

export function calculateScore(responses: Record<number, number>): RiasecScoreData {
  const scores: RiasecScores = {
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0,
  };

  Object.entries(responses).forEach(([questionNum, score]) => {
    const qNum = parseInt(questionNum);
    if (qNum <= 10) scores.realistic += score;
    else if (qNum <= 20) scores.investigative += score;
    else if (qNum <= 30) scores.artistic += score;
    else if (qNum <= 40) scores.social += score;
    else if (qNum <= 50) scores.enterprising += score;
    else scores.conventional += score;
  });

  const primaryType = Object.entries(scores).reduce((a, b) =>
    scores[a[0] as keyof RiasecScores] > scores[b[0] as keyof RiasecScores]
      ? a
      : b
  )[0];

  return {
    scores,
    primaryType,
    totalResponses: Object.keys(responses).length,
  };
}
