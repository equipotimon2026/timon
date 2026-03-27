export interface VakStyles {
  visual: number;
  auditory: number;
  kinesthetic: number;
}

export interface VakScoreData {
  styles: VakStyles;
  predominantStyle: string;
  totalResponses: number;
}

export function calculateScore(responses: Record<number, string | number>): VakScoreData {
  const styles: VakStyles = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
  };

  Object.entries(responses).forEach(([questionNum]) => {
    const qNum = parseInt(questionNum);
    if (qNum % 3 === 1) styles.visual += 1;
    else if (qNum % 3 === 2) styles.auditory += 1;
    else styles.kinesthetic += 1;
  });

  const predominantStyle = Object.entries(styles).reduce((a, b) =>
    styles[a[0] as keyof VakStyles] > styles[b[0] as keyof VakStyles] ? a : b
  )[0];

  return {
    styles,
    predominantStyle,
    totalResponses: Object.keys(responses).length,
  };
}
