import { useState, useEffect } from "react";
import type { Quizz } from "../../types";

interface QuizConfigEditorProps {
  quiz: Quizz;
  onUpdate: (quiz: Quizz) => void;
}

export default function QuizConfigEditor({
  quiz,
  onUpdate,
}: QuizConfigEditorProps) {
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
    <div className="bg-white border-brutal-thick shadow-brutal p-6 mb-6 sharp">
      <div className="inline-block bg-cyber-purple px-4 py-2 border-brutal mb-6">
        <h2 className="text-xl font-black text-white uppercase">
          Quiz Config
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
            Quiz Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
            Thumbnail URL
          </label>
          <input
            type="url"
            value={formData.thumbnail || ""}
            onChange={(e) => handleChange("thumbnail", e.target.value)}
            className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal resize-none"
            placeholder="Brief description of your quiz"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
            Duration (seconds)
          </label>
          <input
            type="number"
            min="5"
            max="300"
            value={formData.duration || ""}
            onChange={(e) =>
              handleChange(
                "duration",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            className="w-full px-4 py-3 border-brutal sharp bg-white font-bold focus:outline-none focus:shadow-brutal"
            placeholder="30"
          />
          <p className="text-xs font-bold text-black mt-2 bg-cyber-yellow px-2 py-1 inline-block">
            ⏱ Leave empty for no time limit
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center bg-cyber-green border-brutal p-4 sharp">
            <input
              type="checkbox"
              id="responseTimeBonus"
              checked={formData.responseTimeMultiplier === 2}
              onChange={(e) =>
                handleChange("responseTimeMultiplier", e.target.checked ? 2 : 1)
              }
              className="h-6 w-6 mr-3 sharp"
            />
            <label
              htmlFor="responseTimeBonus"
              className="block text-sm font-black text-black uppercase tracking-tight"
            >
              ⚡ Speed Bonus
            </label>
          </div>
          <p className="text-xs font-bold text-black mt-2">
            Faster responses = more points
          </p>
        </div>
      </div>

      {formData.thumbnail && (
        <div className="mt-6">
          <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
            Preview
          </label>
          <div className="w-40 h-28 border-brutal sharp overflow-hidden bg-gray-light">
            <img
              src={formData.thumbnail}
              alt="Thumbnail preview"
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
  );
}
