import type { Quizz } from '../types';

interface QuizLandingProps {
  quiz: Quizz;
  onStart: () => void;
}

export default function QuizLanding({ quiz, onStart }: QuizLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {quiz.thumbnail && (
          <div className="h-48 overflow-hidden">
            <img
              src={quiz.thumbnail}
              alt={quiz.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">
              {quiz.description}
            </p>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">Questions:</span>
              <span className="ml-2">{quiz.questions.length}</span>
            </div>

            {quiz.duration && (
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Time per question:</span>
                <span className="ml-2">{quiz.duration}s</span>
              </div>
            )}

            {quiz.responseTimeMultiplier && (
              <div className="flex items-center text-sm text-gray-500">
                <span className="font-medium">Time bonus:</span>
                <span className="ml-2">Faster responses earn more points</span>
              </div>
            )}
          </div>

          <button
            onClick={onStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}