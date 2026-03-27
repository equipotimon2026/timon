import { saveQuestionnaireResponse } from '@/app/actions/questionnaire';
import { getCalculatorForSection } from './calculators';

export interface QuestionnaireFormHelpers {
  saveFormData: (
    sectionId: number,
    responses: unknown,
    additionalMeta?: Record<string, unknown>,
    questions?: string[]
  ) => Promise<void>;
}

export function createFormHelpers(): QuestionnaireFormHelpers {
  const saveFormData = async (
    sectionId: number,
    responses: unknown,
    additionalMeta: Record<string, unknown> = {},
    questions?: string[]
  ) => {
    try {
      // Format responses based on type
      let formattedResponses: Array<{
        questionNumber: number;
        question?: string;
        responseBoolean?: boolean;
        responseInteger?: number;
        responseText?: string;
        responseArray?: string[];
      }> = [];

      if (Array.isArray(responses)) {
        // Already formatted
        formattedResponses = responses;
      } else if (typeof responses === 'object' && responses !== null) {
        // Convert object responses to array format
        formattedResponses = Object.entries(
          responses as Record<string, unknown>
        ).map(([key, value], index) => {
          const questionNumber = parseInt(key) + 1 || index + 1;
          const question = questions
            ? questions[parseInt(key)] || questions[index]
            : undefined;

          if (typeof value === 'boolean') {
            return { questionNumber, question, responseBoolean: value };
          } else if (typeof value === 'number') {
            return { questionNumber, question, responseInteger: value };
          } else if (typeof value === 'string') {
            return { questionNumber, question, responseText: value };
          } else if (Array.isArray(value)) {
            return { questionNumber, question, responseArray: value };
          } else {
            return {
              questionNumber,
              question,
              responseText: JSON.stringify(value),
            };
          }
        });
      }

      // Calculate scores using the appropriate calculator
      const calculator = getCalculatorForSection(sectionId);
      const scoreData = calculator.calculateScore(responses);

      await saveQuestionnaireResponse({
        sectionId,
        responses: formattedResponses,
        scoreData,
        meta: {
          completedAt: new Date().toISOString(),
          totalResponses: formattedResponses.length,
          ...additionalMeta,
        },
      });
    } catch (error) {
      console.error('Error saving questionnaire responses:', error);
      throw error;
    }
  };

  return {
    saveFormData,
  };
}

// Specific helpers for different response formats
export function formatMipsResponses(
  responses: Record<number, boolean>,
  questions?: string[]
) {
  return Object.entries(responses).map(([questionNum, response]) => ({
    questionNumber: parseInt(questionNum) + 1,
    question: questions ? questions[parseInt(questionNum)] : undefined,
    responseBoolean: response,
  }));
}

export function formatRiasecResponses(
  responses: Record<string, Record<string, unknown>>
) {
  const formatted: Array<{
    questionNumber: number;
    responseArray?: string[];
    responseText?: string;
  }> = [];
  let questionNumber = 1;

  Object.entries(responses).forEach(
    ([sectionName, sectionData]: [string, Record<string, unknown>]) => {
      Object.entries(sectionData).forEach(
        ([category, items]: [string, unknown]) => {
          if (Array.isArray(items)) {
            formatted.push({
              questionNumber: questionNumber++,
              responseArray: items,
              responseText: `${sectionName}-${category}`,
            });
          }
        }
      );
    }
  );

  return formatted;
}

export function formatHerrmannResponses(
  responses: Record<number, number>,
  questions?: string[]
) {
  return Object.entries(responses).map(([questionNum, score]) => ({
    questionNumber: parseInt(questionNum) + 1,
    question: questions ? questions[parseInt(questionNum)] : undefined,
    responseInteger: score,
  }));
}

export function formatGardnerResponses(
  responses: Record<number, number>,
  questions?: string[]
) {
  return Object.entries(responses).map(([questionNum, score]) => ({
    questionNumber: parseInt(questionNum) + 1,
    question: questions ? questions[parseInt(questionNum)] : undefined,
    responseInteger: score,
  }));
}

export function formatTextResponses(
  responses: Record<number, string>,
  questions?: string[]
) {
  return Object.entries(responses).map(([questionNum, text]) => ({
    questionNumber: parseInt(questionNum) + 1,
    question: questions ? questions[parseInt(questionNum)] : undefined,
    responseText: text,
  }));
}
