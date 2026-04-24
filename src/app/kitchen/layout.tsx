import React from 'react';

export default function KitchenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-2xl font-serif font-bold text-amber-500">Kitchen Display System</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Live Queue</span>
          <a href="/login" className="text-sm text-gray-400 hover:text-white">Logout</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
