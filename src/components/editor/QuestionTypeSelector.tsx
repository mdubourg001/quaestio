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
    <div className="mb-6">
      <label className="block text-xs font-black text-black mb-3 uppercase tracking-wide">
        Question Type
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {questionTypes.map((type) => (
          <button
            key={type.type}
            onClick={() => onTypeChange(type.type)}
            className={`p-4 sharp text-left transition-all border-brutal ${
              selectedType === type.type
                ? 'bg-cyber-purple text-white shadow-brutal scale-[1.02]'
                : 'bg-white text-black hover:translate-x-1 hover:translate-y-1'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2 font-black">{type.icon}</span>
              <span className="font-black text-sm uppercase tracking-tight">{type.name}</span>
            </div>
            <p className={`text-xs font-bold ${selectedType === type.type ? 'text-white' : 'text-black'}`}>
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}