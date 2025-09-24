import { useState } from 'react';
import type { Quizz } from '../../types';
import { encodeQuizToUrl } from '../../utils/quiz';
import { validateQuiz } from '../../utils/editor';

interface ImportExportProps {
  quiz: Quizz;
  onImport: (quiz: Quizz) => void;
}

export default function ImportExport({ quiz, onImport }: ImportExportProps) {
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [importFormat, setImportFormat] = useState<'base64' | 'json'>('base64');

  const handleExport = () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert('Please fix the following issues before exporting:\n\n' + validation.errors.join('\n'));
      return;
    }

    const base64Data = btoa(JSON.stringify(quiz, null, 2));
    setExportData(base64Data);
    setShowExport(true);
  };

  const handleCopyBase64 = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const quizUrl = encodeQuizToUrl(quiz);
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleImport = () => {
    setImportError('');

    if (!importData.trim()) {
      const formatLabel = importFormat === 'base64' ? 'base64' : 'JSON';
      setImportError(`Please enter ${formatLabel} data to import`);
      return;
    }

    try {
      let importedQuiz: Quizz;

      if (importFormat === 'base64') {
        // Handle base64 format
        try {
          const decoded = atob(importData.trim());
          importedQuiz = JSON.parse(decoded) as Quizz;
        } catch (decodeErr) {
          setImportError('Failed to decode base64 data. Please check that the data is valid base64-encoded.');
          return;
        }
      } else {
        // Handle JSON format
        try {
          importedQuiz = JSON.parse(importData.trim()) as Quizz;
        } catch (parseErr) {
          setImportError('Failed to parse JSON data. Please check that the JSON is valid.');
          return;
        }
      }

      const validation = validateQuiz(importedQuiz);
      if (!validation.isValid) {
        setImportError('Invalid quiz data:\n' + validation.errors.join('\n'));
        return;
      }

      onImport(importedQuiz);
      setImportData('');
      setShowImport(false);
      alert('Quiz imported successfully!');
    } catch (err) {
      const formatLabel = importFormat === 'base64' ? 'base64-encoded JSON' : 'JSON';
      setImportError(`Failed to import quiz. Please check that the data is valid ${formatLabel}.`);
    }
  };

  const generatePreviewUrl = () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert('Please fix the following issues before previewing:\n\n' + validation.errors.join('\n'));
      return;
    }

    const quizUrl = encodeQuizToUrl(quiz);
    window.open(quizUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Import & Export</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExport}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          📤 Export Quiz
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📥 Import Quiz
        </button>

        <button
          onClick={generatePreviewUrl}
          className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          👀 Preview Quiz
        </button>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Export Quiz</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base64 Encoded Data
                  </label>
                  <textarea
                    value={exportData}
                    readOnly
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleCopyBase64}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      {copied ? '✓ Copied!' : '📋 Copy Base64'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shareable Quiz URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={encodeQuizToUrl(quiz)}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      {copied ? '✓' : '📋'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowExport(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Import Quiz</h3>

              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Import Format
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="importFormat"
                        value="base64"
                        checked={importFormat === 'base64'}
                        onChange={(e) => {
                          setImportFormat(e.target.value as 'base64' | 'json');
                          setImportData('');
                          setImportError('');
                        }}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      Base64 Encoded
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="importFormat"
                        value="json"
                        checked={importFormat === 'json'}
                        onChange={(e) => {
                          setImportFormat(e.target.value as 'base64' | 'json');
                          setImportData('');
                          setImportError('');
                        }}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      Raw JSON
                    </label>
                  </div>
                </div>

                {/* Data Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {importFormat === 'base64' ? 'Base64 Encoded Quiz Data' : 'Quiz JSON Data'}
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={importFormat === 'base64'
                      ? 'Paste your base64-encoded quiz data here...'
                      : 'Paste your raw JSON quiz data here...'}
                  />
                  {importError && (
                    <p className="text-red-600 text-sm mt-2 whitespace-pre-line">{importError}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Importing will replace your current quiz. Make sure to export your current work first if you want to keep it.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportData('');
                    setImportError('');
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Import Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}