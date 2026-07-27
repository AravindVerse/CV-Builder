import React from 'react';

export default function PointerStudioPage() {
  return (
    <div className="min-h-screen bg-[#0b1220]">
      {/* 
        The iframe isolates the vanilla JavaScript from React's Virtual DOM.
        This prevents hydration errors and state conflicts while making it 
        feel like a native part of the app.
      */}
      <iframe 
        src="/cv_pointer_studio.html" 
        className="w-full h-screen border-none"
        title="CV Pointer Studio"
      />
    </div>
  );
}