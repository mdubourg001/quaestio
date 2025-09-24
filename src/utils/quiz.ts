import type { Quizz, Question } from "../types";
import { Base64 } from "./b64";

export function decodeQuizFromUrl(): Quizz | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const encodedQuiz = urlParams.get("q");

  if (!encodedQuiz) return null;

  try {
    const decoded = Base64.decode(encodedQuiz);
    const quiz = JSON.parse(decoded) as Quizz;
    return quiz;
  } catch (error) {
    console.error("Failed to decode quiz from URL:", error);
    return null;
  }
}

export function encodeQuizToUrl(quiz: Quizz): string {
  const encoded = Base64.encode(JSON.stringify(quiz));
  return `${window.location.origin}?q=${encoded}`;
}

export function calculateScore(
  question: Question,
  isCorrect: boolean,
  responseTime: number,
  totalTime: number,
  multiplier?: number
): number {
  if (!isCorrect) return 0;

  const basePoints = question.points || 100;

  // Only apply time-based scoring if multiplier is provided and not equal to 1
  if (!multiplier || multiplier === 1) {
    return basePoints;
  }

  if (!question.duration && !totalTime) return basePoints;

  const maxTime = question.duration || totalTime || 30;
  const timeRatio = Math.max(0, 1 - responseTime / maxTime);

  return Math.round(basePoints * (0.5 + 0.5 * timeRatio * multiplier));
}

export function formatResults(
  quizTitle: string,
  _totalScore: number,
  _maxScore: number,
  correctAnswers: number,
  totalQuestions: number
): string {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return `🧠 Quiz Results: ${quizTitle}

📊 Score: ${percentage}%
✅ Correct answers: ${correctAnswers}/${totalQuestions}`;
}

export function isAnswerCorrect(question: Question, userAnswer: any): boolean {
  switch (question.type) {
    case "true-false":
      return question.answer === userAnswer;
    case "single-choice":
      return question.answer === userAnswer;
    case "multiple-choice":
      if (!Array.isArray(userAnswer)) return false;
      return (
        JSON.stringify(question.answer.sort()) ===
        JSON.stringify(userAnswer.sort())
      );
    default:
      return false;
  }
}
