import { useState, useEffect } from 'react';
import type { Quizz } from '../../types';

interface QuizConfigEditorProps {
  quiz: Quizz;
  onUpdate: (quiz: Quizz) => void;
}

export default function QuizConfigEditor({ quiz, onUpdate }: QuizConfigEditorProps) {
  const [formData, setFormData] = useState(quiz);

  // Sync formData with quiz prop when it changes
  useEffect(() => {
    setFormData(quiz);
  }, [quiz]);

  const handleChange = (field: keyof Quizz, value: any) => {
    const updatedQuiz = { ...formData, [field]: value };
    setFormData(updatedQuiz);
    onUpdate(updatedQuiz);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail URL
          </label>
          <input
            type="url"
            value={formData.thumbnail || ''}
            onChange={(e) => handleChange('thumbnail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of your quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Question Duration (seconds)
          </label>
          <input
            type="number"
            min="5"
            max="300"
            value={formData.duration || ''}
            onChange={(e) => handleChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="30"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for no time limit
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Time Multiplier
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.responseTimeMultiplier || ''}
            onChange={(e) => handleChange('responseTimeMultiplier', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1.0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Higher values reward faster responses more
          </p>
        </div>
      </div>

      {formData.thumbnail && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thumbnail Preview
          </label>
          <div className="w-32 h-24 border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={formData.thumbnail}
              alt="Thumbnail preview"
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
  );
}