export type Question = {
  /**
   * The question text
   */
  statement: string;
  /**
   * URL to an image associated with the question
   */
  image?: string;
  /**
   * Points awarded for answering the question correctly
   */
  points?: number;
  /**
   * Duration in seconds for which the question will be displayed
   * Overrides the `questionDuration` in the `Quizz` if provided
   */
  duration?: number;
} & (
  | {
      type: "true-false";
      answer: boolean;
    }
  | {
      type: "multiple-choice";
      options: string[];
      /**
       * Index of the correct option in the `options` array
       */
      answer: number[];
    }
  | {
      type: "single-choice";
      options: string[];
      /**
       * Index of the correct option in the `options` array
       */
      answer: number;
    }
);

export type Quizz = {
  title: string;
  description?: string;
  /**
   * URL to a thumbnail image representing the quiz
   */
  thumbnail?: string;
  /**
   * Duration in seconds for which each question will be displayed
   * Can be overridden by the `duration` property in each `Question`
   */
  duration?: number;
  /**
   * Multiplier to adjust scoring based on response time
   * A higher value means that faster responses will earn more points
   */
  responseTimeMultiplier?: number;
  /**
   * List of questions in the quiz
   */
  questions: Question[];
};
