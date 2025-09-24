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
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Questions ({questions.length})
        </h2>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <p className="text-gray-500 mb-4">No questions yet</p>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded mr-2">
                      {index + 1}
                    </span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                      {getQuestionTypeIcon(question.type)}{" "}
                      {getQuestionTypeName(question.type)}
                    </span>
                    {question.points && (
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                        {question.points} pts
                      </span>
                    )}
                    {question.duration && (
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {question.duration}s
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {truncateText(
                      question.statement || "Untitled Question",
                      80
                    )}
                  </h3>
                  {question.image && (
                    <div className="text-sm text-blue-600 mb-1">
                      📷 Has image
                    </div>
                  )}
                </div>

                <div className="flex items-center ml-4">
                  {/* Reorder buttons */}
                  <div className="flex">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === questions.length - 1}
                      className="px-2 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Action buttons */}
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDuplicate(index)}
                    className="px-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    🗑️
                  </button>
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
