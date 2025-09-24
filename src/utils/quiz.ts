import type { Quizz, Question } from "../types";
import { Base64 } from "./b64";
import LZString from "lz-string";

export function decodeQuizFromUrl(): Quizz | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const encodedQuiz = urlParams.get("q");
  const compressedQuiz = urlParams.get("c");

  if (!encodedQuiz && !compressedQuiz) return null;

  try {
    // Try compressed version first (newer format)
    if (compressedQuiz) {
      const decompressed =
        LZString.decompressFromEncodedURIComponent(compressedQuiz);
      if (decompressed) {
        const quiz = JSON.parse(decompressed) as Quizz;
        return quiz;
      }
    }

    // Fall back to legacy base64 format
    if (encodedQuiz) {
      const decoded = Base64.decode(encodedQuiz);
      const quiz = JSON.parse(decoded) as Quizz;
      return quiz;
    }

    return null;
  } catch (error) {
    console.error("Failed to decode quiz from URL:", error);
    return null;
  }
}

function optimizeQuizForEncoding(quiz: Quizz): Quizz {
  // Create a copy and remove empty/default values to reduce size
  const optimized: any = structuredClone(quiz);

  for (const key in optimized) {
    if (optimized[key] === null || optimized[key] === undefined) {
      delete optimized[key];
    }
  }

  // Optimize questions
  optimized.questions = quiz.questions.map((question) => {
    const opt: any = { ...question };

    for (const key in opt) {
      if (
        opt[key] === null ||
        opt[key] === undefined ||
        (Array.isArray(opt[key]) && opt[key].length === 0) ||
        (typeof opt[key] === "object" &&
          !Array.isArray(opt[key]) &&
          Object.keys(opt[key]).length === 0) ||
        (key === "points" && opt[key] === 100) || // Default points
        (key === "duration" && opt[key] === 30) // Default duration
      ) {
        delete opt[key];
      }
    }

    return opt;
  });

  return optimized as Quizz;
}

export function encodeQuizToUrl(quiz: Quizz): string {
  // Optimize the quiz data first
  const optimizedQuiz = optimizeQuizForEncoding(quiz);
  const jsonString = JSON.stringify(optimizedQuiz);

  // Use LZ-String's most efficient URL-safe compression
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  if (compressed) {
    return `${window.location.origin}?c=${compressed}`;
  }

  // Fallback to base64 only if compression completely fails
  const encoded = Base64.encode(jsonString);
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
  totalScore: number,
  _maxScore: number,
  correctAnswers: number,
  totalQuestions: number
): string {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  return `🧠 Quiz Results: ${quizTitle}

📊 Score: ${percentage}%
✅ Correct answers: ${correctAnswers}/${totalQuestions}
🏆 Total Score: ${totalScore} points`;
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
