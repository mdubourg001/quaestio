import type { Quizz, Question } from '../types';

const STORAGE_KEY = 'local-quiz-editor-data';

export function saveQuizToStorage(quiz: Quizz): void {
  try {
    const data = {
      quiz,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save quiz to localStorage:', error);
  }
}

export function loadQuizFromStorage(): Quizz | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return parsed.quiz;
  } catch (error) {
    console.error('Failed to load quiz from localStorage:', error);
    return null;
  }
}

export function clearStoredQuiz(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored quiz:', error);
  }
}

export function createEmptyQuiz(): Quizz {
  return {
    title: 'New Quiz',
    description: '',
    thumbnail: '',
    duration: 30,
    responseTimeMultiplier: 1.0,
    questions: [],
  };
}

export function createEmptyQuestion(type: Question['type']): Question {
  const baseQuestion = {
    statement: '',
    image: '',
    points: 100,
    duration: undefined,
  };

  switch (type) {
    case 'true-false':
      return {
        ...baseQuestion,
        type: 'true-false',
        answer: true,
      };
    case 'single-choice':
      return {
        ...baseQuestion,
        type: 'single-choice',
        options: ['Option 1', 'Option 2'],
        answer: 0,
      };
    case 'multiple-choice':
      return {
        ...baseQuestion,
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
        answer: [0],
      };
  }
}

export function validateQuiz(quiz: Quizz): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!quiz.title.trim()) {
    errors.push('Quiz title is required');
  }

  if (quiz.questions.length === 0) {
    errors.push('At least one question is required');
  }

  quiz.questions.forEach((question, index) => {
    if (!question.statement.trim()) {
      errors.push(`Question ${index + 1}: Statement is required`);
    }

    if (question.type === 'single-choice' || question.type === 'multiple-choice') {
      if (question.options.length < 2) {
        errors.push(`Question ${index + 1}: At least 2 options are required`);
      }

      if (question.options.some(option => !option.trim())) {
        errors.push(`Question ${index + 1}: All options must have text`);
      }

      if (question.type === 'single-choice') {
        if (question.answer < 0 || question.answer >= question.options.length) {
          errors.push(`Question ${index + 1}: Invalid correct answer index`);
        }
      }

      if (question.type === 'multiple-choice') {
        if (question.answer.length === 0) {
          errors.push(`Question ${index + 1}: At least one correct answer must be selected`);
        }

        if (question.answer.some(answerIndex => answerIndex < 0 || answerIndex >= question.options.length)) {
          errors.push(`Question ${index + 1}: Invalid correct answer index`);
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function duplicateQuestion(question: Question): Question {
  return JSON.parse(JSON.stringify(question));
}

export function reorderQuestions(questions: Question[], fromIndex: number, toIndex: number): Question[] {
  const result = [...questions];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}