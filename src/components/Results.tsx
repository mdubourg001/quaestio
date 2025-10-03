import { useState } from "react";
import type { Quizz } from "../types";
import { formatResults } from "../utils/quiz";
import { Base64 } from "../utils/b64";

interface ResultsProps {
  quiz: Quizz;
  score: number;
  correctAnswers: number;
  onRestart: () => void;
}

export default function Results({
  quiz,
  score,
  correctAnswers,
  onRestart,
}: ResultsProps) {
  const [copied, setCopied] = useState(false);

  const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
  const totalQuestions = quiz.questions.length;

  const getScoreMessage = () => {
    if (percentage >= 90) return "🎉 Excellent work!";
    if (percentage >= 80) return "👏 Great job!";
    if (percentage >= 70) return "👍 Good effort!";
    if (percentage >= 60) return "📚 Keep practicing!";
    return "💪 Don't give up!";
  };

  const handleCopyResults = async () => {
    const formattedResults = formatResults(
      quiz.title,
      score,
      correctAnswers,
      totalQuestions
    );

    try {
      await navigator.clipboard.writeText(formattedResults);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy results:", err);
    }
  };

  const openEditor = () => {
    const encodedQuiz = Base64.encode(JSON.stringify(quiz));
    const editorUrl = `/editor?import=${encodedQuiz}`;
    window.open(editorUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-pattern-dots flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Mega header */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-cyber-pink border-brutal-thick shadow-brutal-hover px-8 py-6 transform -rotate-2 mb-6 animate-bounce-in">
            <h1 className="text-5xl font-black text-white uppercase tracking-tight">
              Quiz Complete!
            </h1>
          </div>
          <div className="text-xl font-bold text-black uppercase tracking-wide">
            {quiz.title}
          </div>
        </div>

        <div className="bg-white border-brutal-thick shadow-brutal sharp">
          {/* Giant score display */}
          <div
            className={`p-4 text-center border-b-[3px] border-black ${
              percentage >= 80
                ? "bg-cyber-green"
                : percentage >= 60
                ? "bg-cyber-yellow"
                : "bg-cyber-pink"
            }`}
          >
            <div
              className={`text-5xl font-black leading-none mb-4 ${
                percentage >= 60 ? "text-black" : "text-white"
              }`}
            >
              {percentage}%
            </div>
            <p
              className={`text-3g font-black uppercase tracking-tight ${
                percentage >= 60 ? "text-black" : "text-white"
              }`}
            >
              {getScoreMessage()}
            </p>
          </div>

          <div className="p-8">
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <div className="bg-cyber-green border-brutal p-4 col-span-2">
                <div className="text-4xl font-black text-black">
                  {correctAnswers}
                </div>
                <div className="text-xs font-bold text-black uppercase mt-1">
                  Correct
                </div>
              </div>

              <div className="bg-cyber-pink border-brutal p-4 col-span-2">
                <div className="text-4xl font-black text-white">
                  {totalQuestions - correctAnswers}
                </div>
                <div className="text-xs font-bold text-white uppercase mt-1">
                  Incorrect
                </div>
              </div>

              <div className="bg-cyber-blue border-brutal p-4 col-span-4">
                <div className="text-5xl font-black text-white">{score}</div>
                <div className="text-sm font-bold text-white uppercase mt-2">
                  Total Points
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={handleCopyResults}
                className="btn-brutal bg-cyber-yellow text-black py-4 px-6 sharp font-black text-sm col-span-2"
              >
                {copied ? "✓ COPIED!" : "📋 COPY RESULTS"}
              </button>

              <button
                onClick={onRestart}
                className="btn-brutal bg-cyber-green text-black py-4 px-6 sharp font-black text-sm"
              >
                ↻ RETRY
              </button>

              <button
                onClick={openEditor}
                className="btn-brutal bg-cyber-purple text-white py-4 px-6 sharp font-black text-sm"
              >
                ✎ EDIT
              </button>
            </div>

            <button
              onClick={() => (window.location.href = window.location.origin)}
              className="w-full btn-brutal bg-black text-white py-4 px-6 sharp font-black text-sm"
            >
              ← HOME
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
