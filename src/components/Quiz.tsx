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
      <div className={`min-h-screen flex items-center justify-center p-6 ${
        currentAnswer.isCorrect ? 'bg-cyber-green' : 'bg-cyber-pink'
      }`}>
        <div className="max-w-lg w-full bg-white border-brutal-thick shadow-brutal-hover sharp animate-bounce-in">
          {/* Giant feedback symbol */}
          <div className={`p-12 text-center border-b-[3px] border-black ${
            currentAnswer.isCorrect ? 'bg-cyber-yellow' : 'bg-black'
          }`}>
            <div className={`text-9xl font-black ${
              currentAnswer.isCorrect ? 'text-black' : 'text-cyber-pink'
            }`}>
              {currentAnswer.isCorrect ? '✓' : '✗'}
            </div>
          </div>

          <div className="p-8 text-center">
            <h2 className={`text-4xl font-black mb-8 uppercase tracking-tight ${
              currentAnswer.isCorrect ? 'text-cyber-green' : 'text-cyber-pink'
            }`}>
              {currentAnswer.isCorrect ? 'Correct!' : 'Wrong!'}
            </h2>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-cyber-blue border-brutal p-4">
                <div className="text-3xl font-black text-white">+{currentAnswer.pointsEarned}</div>
                <div className="text-xs font-bold text-white uppercase mt-1">Points</div>
              </div>

              <div className="bg-black border-brutal p-4">
                <div className="text-3xl font-black text-cyber-yellow">{currentRunningScore}</div>
                <div className="text-xs font-bold text-white uppercase mt-1">Total</div>
              </div>

              <div className="bg-cyber-purple border-brutal p-4">
                <div className="text-3xl font-black text-white">{currentCorrectAnswers}/{currentQuestionIndex + 1}</div>
                <div className="text-xs font-bold text-white uppercase mt-1">Correct</div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full btn-brutal bg-black text-white py-5 px-8 sharp text-xl"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? '→ NEXT' : '✓ RESULTS'}
            </button>
          </div>
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