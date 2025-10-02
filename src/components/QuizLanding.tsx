import type { Quizz } from "../types";
import { Base64 } from "../utils/b64";

interface QuizLandingProps {
  quiz: Quizz;
  onStart: () => void;
}

const openEditor = (quiz: Quizz) => {
  const encodedQuiz = Base64.encode(JSON.stringify(quiz));
  const editorUrl = `/editor?import=${encodedQuiz}`;
  window.open(editorUrl, "_blank");
};

export default function QuizLanding({ quiz, onStart }: QuizLandingProps) {
  return (
    <div className="min-h-screen bg-cyber-blue flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Asymmetric header */}
        <div className="mb-8 transform -rotate-1">
          <h1 className="text-6xl font-black text-black mb-2 uppercase tracking-tight leading-none bg-cyber-yellow inline-block px-6 py-4 border-brutal-thick shadow-brutal-hover">
            {quiz.title}
          </h1>
        </div>

        <div className="bg-white border-brutal-thick shadow-brutal clip-corner-br">
          {quiz.thumbnail && (
            <div className="h-56 overflow-hidden border-b-[3px] border-black relative">
              <img
                src={quiz.thumbnail}
                alt={quiz.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-cyber-pink border-brutal px-4 py-2">
                <span className="text-white font-black text-2xl">!</span>
              </div>
            </div>
          )}

          <div className="p-8">
            {quiz.description && (
              <p className="text-black font-semibold mb-8 text-lg leading-relaxed border-l-[6px] border-cyber-green pl-4">
                {quiz.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-cyber-yellow border-brutal p-4 text-center">
                <div className="text-4xl font-black text-black">{quiz.questions.length}</div>
                <div className="text-xs font-bold uppercase mt-1 text-black">Questions</div>
              </div>

              {quiz.duration && (
                <div className="bg-cyber-green border-brutal p-4 text-center">
                  <div className="text-4xl font-black text-black">{quiz.duration}s</div>
                  <div className="text-xs font-bold uppercase mt-1 text-black">Per Q</div>
                </div>
              )}

              {quiz.responseTimeMultiplier && (
                <div className="bg-cyber-orange border-brutal p-4 text-center">
                  <div className="text-4xl font-black text-black">⚡</div>
                  <div className="text-xs font-bold uppercase mt-1 text-black">Speed Bonus</div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <button
                onClick={onStart}
                className="w-full btn-brutal bg-cyber-pink text-white py-5 px-8 sharp text-xl"
              >
                ▶ Start Quiz
              </button>

              <button
                onClick={() => openEditor(quiz)}
                className="w-full btn-brutal bg-white text-black py-3 px-6 sharp text-sm"
              >
                ✎ Edit in Editor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
