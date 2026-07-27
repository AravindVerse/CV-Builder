import Link from 'next/link';
import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10 mt-8">
          <h1 className="text-3xl font-bold text-gray-100">Application Dashboard</h1>
          <p className="text-gray-400 mt-2">Select a module to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Builder Link */}
          <Link 
            href="/" 
            className="block p-8 bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all group"
          >
            <div className="w-12 h-12 bg-blue-900/30 text-blue-500 rounded-lg flex items-center justify-center mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">CV Builder Studio</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Access the main drag-and-drop workspace to build and manage your Master CV.</p>
          </Link>

          {/* Pointer Studio Prototype Link */}
          <Link 
            href="/pointer-studio" 
            className="block p-8 bg-gray-900 border border-gray-800 rounded-2xl hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all group"
          >
            <div className="w-12 h-12 bg-green-900/30 text-green-500 rounded-lg flex items-center justify-center mb-4 border border-green-500/30 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09l2.846.813-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-100 mb-2">Pointer Studio (Beta)</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Launch the AI-powered bullet rewriter, achievement miner, and defensibility coach.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}