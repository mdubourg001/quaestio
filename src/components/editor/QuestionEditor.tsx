import { useState } from "react";
import type { Question } from "../../types";
import QuestionTypeSelector from "./QuestionTypeSelector";
import { createEmptyQuestion } from "../../utils/editor";

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionEditor({
  question,
  onUpdate,
  onCancel,
}: QuestionEditorProps) {
  const [formData, setFormData] = useState<Question>(question);

  const handleTypeChange = (newType: Question["type"]) => {
    if (newType === formData.type) return;

    // Check if we're switching between single-choice and multiple-choice
    const oldHasOptions =
      formData.type === "single-choice" || formData.type === "multiple-choice";
    const newHasOptions =
      newType === "single-choice" || newType === "multiple-choice";

    if (oldHasOptions && newHasOptions) {
      // Preserve options when switching between choice types
      const newAnswer = newType === "single-choice" ? 0 : [0];
      setFormData({
        ...formData,
        type: newType,
        answer: newAnswer,
      });
    } else {
      // Use default behavior for other type changes
      const newQuestion = createEmptyQuestion(newType);
      setFormData({
        ...newQuestion,
        statement: formData.statement,
        image: formData.image,
        points: formData.points,
        duration: formData.duration,
      });
    }
  };

  const handleBasicChange = (
    field: keyof Omit<Question, "type" | "answer" | "options">,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    if (
      formData.type === "single-choice" ||
      formData.type === "multiple-choice"
    ) {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const addOption = () => {
    if (
      formData.type === "single-choice" ||
      formData.type === "multiple-choice"
    ) {
      const newOptions = [
        ...formData.options,
        `Option ${formData.options.length + 1}`,
      ];
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const removeOption = (index: number) => {
    if (
      formData.type === "single-choice" ||
      formData.type === "multiple-choice"
    ) {
      const newOptions = formData.options.filter((_, i) => i !== index);

      let newAnswer = formData.answer;
      if (formData.type === "single-choice") {
        if (formData.answer === index) {
          newAnswer = 0;
        } else if (formData.answer > index) {
          newAnswer = formData.answer - 1;
        }
      } else if (formData.type === "multiple-choice") {
        newAnswer = formData.answer
          .filter((answerIndex) => answerIndex !== index)
          .map((answerIndex) =>
            answerIndex > index ? answerIndex - 1 : answerIndex
          );
      }

      setFormData((prev) => ({
        ...prev,
        options: newOptions,
        answer: newAnswer,
      }));
    }
  };

  const handleAnswerChange = (value: any) => {
    setFormData((prev) => ({ ...prev, answer: value }));
  };

  const handleMultipleChoiceToggle = (index: number) => {
    if (formData.type === "multiple-choice") {
      const currentAnswers = formData.answer;
      const newAnswers = currentAnswers.includes(index)
        ? currentAnswers.filter((i) => i !== index)
        : [...currentAnswers, index];

      setFormData((prev) => ({ ...prev, answer: newAnswers }));
    }
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center p-4 z-50">
      <div className="bg-white border-brutal-thick shadow-brutal-hover max-w-2xl w-full max-h-[90vh] overflow-y-auto sharp animate-bounce-in">
        <div className="bg-black p-4 border-b-[3px] border-black sticky top-0 z-10">
          <h3 className="text-xl font-black text-cyber-orange uppercase">
            {question.statement ? "Edit Question" : "Add Question"}
          </h3>
        </div>

        <div className="p-6">
          <QuestionTypeSelector
            selectedType={formData.type}
            onTypeChange={handleTypeChange}
          />

          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                Question Statement *
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) => handleBasicChange("statement", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal resize-none"
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ""}
                  onChange={(e) => handleBasicChange("image", e.target.value)}
                  className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.points || ""}
                  onChange={(e) =>
                    handleBasicChange(
                      "points",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.duration || ""}
                  onChange={(e) =>
                    handleBasicChange(
                      "duration",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
                  placeholder="Override default duration"
                />
                <p className="text-xs font-bold text-black mt-2 bg-cyber-yellow px-2 py-1 inline-block">
                  ⏱ Leave empty for quiz default
                </p>
              </div>
            </div>

            {/* Answer Section */}
            <div className="border-t-[3px] border-black pt-4">
              <label className="block text-xs font-black text-black mb-3 uppercase tracking-wide bg-cyber-blue text-white px-3 py-2 inline-block border-brutal">
                ✓ Answer Configuration
              </label>

              {formData.type === "true-false" && (
                <div className="space-y-3">
                  <label className="flex items-center bg-cyber-green text-black px-4 py-3 border-brutal sharp cursor-pointer hover:shadow-brutal-sm transition-shadow">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={formData.answer === true}
                      onChange={() => handleAnswerChange(true)}
                      className="mr-3 w-5 h-5"
                    />
                    <span className="font-black text-sm uppercase">TRUE</span>
                  </label>
                  <label className="flex items-center bg-cyber-pink text-white px-4 py-3 border-brutal sharp cursor-pointer hover:shadow-brutal-sm transition-shadow">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={formData.answer === false}
                      onChange={() => handleAnswerChange(false)}
                      className="mr-3 w-5 h-5"
                    />
                    <span className="font-black text-sm uppercase">FALSE</span>
                  </label>
                </div>
              )}

              {(formData.type === "single-choice" ||
                formData.type === "multiple-choice") && (
                <div>
                  <div className="space-y-3 mb-4">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {formData.type === "single-choice" ? (
                          <input
                            type="radio"
                            name="singleChoiceAnswer"
                            checked={formData.answer === index}
                            onChange={() => handleAnswerChange(index)}
                            className="flex-shrink-0 w-5 h-5"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={formData.answer.includes(index)}
                            onChange={() => handleMultipleChoiceToggle(index)}
                            className="flex-shrink-0 w-5 h-5"
                          />
                        )}
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          className="flex-1 px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
                          placeholder={`Option ${index + 1}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-3 py-3 bg-cyber-pink text-white border-brutal sharp hover:bg-black transition-colors font-black"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addOption}
                    className="btn-brutal px-4 py-2 bg-cyber-yellow text-black sharp text-sm"
                  >
                    + ADD OPTION
                  </button>

                  {formData.type === "multiple-choice" && (
                    <p className="text-xs font-bold text-black mt-3 bg-cyber-orange px-2 py-1 inline-block">
                      ⚠ Check all correct answers
                    </p>
                  )}
                </div>
              )}
            </div>

            {formData.image && (
              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Image Preview
                </label>
                <div className="w-56 h-36 border-brutal sharp overflow-hidden bg-gray-light">
                  <img
                    src={formData.image}
                    alt="Question image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t-[3px] border-black">
            <button
              type="button"
              onClick={onCancel}
              className="btn-brutal px-5 py-3 bg-white text-black sharp text-sm"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-brutal px-5 py-3 bg-cyber-green text-black sharp text-sm"
            >
              {question.statement ? "✓ UPDATE" : "+ ADD QUESTION"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
