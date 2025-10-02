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
    <div className="bg-white border-brutal-thick shadow-brutal p-6 sharp">
      <div className="inline-block bg-cyber-pink px-4 py-2 border-brutal mb-6">
        <h2 className="text-xl font-black text-white uppercase">Share</h2>
      </div>

      <p className="text-black font-bold mb-6 text-sm">
        Generate a QR code for easy sharing. Users scan to instantly access your
        quiz.
      </p>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={generateQRCode}
          disabled={isGenerating}
          className="btn-brutal px-5 py-3 bg-cyber-purple text-white sharp text-sm disabled:opacity-50"
        >
          {isGenerating ? <>⏳ GENERATING...</> : <>🔲 QR CODE</>}
        </button>

        <button
          onClick={copyUrl}
          className="btn-brutal px-5 py-3 bg-cyber-blue text-white sharp text-sm"
        >
          {copied ? <>✓ COPIED!</> : <>📋 COPY URL</>}
        </button>
      </div>

      {showQRCode && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-brutal-thick shadow-brutal-hover max-w-lg w-full sharp animate-bounce-in">
            <div className="bg-black p-4 border-b-[3px] border-black">
              <h3 className="text-xl font-black text-cyber-pink uppercase text-center">
                QR Code: {quiz.title}
              </h3>
            </div>

            <div className="p-8 text-center">
              <div className="mb-6 inline-block border-brutal-thick bg-white p-4">
                <img
                  src={qrCodeUrl}
                  alt="QR Code for quiz"
                  className="mx-auto"
                  width={300}
                  height={300}
                />
              </div>

              <p className="text-sm text-black font-bold mb-6 bg-cyber-yellow px-4 py-2 inline-block border-brutal uppercase tracking-wide">
                📱 Scan to access quiz
              </p>

              <div className="flex justify-center gap-3 mb-6">
                <button
                  onClick={downloadQRCode}
                  className="btn-brutal px-5 py-3 bg-cyber-green text-black sharp text-sm"
                >
                  💾 DOWNLOAD
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="btn-brutal px-5 py-3 bg-black text-white sharp text-sm"
                >
                  CLOSE
                </button>
              </div>

              <div className="pt-6 border-t-[3px] border-black text-left">
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Quiz URL:
                </label>
                <input
                  type="text"
                  value={encodeQuizToUrl(quiz)}
                  readOnly
                  className="w-full px-4 py-3 border-brutal sharp bg-gray-light text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
