import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:block">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-serif font-bold text-gray-800 dark:text-white">Admin Panel</h2>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/admin/dashboard" className="block px-4 py-2 rounded-md bg-amber-50 text-amber-700 font-medium">Dashboard</a>
          <a href="/admin/menu" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Menu</a>
          <a href="/admin/tables" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Tables</a>
          <a href="/admin/staff" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Staff</a>
          <a href="/admin/inventory" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Inventory</a>
          <a href="/admin/crm" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">CRM</a>
          <a href="/admin/reports" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Reports</a>
          <a href="/admin/settings" className="block px-4 py-2 rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">Settings</a>
          <a href="/login" className="block px-4 py-2 mt-8 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
