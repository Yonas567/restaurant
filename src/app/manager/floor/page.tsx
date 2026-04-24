'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Table } from '@/lib/mockData';

export default function ManagerFloor() {
  const { tables, setTables, orders, staff } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [newWaiterId, setNewWaiterId] = useState('');

  const sections = ['Main Hall', 'Terrace', 'Private Room'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready_to_pay': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getWaiterName = (id?: string) => {
    return staff.find(s => s.id === id)?.name || 'Unassigned';
  };

  const getActiveOrder = (tableId: string) => {
    return orders.find(o => o.tableId === tableId && o.status !== 'paid');
  };

  const handleReassign = () => {
    if (!selectedTable || !newWaiterId) return;
    setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, waiterId: newWaiterId } : t));
    setShowReassignModal(false);
    setNewWaiterId('');
  };

  const handleCloseTable = () => {
    if (!selectedTable) return;
    if (confirm('Are you sure you want to force close this table?')) {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'available', guestCount: 0, seatedAt: undefined } : t));
      setSelectedTable(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Main Floor Map */}
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Floor Overview</h1>
        </div>

        {sections.map(section => {
          const sectionTables = tables.filter(t => t.section === section);
          if (sectionTables.length === 0) return null;

          return (
            <div key={section} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {section}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {sectionTables.map(table => (
                  <div 
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer hover:shadow-md transition-all flex flex-col items-center justify-center min-h-[120px] ${
                      selectedTable?.id === table.id ? 'ring-4 ring-amber-500 border-amber-500' : getStatusColor(table.status)
                    }`}
                  >
                    <div className="text-3xl font-bold mb-1">{table.number}</div>
                    <div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-2">
                      {table.status.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] bg-white/50 dark:bg-black/20 px-2 py-1 rounded-full font-medium truncate w-full text-center">
                      {getWaiterName(table.waiterId)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Table Details</h2>
          </div>
          
          {selectedTable ? (
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">T{selectedTable.number}</div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${getStatusColor(selectedTable.status)}`}>
                  {selectedTable.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Section</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedTable.section}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Waiter</span>
                  <span className="font-medium text-gray-900 dark:text-white">{getWaiterName(selectedTable.waiterId)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Guests</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedTable.guestCount || 0} / {selectedTable.capacity}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500">Seated At</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedTable.seatedAt || '--:--'}</span>
                </div>
              </div>

              {/* Active Order Summary */}
              {selectedTable.status !== 'available' && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Current Order</h3>
                  {getActiveOrder(selectedTable.id) ? (
                    <div className="space-y-2">
                      {getActiveOrder(selectedTable.id)?.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{item.quantity}x {item.name}</span>
                          <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${getActiveOrder(selectedTable.id)?.items.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No items ordered yet.</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <button 
                  onClick={() => setShowReassignModal(true)}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium rounded-lg transition-colors"
                >
                  Reassign Waiter
                </button>
                <button 
                  onClick={handleCloseTable}
                  className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 font-medium rounded-lg transition-colors"
                >
                  Force Close Table
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <span className="text-4xl block mb-4">👆</span>
              Select a table from the floor map to view details and actions.
            </div>
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reassign Table {selectedTable?.number}</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select New Waiter</label>
              <select 
                value={newWaiterId} 
                onChange={e => setNewWaiterId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Choose Waiter --</option>
                {staff.filter(s => s.role === 'waiter').map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowReassignModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleReassign} disabled={!newWaiterId} className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 rounded-lg text-sm font-medium transition-colors">Reassign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
