import { useState } from "react";
import type { Question } from "../../types";
import QuestionEditor from "./QuestionEditor";
import { createEmptyQuestion, duplicateQuestion } from "../../utils/editor";

interface QuestionListProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

export default function QuestionList({
  questions,
  onQuestionsChange,
}: QuestionListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const getQuestionTypeIcon = (type: Question["type"]) => {
    switch (type) {
      case "true-false":
        return "✓/✗";
      case "single-choice":
        return "○";
      case "multiple-choice":
        return "☑";
    }
  };

  const getQuestionTypeName = (type: Question["type"]) => {
    switch (type) {
      case "true-false":
        return "True/False";
      case "single-choice":
        return "Single Choice";
      case "multiple-choice":
        return "Multiple Choice";
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newQuestions = [...questions];
      [newQuestions[index - 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index - 1],
      ];
      onQuestionsChange(newQuestions);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < questions.length - 1) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ];
      onQuestionsChange(newQuestions);
    }
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const newQuestions = questions.filter((_, i) => i !== index);
      onQuestionsChange(newQuestions);
    }
  };

  const handleDuplicate = (index: number) => {
    const questionToDuplicate = questions[index];
    const duplicated = duplicateQuestion(questionToDuplicate);
    duplicated.statement = `${duplicated.statement} (Copy)`;

    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, duplicated);
    onQuestionsChange(newQuestions);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (editingIndex !== null) {
      const newQuestions = [...questions];
      newQuestions[editingIndex] = updatedQuestion;
      onQuestionsChange(newQuestions);
      setEditingIndex(null);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleAddNewQuestion = (newQuestion: Question) => {
    const newQuestions = [...questions, newQuestion];
    onQuestionsChange(newQuestions);
    setIsAddingNew(false);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setIsAddingNew(false);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-white border-brutal-thick shadow-brutal p-6 sharp">
      <div className="flex justify-between gap-1 items-center mb-6">
        <div className="inline-block bg-cyber-orange px-4 py-2 border-brutal">
          <h2 className="text-md md:text-xl font-black text-white uppercase">
            Questions ({questions.length})
          </h2>
        </div>
        <button
          onClick={handleAddNew}
          className="btn-brutal px-5 py-3 bg-cyber-green text-black sharp text-sm"
        >
          + ADD QUESTION
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 border-brutal-thick bg-gray-light">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-black font-bold mb-6 uppercase tracking-wide">
            No questions yet
          </p>
          <button
            onClick={handleAddNew}
            className="btn-brutal px-6 py-3 bg-cyber-blue text-white sharp"
          >
            ADD FIRST QUESTION
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border-brutal bg-white sharp hover:translate-x-1 transition-transform"
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-sm bg-black text-white px-3 py-1 sharp font-black">
                      #{index + 1}
                    </span>
                    <span className="text-sm bg-cyber-blue text-white px-3 py-1 sharp font-black uppercase tracking-wide">
                      {getQuestionTypeIcon(question.type)}{" "}
                      {getQuestionTypeName(question.type)}
                    </span>
                    {question.points && (
                      <span className="text-sm bg-cyber-green text-black px-3 py-1 sharp font-black">
                        {question.points} PTS
                      </span>
                    )}
                    {question.duration && (
                      <span className="text-sm bg-cyber-yellow text-black px-3 py-1 sharp font-black">
                        {question.duration}s
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-black mb-1 text-base">
                    {truncateText(
                      question.statement || "Untitled Question",
                      80
                    )}
                  </h3>
                  {question.image && (
                    <div className="text-sm text-cyber-purple font-bold">
                      📷 Has image
                    </div>
                  )}
                </div>

                <div className="flex items-center ml-4 gap-1">
                  {/* Reorder buttons */}
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-3 py-1 text-black bg-gray-light border-brutal sharp hover:bg-cyber-yellow disabled:opacity-30 disabled:cursor-not-allowed font-black text-xs"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === questions.length - 1}
                      className="px-3 py-1 text-black bg-gray-light border-brutal sharp hover:bg-cyber-yellow disabled:opacity-30 disabled:cursor-not-allowed font-black text-xs"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col md:flex-row gap-1">
                    <button
                      onClick={() => handleEdit(index)}
                      className="px-3 py-2 bg-cyber-blue text-white border-brutal sharp hover:bg-cyber-purple transition-colors font-black text-sm"
                      title="Edit"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDuplicate(index)}
                      className="px-3 py-2 bg-cyber-green text-black border-brutal sharp hover:bg-cyber-yellow transition-colors font-black text-sm"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-3 py-2 bg-cyber-pink text-white border-brutal sharp hover:bg-black transition-colors font-black text-sm"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Editor Modal */}
      {editingIndex !== null && (
        <QuestionEditor
          question={questions[editingIndex]}
          onUpdate={handleUpdateQuestion}
          onCancel={handleCancel}
        />
      )}

      {/* Add New Question Modal */}
      {isAddingNew && (
        <QuestionEditor
          question={createEmptyQuestion("true-false")}
          onUpdate={handleAddNewQuestion}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
