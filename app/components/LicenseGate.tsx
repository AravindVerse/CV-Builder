"use client";

import React, { useState, useEffect } from 'react';

export default function LicenseGate({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // We start in a loading state to hide the app while we check the cloud
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // The Boot Check: Runs every single time the app opens
  useEffect(() => {
    const verifyOnBoot = async () => {
      const savedKey = localStorage.getItem('cv_builder_key');
      
      // If they have no key saved, immediately show the lock screen
      if (!savedKey) {
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
        
        // Ping the local Python backend, which checks the HWID and pings the cloud
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: savedKey })
        });
        
        const data = await res.json();
        
        if (data.authorized) {
          setIsUnlocked(true);
        } else {
          // THE NUKE: Key is revoked, expired, or HWID mismatch. Wipe it immediately.
          localStorage.removeItem('cv_builder_key');
          setError(data.message || 'Your license has been revoked or expired.');
        }
      } catch (err) {
        // Strict Mode constraint: If they have no internet to verify, they stay locked out.
        setError('Internet connection required to verify your license on boot.');
      } finally {
        setLoading(false);
      }
    };

    verifyOnBoot();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    
    setVerifying(true);
    setError('');

    try {
      const API_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
      
      const res = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: key.trim() })
      });
      
      const data = await res.json();
      
      if (data.authorized) {
        // Save the valid key to check again on the next boot
        localStorage.setItem('cv_builder_key', key.trim());
        setIsUnlocked(true);
      } else {
        setError(data.message || 'Invalid License Key');
      }
    } catch (err) {
      setError('Could not connect to the verification server. Please check your internet connection.');
    } finally {
      setVerifying(false);
    }
  };

  // Full-screen loading UI during the Boot Check
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white font-sans">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-bold">Verifying License...</h2>
        <p className="text-gray-400 text-sm mt-2">Connecting to secure server</p>
      </div>
    );
  }

  // If unlocked, render the actual Resume Builder
  if (isUnlocked) return <>{children}</>;

  // If locked, render the Security Gate
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Product Activation</h1>
          <p className="text-gray-400 mt-2 text-sm">Enter your license key to unlock CV Builder Studio. This will permanently link to this device.</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">License Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="CV-XXXXXXXXXXXX"
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono tracking-widest placeholder-gray-600 transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 flex items-start gap-3">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <p className="text-sm text-red-300 leading-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || !key.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-300 text-white font-bold rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Verifying License...
              </>
            ) : (
              'Activate Device'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}