import type { Quizz, Question } from '../types';

export function decodeQuizFromUrl(): Quizz | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const encodedQuiz = urlParams.get('q');

  if (!encodedQuiz) return null;

  try {
    const decoded = atob(encodedQuiz);
    const quiz = JSON.parse(decoded) as Quizz;
    return quiz;
  } catch (error) {
    console.error('Failed to decode quiz from URL:', error);
    return null;
  }
}

export function encodeQuizToUrl(quiz: Quizz): string {
  const encoded = btoa(JSON.stringify(quiz));
  return `${window.location.origin}${window.location.pathname}?q=${encoded}`;
}

export function calculateScore(
  question: Question,
  isCorrect: boolean,
  responseTime: number,
  totalTime: number
): number {
  if (!isCorrect) return 0;

  const basePoints = question.points || 100;

  if (!question.duration && !totalTime) return basePoints;

  const maxTime = question.duration || totalTime || 30;
  const timeRatio = Math.max(0, 1 - (responseTime / maxTime));

  return Math.round(basePoints * (0.5 + 0.5 * timeRatio));
}

export function formatResults(
  quizTitle: string,
  totalScore: number,
  maxScore: number,
  correctAnswers: number,
  totalQuestions: number
): string {
  const percentage = Math.round((totalScore / maxScore) * 100);

  return `🧠 Quiz Results: ${quizTitle}

📊 Score: ${totalScore}/${maxScore} points (${percentage}%)
✅ Correct answers: ${correctAnswers}/${totalQuestions}

#quiz #results`;
}

export function isAnswerCorrect(question: Question, userAnswer: any): boolean {
  switch (question.type) {
    case 'true-false':
      return question.answer === userAnswer;
    case 'single-choice':
      return question.answer === userAnswer;
    case 'multiple-choice':
      if (!Array.isArray(userAnswer)) return false;
      return JSON.stringify(question.answer.sort()) === JSON.stringify(userAnswer.sort());
    default:
      return false;
  }
}