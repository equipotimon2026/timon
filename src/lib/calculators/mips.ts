export interface MipsScoreData {
  trueResponses: number;
  falseResponses: number;
  totalResponses: number;
  completionRate: number;
  personalityProfile: {
    extroversion: 'high' | 'low';
  };
}

export function calculateScore(responses: Record<number, boolean>): MipsScoreData {
  const trueCount = Object.values(responses).filter(Boolean).length;
  const falseCount = Object.values(responses).filter((r) => r === false).length;
  const totalResponses = Object.keys(responses).length;

  return {
    trueResponses: trueCount,
    falseResponses: falseCount,
    totalResponses,
    completionRate: (totalResponses / 187) * 100, // MIPS has 187 questions
    personalityProfile: {
      extroversion: trueCount > falseCount ? 'high' : 'low',
    },
  };
}
