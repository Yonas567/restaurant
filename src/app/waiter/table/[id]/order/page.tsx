'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRestaurant } from '@/context/RestaurantContext';

interface CartItem {
  id: string; // unique cart item id
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

export default function OrderScreen() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  
  const { tables, menuCategories, menuItems, orders, setOrders } = useRestaurant();
  const table = tables.find(t => t.id === tableId);
  
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  if (!table) return <div className="p-4">Table not found</div>;

  const handleAddToCart = (item: any) => {
    if (!item.isAvailable) return;
    
    // Check if item already exists in cart without notes
    const existingIndex = cart.findIndex(c => c.menuItemId === item.id && c.notes === '');
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, {
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const updateCartItem = (id: string, field: keyof CartItem, value: any) => {
    setCart(cart.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;

    // Find active order or create new one
    const existingOrderIndex = orders.findIndex(o => o.tableId === tableId && o.status !== 'paid');
    
    const newOrderItems = cart.map(c => ({
      id: `oi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      menuItemId: c.menuItemId,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
      notes: c.notes,
      status: 'pending' as const
    }));

    if (existingOrderIndex >= 0) {
      const updatedOrders = [...orders];
      updatedOrders[existingOrderIndex] = {
        ...updatedOrders[existingOrderIndex],
        status: 'sent_to_kitchen',
        items: [...updatedOrders[existingOrderIndex].items, ...newOrderItems]
      };
      setOrders(updatedOrders);
    } else {
      setOrders([...orders, {
        id: `o_${Date.now()}`,
        tableId,
        waiterId: table.waiterId || '3',
        status: 'sent_to_kitchen',
        items: newOrderItems
      }]);
    }

    router.push(`/waiter/table/${tableId}`);
  };

  const filteredItems = menuItems.filter(m => m.categoryId === activeCategory);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -m-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white font-serif">Table {table.number} Order</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Categories */}
          <div className="flex overflow-x-auto p-4 gap-2 no-scrollbar bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            {menuCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item)}
                  className={`relative bg-white dark:bg-gray-800 p-4 rounded-xl border ${
                    item.isAvailable 
                      ? 'border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all' 
                      : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed grayscale'
                  }`}
                >
                  {!item.isAvailable && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Sold Out
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 pr-12">{item.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">{item.description}</p>
                  <div className="text-amber-600 font-bold">${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-80 bg-white dark:bg-gray-800 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Current Ticket</h2>
            <p className="text-sm text-gray-500">{cart.length} items</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">🍽️</span>
                <p>Tap items to add to order</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700 relative group">
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                  >
                    ×
                  </button>
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900 dark:text-white pr-4">{item.name}</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
                      <button 
                        onClick={() => updateCartItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >-</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartItem(item.id, 'quantity', item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >+</button>
                    </div>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Add note (e.g., no onions)..."
                    value={item.notes}
                    onChange={(e) => updateCartItem(item.id, 'notes', e.target.value)}
                    className="mt-3 w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                  />
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-sm ${
                cart.length > 0 
                  ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-md active:transform active:scale-[0.98]' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Send to Kitchen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
