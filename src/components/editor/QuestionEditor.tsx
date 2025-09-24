import { useState } from 'react';
import type { Question } from '../../types';
import QuestionTypeSelector from './QuestionTypeSelector';
import { createEmptyQuestion } from '../../utils/editor';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (question: Question) => void;
  onCancel: () => void;
}

export default function QuestionEditor({ question, onUpdate, onCancel }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Question>(question);

  const handleTypeChange = (newType: Question['type']) => {
    if (newType === formData.type) return;

    // Check if we're switching between single-choice and multiple-choice
    const oldHasOptions = formData.type === 'single-choice' || formData.type === 'multiple-choice';
    const newHasOptions = newType === 'single-choice' || newType === 'multiple-choice';

    if (oldHasOptions && newHasOptions) {
      // Preserve options when switching between choice types
      const newAnswer = newType === 'single-choice' ? 0 : [0];
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

  const handleBasicChange = (field: keyof Omit<Question, 'type' | 'answer' | 'options'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    if (formData.type === 'single-choice' || formData.type === 'multiple-choice') {
      const newOptions = [...formData.options];
      newOptions[index] = value;
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const addOption = () => {
    if (formData.type === 'single-choice' || formData.type === 'multiple-choice') {
      const newOptions = [...formData.options, `Option ${formData.options.length + 1}`];
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.type === 'single-choice' || formData.type === 'multiple-choice') {
      const newOptions = formData.options.filter((_, i) => i !== index);

      let newAnswer = formData.answer;
      if (formData.type === 'single-choice') {
        if (formData.answer === index) {
          newAnswer = 0;
        } else if (formData.answer > index) {
          newAnswer = formData.answer - 1;
        }
      } else if (formData.type === 'multiple-choice') {
        newAnswer = formData.answer
          .filter(answerIndex => answerIndex !== index)
          .map(answerIndex => answerIndex > index ? answerIndex - 1 : answerIndex);
      }

      setFormData(prev => ({ ...prev, options: newOptions, answer: newAnswer }));
    }
  };

  const handleAnswerChange = (value: any) => {
    setFormData(prev => ({ ...prev, answer: value }));
  };

  const handleMultipleChoiceToggle = (index: number) => {
    if (formData.type === 'multiple-choice') {
      const currentAnswers = formData.answer;
      const newAnswers = currentAnswers.includes(index)
        ? currentAnswers.filter(i => i !== index)
        : [...currentAnswers, index];

      setFormData(prev => ({ ...prev, answer: newAnswers }));
    }
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {question.statement ? 'Edit Question' : 'Add Question'}
          </h3>

          <QuestionTypeSelector
            selectedType={formData.type}
            onTypeChange={handleTypeChange}
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Statement *
              </label>
              <textarea
                value={formData.statement}
                onChange={(e) => handleBasicChange('statement', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => handleBasicChange('image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.points || ''}
                  onChange={(e) => handleBasicChange('points', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration Override (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={formData.duration || ''}
                  onChange={(e) => handleBasicChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Override default duration"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use quiz default duration
                </p>
              </div>
            </div>

            {/* Answer Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Configuration
              </label>

              {formData.type === 'true-false' && (
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={formData.answer === true}
                      onChange={() => handleAnswerChange(true)}
                      className="mr-2"
                    />
                    True
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trueFalseAnswer"
                      checked={formData.answer === false}
                      onChange={() => handleAnswerChange(false)}
                      className="mr-2"
                    />
                    False
                  </label>
                </div>
              )}

              {(formData.type === 'single-choice' || formData.type === 'multiple-choice') && (
                <div>
                  <div className="space-y-3 mb-4">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {formData.type === 'single-choice' ? (
                          <input
                            type="radio"
                            name="singleChoiceAnswer"
                            checked={formData.answer === index}
                            onChange={() => handleAnswerChange(index)}
                            className="flex-shrink-0"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={formData.answer.includes(index)}
                            onChange={() => handleMultipleChoiceToggle(index)}
                            className="flex-shrink-0"
                          />
                        )}
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Option ${index + 1}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Add Option
                  </button>

                  {formData.type === 'multiple-choice' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Check all correct answers
                    </p>
                  )}
                </div>
              )}
            </div>

            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Preview
                </label>
                <div className="w-48 h-32 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Question image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {question.statement ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}