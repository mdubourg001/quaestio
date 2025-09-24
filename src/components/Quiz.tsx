import { useState } from 'react';
import type { Quizz } from '../types';
import { calculateScore, isAnswerCorrect } from '../utils/quiz';
import QuizLanding from './QuizLanding';
import QuestionDisplay from './QuestionDisplay';
import Results from './Results';

type QuizState = 'landing' | 'in-progress' | 'completed';

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

  const handleStart = () => {
    setState('in-progress');
    setCurrentQuestionIndex(0);
    setAnswers([]);
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

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setState('completed');
    }
  };

  const handleRestart = () => {
    setState('landing');
    setCurrentQuestionIndex(0);
    setAnswers([]);
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