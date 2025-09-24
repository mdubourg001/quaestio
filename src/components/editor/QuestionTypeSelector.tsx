import type { Question } from '../../types';

interface QuestionTypeSelectorProps {
  selectedType: Question['type'];
  onTypeChange: (type: Question['type']) => void;
}

export default function QuestionTypeSelector({ selectedType, onTypeChange }: QuestionTypeSelectorProps) {
  const questionTypes = [
    {
      type: 'true-false' as const,
      name: 'True/False',
      description: 'Simple true or false question',
      icon: '✓/✗',
    },
    {
      type: 'single-choice' as const,
      name: 'Single Choice',
      description: 'Multiple options with one correct answer',
      icon: '○',
    },
    {
      type: 'multiple-choice' as const,
      name: 'Multiple Choice',
      description: 'Multiple options with multiple correct answers',
      icon: '☑',
    },
  ];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Question Type
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {questionTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => onTypeChange(type.type)}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              selectedType === type.type
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">{type.icon}</span>
              <span className="font-medium text-gray-900">{type.name}</span>
            </div>
            <p className="text-sm text-gray-600">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}