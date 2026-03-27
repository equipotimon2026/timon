export interface TextBasedScoreData {
  responsesProvided: number;
  completionRate: number;
}

export function calculateScore(responses: Record<number, string>): TextBasedScoreData {
  return {
    responsesProvided: Object.keys(responses).length,
    completionRate: 100,
  };
}
