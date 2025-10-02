import { useState, useEffect } from "react";
import type { Quizz } from "../../types";
import {
  createEmptyQuiz,
  saveQuizToStorage,
  loadQuizFromStorage,
  clearStoredQuiz,
  validateQuiz,
} from "../../utils/editor";
import { Base64 } from "../../utils/b64";
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
        const decoded = Base64.decode(importData);
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
    <div className="min-h-screen bg-pattern-grid">
      {/* Header */}
      <header className="bg-black border-b-[4px] border-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                <a
                  href="/"
                  className="hover:text-cyber-yellow transition-colors"
                >
                  Quaestio
                </a>
                <span className="text-cyber-pink"> / Editor</span>
              </h1>
              {hasUnsavedChanges && (
                <span className="px-3 py-1 bg-cyber-yellow text-black border-brutal sharp text-xs font-black uppercase hidden md:inline">
                  ⚠ Unsaved
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="items-center text-sm text-white font-bold hidden md:flex">
                <input
                  type="checkbox"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="mr-2 w-5 h-5"
                />
                Auto-save
              </label>

              <button
                onClick={handleSaveManually}
                className="btn-brutal px-4 py-2 bg-cyber-green text-black sharp text-xs font-black hidden md:block"
              >
                💾 SAVE
              </button>

              <button
                onClick={handleNewQuiz}
                className="btn-brutal px-4 py-2 bg-cyber-blue text-white sharp text-xs font-black"
              >
                + NEW
              </button>

              <a
                href="/"
                className="btn-brutal px-4 py-2 bg-cyber-pink text-white sharp text-xs font-black"
              >
                ← HOME
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Validation Status */}
        {!validationStatus.isValid && (
          <div className="bg-cyber-pink border-brutal-thick p-6 mb-8 sharp animate-shake">
            <h3 className="text-white font-black mb-3 text-xl uppercase">
              ⚠️ Validation Issues
            </h3>
            <ul className="text-white font-bold text-sm space-y-2">
              {validationStatus.errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">▸</span>
                  <span>{error}</span>
                </li>
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
      <footer className="bg-black border-t-[4px] border-black mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-white font-bold text-sm">
                "{quiz.title}"
              </span>
              <span className="bg-cyber-blue text-white px-3 py-1 border-brutal sharp font-black text-xs">
                {quiz.questions.length} Q
              </span>
              {validationStatus.isValid && (
                <span className="bg-cyber-green text-black px-3 py-1 border-brutal sharp font-black text-xs">
                  ✓ VALID
                </span>
              )}
            </div>
            <div>
              {autoSaveEnabled ? (
                hasUnsavedChanges ? (
                  <span className="bg-cyber-yellow text-black px-3 py-1 border-brutal sharp font-black text-xs">
                    💾 Saving...
                  </span>
                ) : (
                  <span className="bg-cyber-green text-black px-3 py-1 border-brutal sharp font-black text-xs">
                    ✓ Saved
                  </span>
                )
              ) : (
                <span className="text-white font-bold text-xs uppercase">
                  Auto-save OFF
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
