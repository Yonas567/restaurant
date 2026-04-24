'use client';

import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRestaurant } from '@/context/RestaurantContext';

const demoData = {
  today: {
    revenue: [
      { time: '10:00', amount: 120 }, { time: '12:00', amount: 450 },
      { time: '14:00', amount: 890 }, { time: '16:00', amount: 320 },
      { time: '18:00', amount: 650 }, { time: '20:00', amount: 1200 },
      { time: '22:00', amount: 840 },
    ],
    items: [
      { name: 'Ribeye Steak', sales: 15 },
      { name: 'Grilled Salmon', sales: 12 },
      { name: 'Pasta Carbonara', sales: 24 },
      { name: 'House Red Wine', sales: 30 },
    ],
    stats: { revenue: 4470, orders: 86, avgOrder: 52 }
  },
  week: {
    revenue: [
      { time: 'Mon', amount: 3200 }, { time: 'Tue', amount: 2800 },
      { time: 'Wed', amount: 3500 }, { time: 'Thu', amount: 4100 },
      { time: 'Fri', amount: 5800 }, { time: 'Sat', amount: 6200 },
      { time: 'Sun', amount: 4900 },
    ],
    items: [
      { name: 'Ribeye Steak', sales: 85 },
      { name: 'Grilled Salmon', sales: 92 },
      { name: 'Pasta Carbonara', sales: 145 },
      { name: 'House Red Wine', sales: 210 },
    ],
    stats: { revenue: 30500, orders: 580, avgOrder: 52.5 }
  },
  month: {
    revenue: [
      { time: 'Week 1', amount: 28000 }, { time: 'Week 2', amount: 31000 },
      { time: 'Week 3', amount: 29500 }, { time: 'Week 4', amount: 34000 },
    ],
    items: [
      { name: 'Ribeye Steak', sales: 340 },
      { name: 'Grilled Salmon', sales: 380 },
      { name: 'Pasta Carbonara', sales: 620 },
      { name: 'House Red Wine', sales: 850 },
    ],
    stats: { revenue: 122500, orders: 2340, avgOrder: 52.3 }
  }
};

export default function ReportsAnalytics() {
  const { staff } = useRestaurant();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  
  const currentData = demoData[dateRange];

  const handleExportCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Revenue', `$${currentData.stats.revenue}`],
      ['Total Orders', currentData.stats.orders],
      ['Average Order Value', `$${currentData.stats.avgOrder}`],
      ['', ''],
      ['Top Items', 'Sales'],
      ...currentData.items.map(i => [i.name, i.sales])
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `restaurant_report_${dateRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Reports & Analytics</h1>
        
        <div className="flex gap-4">
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            <button onClick={() => setDateRange('today')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${dateRange === 'today' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}>Today</button>
            <button onClick={() => setDateRange('week')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${dateRange === 'week' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}>This Week</button>
            <button onClick={() => setDateRange('month')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${dateRange === 'month' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}>This Month</button>
          </div>
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Revenue</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">${currentData.stats.revenue.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Orders</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{currentData.stats.orders.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Avg Order Value</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">${currentData.stats.avgOrder.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                <Line type="monotone" dataKey="amount" stroke="#d97706" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Selling Items</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.items} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} cursor={{ fill: '#f3f4f6', opacity: 0.1 }} />
                <Bar dataKey="sales" fill="#d97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Waiter Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Waiter Performance</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Waiter</th>
              <th className="px-6 py-4 font-medium">Tables Served</th>
              <th className="px-6 py-4 font-medium">Total Sales</th>
              <th className="px-6 py-4 font-medium">Avg Table Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {staff.filter(s => s.role === 'waiter').map((waiter, i) => {
              // Fake numbers based on index for demo
              const tablesServed = dateRange === 'today' ? 8 + i * 2 : dateRange === 'week' ? 45 + i * 10 : 180 + i * 40;
              const sales = tablesServed * (45 + i * 5);
              return (
                <tr key={waiter.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{waiter.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{tablesServed}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">${sales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">${(sales / tablesServed).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
