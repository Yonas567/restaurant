import React from 'react';

export default function WaiterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-serif font-bold text-amber-700">Waiter Tablet</h2>
        <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">Logout</a>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur dark:bg-gray-800/95 border-t border-gray-200 dark:border-gray-700 flex justify-around p-3">
        <a href="/waiter/dashboard" className="flex flex-col items-center text-gray-500 hover:text-amber-600 transition-colors">
          <span className="text-xl">📊</span>
          <span className="text-xs font-medium mt-1">Board</span>
        </a>
        <a href="/waiter/notifications" className="flex flex-col items-center text-gray-500 hover:text-amber-600 transition-colors">
          <span className="text-xl">💳</span>
          <span className="text-xs font-medium mt-1">Sent to Cashier</span>
        </a>
      </nav>
    </div>
  );
}
