import { useState } from 'react';
import type { Quizz } from '../types';
import { formatResults } from '../utils/quiz';

interface ResultsProps {
  quiz: Quizz;
  score: number;
  maxScore: number;
  correctAnswers: number;
  onRestart: () => void;
}

export default function Results({
  quiz,
  score,
  maxScore,
  correctAnswers,
  onRestart,
}: ResultsProps) {
  const [copied, setCopied] = useState(false);

  const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
  const totalQuestions = quiz.questions.length;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 90) return '🎉 Excellent work!';
    if (percentage >= 80) return '👏 Great job!';
    if (percentage >= 70) return '👍 Good effort!';
    if (percentage >= 60) return '📚 Keep practicing!';
    return '💪 Don\'t give up!';
  };

  const handleCopyResults = async () => {
    const formattedResults = formatResults(
      quiz.title,
      score,
      maxScore,
      correctAnswers,
      totalQuestions
    );

    try {
      await navigator.clipboard.writeText(formattedResults);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy results:', err);
    }
  };

  const openEditor = () => {
    const encodedQuiz = btoa(JSON.stringify(quiz));
    const editorUrl = `/editor?import=${encodedQuiz}`;
    window.open(editorUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Quiz Complete!</h1>
          <p className="text-blue-100">{quiz.title}</p>
        </div>

        <div className="p-6">
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              {getScoreMessage()}
            </p>
            <div className="space-y-1">
              <p className="text-gray-600">
                {correctAnswers} out of {quiz.questions.length} correct answers
              </p>
              <p className="text-lg font-semibold text-blue-600">
                Total Score: {score} points
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {totalQuestions - correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCopyResults}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {copied ? (
                <>
                  <span className="mr-2">✓</span>
                  Copied!
                </>
              ) : (
                <>
                  <span className="mr-2">📋</span>
                  Copy Results
                </>
              )}
            </button>

            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Take Quiz Again
            </button>

            <button
              onClick={openEditor}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              🛠️ Edit Quiz
            </button>

            <button
              onClick={() => window.location.href = window.location.origin}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}