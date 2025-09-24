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
    questions: [
      {
        type: "true-false",
        statement: "The sky is blue",
        answer: true,
        points: 100,
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
          <p className="text-sm text-gray-500 mb-4">
            Example:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
              ?q=[base64-encoded-quiz]
            </code>
          </p>
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6 relative">
            <h3 className="font-semibold text-gray-800 mb-2">
              Sample Quiz Format:
            </h3>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {`{
  "title": "Sample Quiz",
  "description": "A test quiz",
  "questions": [
    {
      "type": "true-false",
      "statement": "The sky is blue",
      "answer": true,
      "points": 100
    }
  ]
}`}
            </pre>
            <div className="absolute bottom-2 right-2 flex gap-1">
              <button
                onClick={handleEditSample}
                className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                title="Edit this sample quiz"
              >
                Edit
              </button>
              <button
                onClick={handlePreviewSample}
                className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                title="Preview this sample quiz"
              >
                Preview
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Want to create your own quiz?
            </h3>
            <a
              href="/editor"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🛠️ Open Quiz Editor
            </a>
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
