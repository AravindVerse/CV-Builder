import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-2xl w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 space-y-6">
        
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-gray-100">Privacy Policy & Terms of Use</h1>
          <p className="text-gray-400 text-sm mt-1">Effective Date: July 2026</p>
        </div>

        <div className="space-y-4 text-gray-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
          <h2 className="text-lg font-bold text-gray-200">1. Ethical Usage Requirement</h2>
          <p>
            By activating and using CV Builder Studio, you agree that this software is provided strictly for professional and ethical usage. You agree not to use this application to falsify documents, misrepresent credentials, or engage in any deceitful practices.
          </p>

          <h2 className="text-lg font-bold text-gray-200">2. Liability Waiver</h2>
          <p>
            The creator of this application assumes strictly no liability for any misuse of this software. You, the user, are solely responsible for your actions, the data you input, and any personal or professional consequences arising from the use of this application.
          </p>

          <h2 className="text-lg font-bold text-gray-200">3. Data Privacy & Local Storage</h2>
          <p>
            Your CV data is saved locally on your device. The application sync wiht your applciation to cloud for license verification purposes.
          </p>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-800 flex justify-end">
          <Link 
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg px-6 py-2 transition-colors border border-gray-700"
          >
            Back to Activation
          </Link>
        </div>

      </div>
    </div>
  );
}