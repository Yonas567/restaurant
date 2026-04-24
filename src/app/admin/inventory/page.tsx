'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function InventoryManagement() {
  const { inventory, setInventory } = useRestaurant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number | ''>('');
  const [poHistory, setPoHistory] = useState<any[]>([]);
  const [showPoModal, setShowPoModal] = useState(false);
  const [poForm, setPoForm] = useState({ itemId: '', quantity: 10, expectedDate: '' });

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustAmount === '') return;
    
    setInventory(prev => prev.map(i => i.id === selectedItem.id ? {
      ...i,
      currentStock: Number(adjustAmount)
    } : i));
    
    setIsModalOpen(false);
    setSelectedItem(null);
    setAdjustAmount('');
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.itemId) return;
    
    const item = inventory.find(i => i.id === poForm.itemId);
    if (!item) return;

    setPoHistory([{
      id: `po_${Date.now()}`,
      itemName: item.name,
      quantity: poForm.quantity,
      unit: item.unit,
      totalCost: poForm.quantity * item.costPerUnit,
      date: new Date().toLocaleDateString(),
      expectedDate: poForm.expectedDate,
      status: 'Ordered'
    }, ...poHistory]);

    setShowPoModal(false);
    setPoForm({ itemId: '', quantity: 10, expectedDate: '' });
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { label: 'Low Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (current <= min * 1.5) return { label: 'Reorder Soon', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Inventory Management</h1>
        <button 
          onClick={() => setShowPoModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          + Create Purchase Order
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Stock Levels</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Ingredient</th>
                <th className="px-6 py-4 font-medium">Stock Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Cost / Unit</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.map(item => {
                const status = getStockStatus(item.currentStock, item.minStockLevel);
                const percent = Math.min(100, Math.max(0, (item.currentStock / (item.minStockLevel * 3)) * 100));
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-xs text-gray-500">Min: {item.minStockLevel} {item.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white w-16">{item.currentStock} {item.unit}</span>
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${status.label === 'Low Stock' ? 'bg-red-500' : status.label === 'Reorder Soon' ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      ${item.costPerUnit.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setSelectedItem(item); setAdjustAmount(item.currentStock); setIsModalOpen(true); }}
                        className="text-amber-600 hover:text-amber-800 font-medium text-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO History */}
      {poHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Purchase Orders</h2>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">PO ID</th>
                <th className="px-6 py-4 font-medium">Item</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Total Cost</th>
                <th className="px-6 py-4 font-medium">Expected Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {poHistory.map(po => (
                <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">#{po.id.slice(-6)}</td>
                  <td className="px-6 py-4">{po.itemName}</td>
                  <td className="px-6 py-4">{po.quantity} {po.unit}</td>
                  <td className="px-6 py-4 font-medium">${po.totalCost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-500">{po.expectedDate}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">{po.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Adjust Stock: {selectedItem.name}</h3>
            <p className="text-sm text-gray-500 mb-6">Current: {selectedItem.currentStock} {selectedItem.unit}</p>
            
            <form onSubmit={handleAdjustStock}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Stock Level ({selectedItem.unit})</label>
                <input 
                  type="number" step="0.1" min="0" required
                  value={adjustAmount} onChange={e => setAdjustAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Create Purchase Order</h3>
            
            <form onSubmit={handleCreatePO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Item</label>
                <select 
                  required
                  value={poForm.itemId} onChange={e => setPoForm({...poForm, itemId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Choose Ingredient --</option>
                  {inventory.map(i => (
                    <option key={i.id} value={i.id}>{i.name} (${i.costPerUnit}/{i.unit})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                  <input 
                    type="number" min="1" required
                    value={poForm.quantity} onChange={e => setPoForm({...poForm, quantity: Number(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Date</label>
                  <input 
                    type="date" required
                    value={poForm.expectedDate} onChange={e => setPoForm({...poForm, expectedDate: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
              </div>
              
              {poForm.itemId && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mt-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Estimated Total Cost:</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      ${(poForm.quantity * (inventory.find(i => i.id === poForm.itemId)?.costPerUnit || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button type="button" onClick={() => setShowPoModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">Create PO</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
