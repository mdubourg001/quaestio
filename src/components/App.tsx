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
    responseTimeMultiplier: 1.1,
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

  const handleEditSample = () => {
    const encodedQuiz = encodeQuizToUrl(sampleQuiz);
    const editorUrl = `/editor?${encodedQuiz.split("?")[1]}`;
    window.location.href = editorUrl;
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Quaestio</h1>
          <p className="text-gray-600 mb-6">
            {error ||
              "No quiz data found. Please access this app with a valid quiz URL containing a base64-encoded quiz in the 'q' parameter."}
          </p>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Want to try it out or create your own quiz?
            </h3>

            <div className="flex justify-center gap-3">
              <button
                onClick={handlePreviewSample}
                className="inline-block px-4 py-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors font-medium"
              >
                Try sample quiz
              </button>

              <a
                href="/editor"
                className="inline-block px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Open quiz editor
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Create, edit, and export quizzes with our visual editor
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Quiz quiz={quiz} />;
}
