import { useState } from 'react';
import type { Quizz } from '../../types';
import { encodeQuizToUrl } from '../../utils/quiz';
import { validateQuiz } from '../../utils/editor';

interface QRCodeGeneratorProps {
  quiz: Quizz;
}

export default function QRCodeGenerator({ quiz }: QRCodeGeneratorProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQRCodeUrl] = useState('');

  const generateQRCode = () => {
    const validation = validateQuiz(quiz);
    if (!validation.isValid) {
      alert('Please fix the following issues before generating QR code:\n\n' + validation.errors.join('\n'));
      return;
    }

    const quizUrl = encodeQuizToUrl(quiz);

    // Using QR Server API (free service)
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(quizUrl)}`;

    setQRCodeUrl(qrApiUrl);
    setShowQRCode(true);
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}_qr.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">QR Code Generator</h2>

      <p className="text-gray-600 mb-4">
        Generate a QR code for easy sharing of your quiz. Users can scan the code to instantly access your quiz.
      </p>

      <button
        onClick={generateQRCode}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        🔲 Generate QR Code
      </button>

      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-4">QR Code for "{quiz.title}"</h3>

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