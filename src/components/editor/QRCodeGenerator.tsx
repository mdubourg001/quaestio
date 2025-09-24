import { useState } from "react";
import QRCode from "qrcode";
import type { Quizz } from "../../types";
import { encodeQuizToUrl } from "../../utils/quiz";
import { validateQuiz } from "../../utils/editor";

interface QRCodeGeneratorProps {
  quiz: Quizz;
}

export default function QRCodeGenerator({ quiz }: QRCodeGeneratorProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert(
        "Please fix the following issues before generating QR code:\n\n" +
          validation.errors.join("\n")
      );
      return;
    }

    setIsGenerating(true);

    try {
      const quizUrl = encodeQuizToUrl(quiz);
      console.log(quizUrl.length);

      // Check if URL is too long for QR codes (QR codes can handle up to ~4KB but we're conservative)
      if (quizUrl.length > 3000) {
        alert(
          "This quiz is too large to encode in a QR code. Please consider:\n\n" +
            "• Reducing the number of questions\n" +
            "• Shortening question text and options\n" +
            "• Removing optional fields like images or descriptions\n\n" +
            "You can still copy and share the URL directly using the 'Copy URL' button."
        );
        setIsGenerating(false);
        return;
      }

      // Generate QR code client-side as data URL
      const qrDataUrl = await QRCode.toDataURL(quizUrl, {
        // width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      setQRCodeUrl(qrDataUrl);
      setShowQRCode(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);

      // Check if it's specifically a data size error
      if (error instanceof Error && error.message.includes("too big")) {
        alert(
          "This quiz contains too much data for a QR code. Please try:\n\n" +
            "• Reducing the number of questions\n" +
            "• Shortening question text and answer options\n" +
            "• Removing images or long descriptions\n\n" +
            "You can still share the quiz by copying the URL directly."
        );
      } else {
        alert("Failed to generate QR code. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `${quiz.title.replace(/[^a-zA-Z0-9]/g, "_")}_qr.png`;
    link.click();
  };

  const copyUrl = async () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert(
        "Please fix the following issues before copying URL:\n\n" +
          validation.errors.join("\n")
      );
      return;
    }

    const quizUrl = encodeQuizToUrl(quiz);

    try {
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
      alert("Failed to copy URL to clipboard");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Share</h2>

      <p className="text-gray-600 mb-4">
        Generate a QR code for easy sharing of your quiz. Users can scan the
        code to instantly access your quiz.
      </p>

      <div className="flex gap-3">
        <button
          onClick={generateQRCode}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? <>⏳ Generating...</> : <>🔲 Generate QR Code</>}
        </button>

        <button
          onClick={copyUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? (
            <>
              <span className="mr-2">✓</span>
              Copied!
            </>
          ) : (
            <>📋 Copy URL</>
          )}
        </button>
      </div>

      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                QR Code for "{quiz.title}"
              </h3>

              <div className="mb-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for quiz"
                  className="mx-auto border border-gray-300 rounded-lg"
                  width={300}
                  height={300}
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code to access the quiz directly
              </p>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  📱 Download QR Code
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 pt-4 border-t text-left">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz URL:
                </label>
                <input
                  type="text"
                  value={encodeQuizToUrl(quiz)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
