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
    <div className="min-h-screen bg-cyber-purple flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white border-brutal-thick shadow-brutal sharp animate-bounce-in">
        {/* Header with progress and timer */}
        <div className="bg-black text-white p-4 flex justify-between items-center border-b-[3px] border-black">
          <div className="flex items-center gap-4">
            <div className="bg-cyber-yellow text-black px-4 py-2 font-black text-lg border-brutal sharp">
              Q{questionNumber}/{totalQuestions}
            </div>

            {/* Chunky progress bar */}
            <div className="flex-1 h-8 bg-gray-dark border-brutal sharp overflow-hidden min-w-[200px]">
              <div
                className="h-full bg-cyber-green transition-all duration-300 flex items-center justify-center"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              >
                <span className="text-black font-black text-xs">
                  {Math.round((questionNumber / totalQuestions) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {timeLeft !== null && (
            <div className={`px-5 py-2 font-black text-2xl border-brutal sharp ${
              timeLeft <= 10
                ? 'bg-cyber-pink animate-shake'
                : timeLeft <= 20
                ? 'bg-cyber-orange'
                : 'bg-cyber-green text-black'
            }`}>
              {timeLeft}s
            </div>
          )}
        </div>

        <div className="p-8">
          <h2 className="text-3xl font-black text-black mb-6 leading-tight uppercase tracking-tight">
            {question.statement}
          </h2>

          {question.image && (
            <div className="mb-8 border-brutal-thick overflow-hidden">
              <img
                src={question.image}
                alt="Question illustration"
                className="w-full max-h-72 object-contain"
              />
            </div>
          )}

          {question.points && (
            <div className="inline-block bg-cyber-blue text-white px-4 py-2 border-brutal font-black text-sm mb-8 uppercase">
              Worth {question.points} Points
            </div>
          )}
        </div>

        <div className="px-8 pb-6 space-y-4">
          {question.type === 'true-false' && (
            <>
              <button
                onClick={() => setSelectedAnswer(true)}
                className={`w-full p-5 text-left sharp border-brutal font-bold text-lg transition-all ${
                  selectedAnswer === true
                    ? 'bg-cyber-green text-black shadow-brutal'
                    : 'bg-white text-black hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                ✓ TRUE
              </button>
              <button
                onClick={() => setSelectedAnswer(false)}
                className={`w-full p-5 text-left sharp border-brutal font-bold text-lg transition-all ${
                  selectedAnswer === false
                    ? 'bg-cyber-pink text-white shadow-brutal'
                    : 'bg-white text-black hover:translate-x-1 hover:translate-y-1'
                }`}
              >
                ✗ FALSE
              </button>
            </>
          )}

          {question.type === 'single-choice' && (
            <>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full p-5 text-left sharp border-brutal font-bold text-base transition-all ${
                    selectedAnswer === index
                      ? 'bg-cyber-yellow text-black shadow-brutal scale-[1.02]'
                      : 'bg-white text-black hover:translate-x-1 hover:translate-y-1'
                  }`}
                >
                  <span className="inline-block bg-black text-white px-3 py-1 mr-3 text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </button>
              ))}
            </>
          )}

          {question.type === 'multiple-choice' && (
            <>
              <p className="text-sm text-black font-black uppercase tracking-wide mb-2 bg-cyber-orange px-3 py-2 inline-block">
                ⚠ Select all correct answers
              </p>
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleMultipleChoiceToggle(index)}
                  className={`w-full p-5 text-left sharp border-brutal font-bold text-base transition-all ${
                    multipleSelections.includes(index)
                      ? 'bg-cyber-blue text-white shadow-brutal scale-[1.02]'
                      : 'bg-white text-black hover:translate-x-1 hover:translate-y-1'
                  }`}
                >
                  <span className="flex items-center">
                    <span
                      className={`w-7 h-7 mr-3 border-brutal sharp flex items-center justify-center font-black ${
                        multipleSelections.includes(index)
                          ? 'bg-cyber-green text-black'
                          : 'bg-white text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    <span className="inline-block bg-black text-white px-3 py-1 mr-3 text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="px-8 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!isAnswerSelected()}
            className="w-full btn-brutal bg-cyber-pink text-white py-5 px-8 sharp text-xl"
          >
            {questionNumber === totalQuestions ? '✓ FINISH QUIZ' : '→ NEXT QUESTION'}
          </button>
        </div>
      </div>
    </div>
  );
}