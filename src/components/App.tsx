import { useEffect, useState } from "react";
import type { Quizz } from "../types";
import { decodeQuizFromUrl, encodeQuizToUrl } from "../utils/quiz";
import Quiz from "./Quiz";

export default function App() {
  const [quiz, setQuiz] = useState<Quizz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample quiz for the example
  const sampleQuiz: Quizz = {
    title: "Sample Quiz",
    description: "A test quiz",
    responseTimeMultiplier: 2,
    thumbnail:
      "https://www.radiofrance.fr/s3/cruiser-production/2022/07/dd0af1b8-3b50-4d1c-baf8-92d2fc34942d/1200x680_gettyimages-525635046.webp",
    questions: [
      {
        type: "true-false",
        statement: "Is the sky blue?",
        answer: true,
        points: 100,
        duration: 15,
      },
      {
        type: "single-choice",
        statement: "What is 2 + 2?",
        options: ["3", "4", "5", "22"],
        answer: 1,
        points: 200,
        duration: 20,
      },
    ],
  };

  const handlePreviewSample = () => {
    const encodedUrl = encodeQuizToUrl(sampleQuiz);
    window.location.href = encodedUrl;
  };

  useEffect(() => {
    try {
      const decodedQuiz = decodeQuizFromUrl();
      if (decodedQuiz) {
        setQuiz(decodedQuiz);
      } else {
        setError("No quiz data found in URL");
      }
    } catch (err) {
      setError("Failed to decode quiz data");
      console.error("Quiz decoding error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern-dots flex items-center justify-center">
        <div className="text-center">
          <div className="border-brutal-thick border-black bg-cyber-yellow w-16 h-16 mx-auto mb-6 animate-bounce-in flex items-center justify-center">
            <div className="text-3xl font-black">?</div>
          </div>
          <p className="text-black font-bold text-lg uppercase tracking-wider">
            Loading quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-pattern-grid flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-brutal-thick shadow-brutal p-8 text-center animate-bounce-in">
          <div className="inline-block bg-cyber-pink px-4 py-2 border-brutal mb-6">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Quaestio
            </h1>
          </div>

          <p className="text-black font-semibold mb-8 text-base leading-relaxed">
            {error ||
              "No quiz data found. Please access this app with a valid quiz URL."}
          </p>

          <div className="border-brutal-thick border-black p-6 mb-6 bg-cyber-yellow">
            <h3 className="font-black text-black mb-4 text-lg uppercase">
              Get Started
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePreviewSample}
                className="btn-brutal px-5 py-3 bg-cyber-green text-black sharp"
              >
                Try Sample Quiz
              </button>

              <a
                href="/editor"
                className="btn-brutal px-5 py-3 bg-cyber-purple text-white sharp inline-block"
              >
                Open Quiz Editor
              </a>
            </div>

            <p className="text-xs text-black mt-4 font-bold uppercase tracking-wide">
              Create & Export Your Own Quizzes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Quiz quiz={quiz} />;
}
