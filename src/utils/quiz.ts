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
        const parsed = JSON.parse(decompressed);
        // Check if it's the new compact format or legacy format
        if (parsed.q && Array.isArray(parsed.q)) {
          return expandCompactQuiz(parsed);
        } else {
          return parsed as Quizz;
        }
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

function expandCompactQuiz(compact: any): Quizz {
  const quiz: any = {};

  // Expand quiz-level fields
  if (compact.t) quiz.title = compact.t;
  if (compact.desc) quiz.description = compact.desc;
  if (compact.thumb) quiz.thumbnail = compact.thumb;
  if (compact.d) quiz.duration = compact.d;
  if (compact.rtm) quiz.responseTimeMultiplier = compact.rtm;

  // Expand questions
  quiz.questions = compact.q.map((q: any) => {
    const question: any = {};

    // Expand required fields
    question.statement = q.s; // s -> statement

    // Expand type abbreviations
    if (q.y === "tf") question.type = "true-false";
    else if (q.y === "sc") question.type = "single-choice";
    else if (q.y === "mc") question.type = "multiple-choice";

    question.answer = q.a; // a -> answer

    // Expand optional fields
    if (q.o) question.options = q.o; // o -> options
    if (q.i) question.image = q.i; // i -> image
    if (q.p) question.points = q.p; // p -> points
    if (q.dur) question.duration = q.dur; // dur -> duration

    return question;
  });

  return quiz as Quizz;
}

function optimizeQuizForEncoding(quiz: Quizz): any {
  const compact: any = {};

  // Compact field mappings for quiz
  if (quiz.title) compact.t = quiz.title;
  if (quiz.description?.trim()) compact.desc = quiz.description.trim();
  if (quiz.thumbnail?.trim()) compact.thumb = quiz.thumbnail.trim();
  if (quiz.duration) compact.d = quiz.duration;
  if (quiz.responseTimeMultiplier && quiz.responseTimeMultiplier !== 1) {
    compact.rtm = quiz.responseTimeMultiplier;
  }

  // Compact questions with abbreviated field names and types
  compact.q = quiz.questions.map((question) => {
    const q: any = {};

    // Required fields with compact names
    q.s = question.statement.trim(); // statement -> s

    // Type abbreviations
    if (question.type === "true-false") q.y = "tf";
    else if (question.type === "single-choice") q.y = "sc";
    else if (question.type === "multiple-choice") q.y = "mc";

    // Answer with compact name
    q.a = question.answer; // answer -> a

    // Optional fields only if non-default
    if (question.type !== "true-false" && question.options) {
      q.o = question.options; // options -> o
    }
    if (question.image?.trim()) q.i = question.image.trim(); // image -> i
    if (question.points && question.points !== 100) q.p = question.points; // points -> p
    if (question.duration) q.dur = question.duration; // duration -> dur

    return q;
  });

  return compact;
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

  return basePoints + Math.round(basePoints * timeRatio * (multiplier - 1));
}

export function formatResults(
  quizTitle: string,
  totalScore: number,
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
