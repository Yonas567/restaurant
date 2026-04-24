'use client';

import React from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const revenueData = [
  { name: '1st', revenue: 4000 }, { name: '5th', revenue: 3000 },
  { name: '10th', revenue: 2000 }, { name: '15th', revenue: 2780 },
  { name: '20th', revenue: 1890 }, { name: '25th', revenue: 2390 },
  { name: '30th', revenue: 3490 },
];

const topItemsData = [
  { name: 'Ribeye Steak', sales: 120 },
  { name: 'Grilled Salmon', sales: 98 },
  { name: 'Pasta Carbonara', sales: 86 },
  { name: 'Tiramisu', sales: 65 },
  { name: 'Bruschetta', sales: 54 },
];

export default function DashboardStats() {
  const { tables, orders, inventory } = useRestaurant();

  const activeTables = tables.filter(t => t.status !== 'available').length;
  const activeOrders = orders.filter(o => o.status !== 'paid').length;
  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStockLevel).length;
  
  // Demo hardcoded revenue
  const todayRevenue = 2450.50;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Today's Revenue</h3>
            <span className="p-2 bg-green-100 text-green-600 rounded-lg">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">${todayRevenue.toFixed(2)}</div>
          <p className="text-sm text-green-600 mt-2">+12.5% from yesterday</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Orders</h3>
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">📋</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeOrders}</div>
          <p className="text-sm text-gray-500 mt-2">Currently in progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Occupied Tables</h3>
            <span className="p-2 bg-amber-100 text-amber-600 rounded-lg">🪑</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeTables} / {tables.length}</div>
          <p className="text-sm text-gray-500 mt-2">{Math.round((activeTables / tables.length) * 100)}% capacity</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Stock Alerts</h3>
            <span className="p-2 bg-red-100 text-red-600 rounded-lg">⚠️</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{lowStockItems}</div>
          <p className="text-sm text-red-600 mt-2">Items need reordering</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Selling Items</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  cursor={{ fill: '#f3f4f6', opacity: 0.1 }}
                />
                <Bar dataKey="sales" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { time: '10 mins ago', text: 'Table 4 paid their bill ($145.50)', icon: '💵', color: 'bg-green-100' },
            { time: '15 mins ago', text: 'New reservation added for 8 PM (4 guests)', icon: '📅', color: 'bg-blue-100' },
            { time: '32 mins ago', text: 'Low stock alert: Salmon Fillet', icon: '⚠️', color: 'bg-red-100' },
            { time: '1 hour ago', text: 'Chef Marco started their shift', icon: '👨‍🍳', color: 'bg-purple-100' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${activity.color}`}>
                {activity.icon}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">{activity.text}</p>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
