import { useState } from "react";
import type { Quizz } from "../../types";
import { encodeQuizToUrl } from "../../utils/quiz";
import { validateQuiz } from "../../utils/editor";
import { Base64 } from "../../utils/b64";

interface ImportExportProps {
  quiz: Quizz;
  onImport: (quiz: Quizz) => void;
}

export default function ImportExport({ quiz, onImport }: ImportExportProps) {
  const [exportData, setExportData] = useState("");
  const [jsonExportData, setJsonExportData] = useState("");
  const [importData, setImportData] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState("");
  const [importFormat, setImportFormat] = useState<"base64" | "json">("base64");
  const [exportFormat, setExportFormat] = useState<"base64" | "json">("base64");

  const handleExport = () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert(
        "Please fix the following issues before exporting:\n\n" +
          validation.errors.join("\n")
      );
      return;
    }

    const jsonData = JSON.stringify(quiz, null, 2);
    const base64Data = Base64.encode(jsonData);

    setJsonExportData(jsonData);
    setExportData(base64Data);
    setShowExport(true);
  };

  const handleCopyExportData = async () => {
    try {
      const dataToCopy =
        exportFormat === "base64" ? exportData : jsonExportData;
      await navigator.clipboard.writeText(dataToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      const quizUrl = encodeQuizToUrl(quiz);
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleImport = () => {
    setImportError("");

    if (!importData.trim()) {
      const formatLabel = importFormat === "base64" ? "base64" : "JSON";
      setImportError(`Please enter ${formatLabel} data to import`);
      return;
    }

    try {
      let importedQuiz: Quizz;

      if (importFormat === "base64") {
        // Handle base64 format
        try {
          const decoded = Base64.decode(importData.trim());
          importedQuiz = JSON.parse(decoded) as Quizz;
        } catch (decodeErr) {
          setImportError(
            "Failed to decode base64 data. Please check that the data is valid base64-encoded."
          );
          return;
        }
      } else {
        // Handle JSON format
        try {
          importedQuiz = JSON.parse(importData.trim()) as Quizz;
        } catch (parseErr) {
          setImportError(
            "Failed to parse JSON data. Please check that the JSON is valid."
          );
          return;
        }
      }

      const validation = validateQuiz(importedQuiz);
      if (!validation.isValid) {
        setImportError("Invalid quiz data:\n" + validation.errors.join("\n"));
        return;
      }

      onImport(importedQuiz);
      setImportData("");
      setShowImport(false);
      alert("Quiz imported successfully!");
    } catch (err) {
      const formatLabel =
        importFormat === "base64" ? "base64-encoded JSON" : "JSON";
      setImportError(
        `Failed to import quiz. Please check that the data is valid ${formatLabel}.`
      );
    }
  };

  const generatePreviewUrl = () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert(
        "Please fix the following issues before previewing:\n\n" +
          validation.errors.join("\n")
      );
      return;
    }

    const quizUrl = encodeQuizToUrl(quiz);
    window.open(quizUrl, "_blank");
  };

  return (
    <div className="bg-white border-brutal-thick shadow-brutal p-6 sharp">
      <div className="inline-block bg-cyber-green px-4 py-2 border-brutal mb-6">
        <h2 className="text-xl font-black text-black uppercase">Import & Export</h2>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleExport}
          className="btn-brutal px-5 py-3 bg-cyber-blue text-white sharp text-sm"
        >
          📤 EXPORT
        </button>

        <button
          onClick={() => setShowImport(true)}
          className="btn-brutal px-5 py-3 bg-cyber-purple text-white sharp text-sm"
        >
          📥 IMPORT
        </button>

        <button
          onClick={generatePreviewUrl}
          className="btn-brutal px-5 py-3 bg-cyber-pink text-white sharp text-sm"
        >
          👀 PREVIEW
        </button>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-brutal-thick shadow-brutal-hover max-w-2xl w-full sharp animate-bounce-in">
            <div className="bg-black p-4 border-b-[3px] border-black">
              <h3 className="text-xl font-black text-cyber-yellow uppercase">
                Export Quiz
              </h3>
            </div>
            <div className="p-6">

              <div className="space-y-4">
                {/* Export Format Selection */}
                <div>
                  <label className="block text-xs font-black text-black mb-3 uppercase tracking-wide">
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center bg-cyber-blue text-white px-4 py-2 border-brutal sharp cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="base64"
                        checked={exportFormat === "base64"}
                        onChange={(e) =>
                          setExportFormat(e.target.value as "base64" | "json")
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span className="font-black text-sm">Base64</span>
                    </label>
                    <label className="flex items-center bg-cyber-purple text-white px-4 py-2 border-brutal sharp cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        value="json"
                        checked={exportFormat === "json"}
                        onChange={(e) =>
                          setExportFormat(e.target.value as "base64" | "json")
                        }
                        className="mr-2 w-4 h-4"
                      />
                      <span className="font-black text-sm">JSON</span>
                    </label>
                  </div>
                </div>

                {/* Export Data Display */}
                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                    {exportFormat === "base64"
                      ? "Base64 Data"
                      : "JSON Data"}
                  </label>
                  <textarea
                    value={
                      exportFormat === "base64" ? exportData : jsonExportData
                    }
                    readOnly
                    rows={8}
                    className="w-full px-4 py-3 border-brutal sharp bg-gray-light font-mono text-sm font-bold resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleCopyExportData}
                      className="btn-brutal px-4 py-2 bg-cyber-green text-black sharp text-xs"
                    >
                      {copied
                        ? "✓ COPIED!"
                        : `📋 COPY ${exportFormat === "base64" ? "BASE64" : "JSON"}`}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                    Shareable URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={encodeQuizToUrl(quiz)}
                      readOnly
                      className="flex-1 px-4 py-3 border-brutal sharp bg-gray-light text-sm font-bold"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="btn-brutal px-4 py-3 bg-cyber-yellow text-black sharp text-sm font-black"
                    >
                      {copied ? "✓" : "📋"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t-[3px] border-black">
                <button
                  onClick={() => setShowExport(false)}
                  className="btn-brutal px-5 py-3 bg-black text-white sharp text-sm"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-brutal-thick shadow-brutal-hover max-w-2xl w-full sharp animate-bounce-in">
            <div className="bg-black p-4 border-b-[3px] border-black">
              <h3 className="text-xl font-black text-cyber-green uppercase">
                Import Quiz
              </h3>
            </div>
            <div className="p-6">

              <div className="space-y-4">
                {/* Format Selection */}
                <div>
                  <label className="block text-xs font-black text-black mb-3 uppercase tracking-wide">
                    Import Format
                  </label>
                  <div className="flex gap-3">
                    <label className="flex items-center bg-cyber-blue text-white px-4 py-2 border-brutal sharp cursor-pointer">
                      <input
                        type="radio"
                        name="importFormat"
                        value="base64"
                        checked={importFormat === "base64"}
                        onChange={(e) => {
                          setImportFormat(e.target.value as "base64" | "json");
                          setImportData("");
                          setImportError("");
                        }}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="font-black text-sm">Base64</span>
                    </label>
                    <label className="flex items-center bg-cyber-purple text-white px-4 py-2 border-brutal sharp cursor-pointer">
                      <input
                        type="radio"
                        name="importFormat"
                        value="json"
                        checked={importFormat === "json"}
                        onChange={(e) => {
                          setImportFormat(e.target.value as "base64" | "json");
                          setImportData("");
                          setImportError("");
                        }}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="font-black text-sm">JSON</span>
                    </label>
                  </div>
                </div>

                {/* Data Input */}
                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                    {importFormat === "base64"
                      ? "Base64 Data"
                      : "JSON Data"}
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border-brutal sharp bg-white font-mono text-sm font-bold resize-none focus:outline-none focus:shadow-brutal"
                    placeholder={
                      importFormat === "base64"
                        ? "Paste base64 data here..."
                        : "Paste JSON data here..."
                    }
                  />
                  {importError && (
                    <p className="text-cyber-pink font-bold text-sm mt-2 whitespace-pre-line bg-cyber-pink bg-opacity-10 p-2 border-brutal">
                      ⚠ {importError}
                    </p>
                  )}
                </div>

                <div className="bg-cyber-yellow border-brutal-thick p-4 sharp">
                  <p className="text-sm text-black font-bold">
                    ⚠ <span className="font-black">WARNING:</span> Importing will replace your
                    current quiz. Export first if you want to keep it!
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t-[3px] border-black">
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportData("");
                    setImportError("");
                  }}
                  className="btn-brutal px-5 py-3 bg-white text-black sharp text-sm"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleImport}
                  className="btn-brutal px-5 py-3 bg-cyber-green text-black sharp text-sm"
                >
                  IMPORT QUIZ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
