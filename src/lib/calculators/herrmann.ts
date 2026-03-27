export interface HerrmannQuadrants {
  analytical: number;   // Blue - A quadrant
  practical: number;    // Green - B quadrant
  relational: number;   // Red - C quadrant
  experimental: number; // Yellow - D quadrant
}

export interface HerrmannScoreData {
  quadrants: HerrmannQuadrants;
  dominantQuadrant: string;
  totalResponses: number;
}

export function calculateScore(responses: Record<number, number>): HerrmannScoreData {
  const quadrants: HerrmannQuadrants = {
    analytical: 0,
    practical: 0,
    relational: 0,
    experimental: 0,
  };

  Object.entries(responses).forEach(([questionNum, score]) => {
    const qNum = parseInt(questionNum);
    if (qNum % 4 === 1) quadrants.analytical += score;
    else if (qNum % 4 === 2) quadrants.practical += score;
    else if (qNum % 4 === 3) quadrants.relational += score;
    else quadrants.experimental += score;
  });

  const dominantQuadrant = Object.entries(quadrants).reduce((a, b) =>
    quadrants[a[0] as keyof HerrmannQuadrants] >
    quadrants[b[0] as keyof HerrmannQuadrants]
      ? a
      : b
  )[0];

  return {
    quadrants,
    dominantQuadrant,
    totalResponses: Object.keys(responses).length,
  };
}
