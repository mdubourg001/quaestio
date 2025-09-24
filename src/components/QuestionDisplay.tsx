import { useState, useEffect } from 'react';
import type { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  defaultDuration?: number;
  onAnswer: (answer: any, responseTime: number) => void;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  defaultDuration,
  onAnswer,
}: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [multipleSelections, setMultipleSelections] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const duration = question.duration || defaultDuration;

  useEffect(() => {
    if (!duration) return;

    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  const handleSubmit = () => {
    const responseTime = (Date.now() - startTime) / 1000;
    let answer = selectedAnswer;

    if (question.type === 'multiple-choice') {
      answer = multipleSelections;
    }

    onAnswer(answer, responseTime);
  };

  const handleMultipleChoiceToggle = (index: number) => {
    setMultipleSelections((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const isAnswerSelected = () => {
    if (question.type === 'multiple-choice') {
      return multipleSelections.length > 0;
    }
    return selectedAnswer !== null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {questionNumber} of {totalQuestions}
            </span>
            {timeLeft !== null && (
              <div className={`text-sm font-medium ${timeLeft <= 10 ? 'text-red-600' : 'text-gray-600'}`}>
                {timeLeft}s
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {question.statement}
          </h2>

          {question.image && (
            <div className="mb-6">
              <img
                src={question.image}
                alt="Question illustration"
                className="w-full max-h-64 object-contain rounded-lg"
              />
            </div>
          )}

          {question.points && (
            <div className="text-sm text-blue-600 font-medium mb-6">
              Points: {question.points}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {question.type === 'true-false' && (
            <>
              <button
                onClick={() => setSelectedAnswer(true)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswer === true
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ✓ True
              </button>
              <button
                onClick={() => setSelectedAnswer(false)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswer === false
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                ✗ False
              </button>
            </>
          )}

          {question.type === 'single-choice' && (
            <>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    selectedAnswer === index
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </button>
              ))}
            </>
          )}

          {question.type === 'multiple-choice' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Select all correct answers:
              </p>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultipleChoiceToggle(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    multipleSelections.includes(index)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="flex items-center">
                    <span
                      className={`w-5 h-5 mr-3 border-2 rounded ${
                        multipleSelections.includes(index)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {multipleSelections.includes(index) && (
                        <span className="text-white text-xs flex items-center justify-center h-full">
                          ✓
                        </span>
                      )}
                    </span>
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isAnswerSelected()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}