'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function SettingsPage() {
  const { settings, setSettings } = useRestaurant();
  const [formData, setFormData] = useState(settings);
  const [showToast, setShowToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity">
          Settings saved successfully!
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif mb-6">Restaurant Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Information</h2>
          <p className="text-sm text-gray-500">Update your restaurant's basic details and operational settings.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Restaurant Name</label>
              <input 
                type="text" required
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <input 
                type="text" required
                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
              <select 
                value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax Rate (%)</label>
              <input 
                type="number" step="0.1" min="0" required
                value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-colors"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
