import { useState } from 'react';
import type { Quizz } from '../types';
import { calculateScore, isAnswerCorrect } from '../utils/quiz';
import QuizLanding from './QuizLanding';
import QuestionDisplay from './QuestionDisplay';
import Results from './Results';

type QuizState = 'landing' | 'in-progress' | 'feedback' | 'completed';

interface Answer {
  questionIndex: number;
  userAnswer: any;
  responseTime: number;
  isCorrect: boolean;
  pointsEarned: number;
}

interface QuizProps {
  quiz: Quizz;
}

export default function Quiz({ quiz }: QuizProps) {
  const [state, setState] = useState<QuizState>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);

  const handleStart = () => {
    setState('in-progress');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const handleAnswer = (userAnswer: any, responseTime: number) => {
    const question = quiz.questions[currentQuestionIndex];
    const isCorrect = isAnswerCorrect(question, userAnswer);
    const pointsEarned = calculateScore(question, isCorrect, responseTime, quiz.duration || 30, quiz.responseTimeMultiplier);

    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      userAnswer,
      responseTime,
      isCorrect,
      pointsEarned,
    };

    setCurrentAnswer(newAnswer);
    setState('feedback');
  };

  const handleContinue = () => {
    if (currentAnswer) {
      const updatedAnswers = [...answers, currentAnswer];
      setAnswers(updatedAnswers);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setState('in-progress');
        setCurrentAnswer(null);
      } else {
        setState('completed');
      }
    }
  };

  const handleRestart = () => {
    setState('landing');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setCurrentAnswer(null);
  };

  const totalScore = answers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
  const maxScore = quiz.questions.reduce((sum, question) => sum + (question.points || 100), 0);
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;

  if (state === 'landing') {
    return <QuizLanding quiz={quiz} onStart={handleStart} />;
  }

  if (state === 'in-progress') {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    return (
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        defaultDuration={quiz.duration}
        onAnswer={handleAnswer}
      />
    );
  }

  if (state === 'feedback' && currentAnswer) {
    const currentRunningScore = totalScore + currentAnswer.pointsEarned;
    const currentCorrectAnswers = correctAnswers + (currentAnswer.isCorrect ? 1 : 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className={`text-6xl mb-4 ${currentAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {currentAnswer.isCorrect ? '✓' : '✗'}
          </div>

          <h2 className={`text-2xl font-bold mb-2 ${currentAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {currentAnswer.isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>

          <div className="space-y-2 mb-6">
            <div className="text-lg">
              <span className="text-gray-600">Points earned: </span>
              <span className="font-bold text-blue-600">+{currentAnswer.pointsEarned}</span>
            </div>

            <div className="text-sm text-gray-500">
              Running score: {currentRunningScore} points
            </div>

            <div className="text-sm text-gray-500">
              Correct answers: {currentCorrectAnswers}/{currentQuestionIndex + 1}
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Results
      quiz={quiz}
      score={totalScore}
      maxScore={maxScore}
      correctAnswers={correctAnswers}
      onRestart={handleRestart}
    />
  );
}