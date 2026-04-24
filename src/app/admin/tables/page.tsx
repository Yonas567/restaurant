'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Table } from '@/lib/mockData';

export default function TableManagement() {
  const { tables, setTables } = useRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    number: 1,
    capacity: 4,
    section: 'Main Hall' as 'Main Hall' | 'Terrace' | 'Private Room'
  });

  const sections = ['Main Hall', 'Terrace', 'Private Room'];

  const handleOpenModal = (table?: Table) => {
    if (table) {
      setEditingTable(table);
      setFormData({
        number: table.number,
        capacity: table.capacity,
        section: table.section
      });
    } else {
      setEditingTable(null);
      setFormData({
        number: Math.max(...tables.map(t => t.number)) + 1,
        capacity: 4,
        section: 'Main Hall'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? {
        ...t,
        number: formData.number,
        capacity: formData.capacity,
        section: formData.section
      } : t));
    } else {
      setTables(prev => [...prev, {
        id: `t_${Date.now()}`,
        number: formData.number,
        capacity: formData.capacity,
        section: formData.section,
        status: 'available'
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setTables(prev => prev.filter(t => t.id !== id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready_to_pay': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Table & Floor Map</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          + Add New Table
        </button>
      </div>

      <div className="space-y-8">
        {sections.map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {section}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {sectionTables.map(table => (
                  <div 
                    key={table.id}
                    onClick={() => handleOpenModal(table)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[120px] ${getStatusColor(table.status)}`}
                  >
                    <div className="text-3xl font-bold mb-1">{table.number}</div>
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80">
                      {table.status.replace(/_/g, ' ')}
                    </div>
                    <div className="absolute top-2 right-2 text-xs font-bold opacity-50">
                      {table.capacity} 🪑
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Table Number</label>
                  <input 
                    type="number" min="1" required
                    value={formData.number} onChange={e => setFormData({...formData, number: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (Seats)</label>
                  <input 
                    type="number" min="1" required
                    value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                <select 
                  value={formData.section} onChange={e => setFormData({...formData, section: e.target.value as any})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                {editingTable ? (
                  <button type="button" onClick={() => { handleDelete(editingTable.id); setIsModalOpen(false); }} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Delete Table</button>
                ) : <div></div>}
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">Save Table</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
