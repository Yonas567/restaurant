import React from 'react';

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-serif font-bold text-amber-700">POS System</h2>
          <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">Logout</a>
        </div>
        <nav className="flex px-6 space-x-8">
          <a href="/cashier" className="pb-3 border-b-2 border-amber-600 text-amber-600 font-medium">POS Board</a>
          <a href="/cashier/end-of-day" className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">Reports</a>
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
