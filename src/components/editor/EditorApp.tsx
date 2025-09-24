import { useState, useEffect } from "react";
import type { Quizz } from "../../types";
import {
  createEmptyQuiz,
  saveQuizToStorage,
  loadQuizFromStorage,
  clearStoredQuiz,
  validateQuiz,
} from "../../utils/editor";
import QuizConfigEditor from "./QuizConfigEditor";
import QuestionList from "./QuestionList";
import ImportExport from "./ImportExport";
import QRCodeGenerator from "./QRCodeGenerator";

export default function EditorApp() {
  const [quiz, setQuiz] = useState<Quizz>(createEmptyQuiz());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Load quiz from URL import parameter or localStorage on mount
  useEffect(() => {
    // Check for import parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const importData = urlParams.get("import");

    if (importData) {
      try {
        const decoded = atob(importData);
        const importedQuiz = JSON.parse(decoded) as Quizz;
        setQuiz(importedQuiz);
        setHasUnsavedChanges(true);
        console.log("Imported quiz from URL parameter");

        // Clear the URL parameter after import
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      } catch (error) {
        console.error("Failed to import quiz from URL:", error);
      }
    }

    // Fallback to localStorage
    const savedQuiz = loadQuizFromStorage();
    if (savedQuiz) {
      setQuiz(savedQuiz);
      console.log("Loaded quiz from localStorage");
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveQuizToStorage(quiz);
        setHasUnsavedChanges(false);
        console.log("Auto-saved quiz to localStorage");
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [quiz, hasUnsavedChanges, autoSaveEnabled]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleQuizUpdate = (updatedQuiz: Quizz) => {
    setQuiz(updatedQuiz);
    setHasUnsavedChanges(true);
  };

  const handleQuestionsChange = (questions: typeof quiz.questions) => {
    const updatedQuiz = { ...quiz, questions };
    setQuiz(updatedQuiz);
    setHasUnsavedChanges(true);
  };

  const handleImport = (importedQuiz: Quizz) => {
    setQuiz(importedQuiz);
    setHasUnsavedChanges(true);
  };

  const handleSaveManually = () => {
    saveQuizToStorage(quiz);
    setHasUnsavedChanges(false);
    alert("Quiz saved to local storage!");
  };

  const handleNewQuiz = () => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          "You have unsaved changes. Creating a new quiz will lose your current work. Continue?"
        )
      ) {
        return;
      }
    }

    setQuiz(createEmptyQuiz());
    clearStoredQuiz();
    setHasUnsavedChanges(false);
  };

  const getValidationStatus = () => {
    const validation = validateQuiz(quiz);
    return validation;
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <a href="/">Quaestio</a> - Editor
              </h1>
              {hasUnsavedChanges && (
                <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="mr-2"
                  />
                  Auto-save
                </label>
              </div>

              <button
                onClick={handleSaveManually}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                💾 Save
              </button>

              <button
                onClick={handleNewQuiz}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                📄 New Quiz
              </button>

              <a
                href="/"
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                🏠 Home
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Status */}
        {!validationStatus.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">
              ⚠️ Validation Issues
            </h3>
            <ul className="text-red-700 text-sm space-y-1">
              {validationStatus.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-8">
          {/* Quiz Configuration */}
          <QuizConfigEditor quiz={quiz} onUpdate={handleQuizUpdate} />

          {/* Questions Management */}
          <QuestionList
            questions={quiz.questions}
            onQuestionsChange={handleQuestionsChange}
          />

          {/* Import/Export and QR Code */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImportExport quiz={quiz} onImport={handleImport} />

            <QRCodeGenerator quiz={quiz} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              Quiz: "{quiz.title}" • {quiz.questions.length} question
              {quiz.questions.length !== 1 ? "s" : ""}
              {validationStatus.isValid && (
                <span className="text-green-600 ml-2">✓ Valid</span>
              )}
            </div>
            <div>
              {autoSaveEnabled ? (
                hasUnsavedChanges ? (
                  <span className="text-yellow-600">Auto-saving...</span>
                ) : (
                  <span className="text-green-600">Saved</span>
                )
              ) : (
                <span className="text-gray-500">Auto-save disabled</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
