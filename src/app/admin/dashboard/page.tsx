import React from 'react';
import DashboardStats from '@/components/dashboard/DashboardStats';

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">System overview and analytics.</p>
      </div>
      <DashboardStats />
    </div>
  );
}
