'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { MenuItem } from '@/lib/mockData';

export default function MenuManagement() {
  const { menuCategories, menuItems, setMenuItems } = useRestaurant();
  
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isAvailable: true
  });

  const filteredItems = menuItems.filter(m => m.categoryId === activeCategory);

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        categoryId: item.categoryId,
        isAvailable: item.isAvailable
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: activeCategory,
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setMenuItems(prev => prev.map(i => i.id === editingItem.id ? {
        ...i,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable
      } : i));
    } else {
      setMenuItems(prev => [...prev, {
        id: `m_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        isAvailable: formData.isAvailable
      }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const toggleAvailability = (id: string) => {
    setMenuItems(prev => prev.map(i => i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Menu Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          + Add New Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
          {menuCategories.map(cat => {
            const count = menuItems.filter(m => m.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  activeCategory === cat.id 
                    ? 'bg-amber-50 border-l-4 border-amber-600 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400' 
                    : 'bg-white border-l-4 border-transparent text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{cat.name}</span>
                <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-xs py-1 px-2 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Items List */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Item Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleAvailability(item.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="text-amber-600 hover:text-amber-800 font-medium text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No items in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  rows={2} required
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
                  <input 
                    type="number" step="0.01" min="0" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select 
                    value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {menuCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <input 
                  type="checkbox" id="isAvailable"
                  checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                  className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="isAvailable" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Item is available</label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
