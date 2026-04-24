'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function ManagerKitchenMonitor() {
  const { orders, tables } = useRestaurant();
  const [priorities, setPriorities] = useState<Record<string, boolean>>({});

  const activeOrders = orders.filter(o => o.status === 'sent_to_kitchen' || o.status === 'partially_ready');

  const togglePriority = (orderId: string) => {
    setPriorities(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getTableNumber = (tableId: string) => {
    return tables.find(t => t.id === tableId)?.number || '?';
  };

  const getItemColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
      case 'served': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Kitchen Monitor</h1>
          <p className="text-gray-500 text-sm mt-1">Read-only view of active kitchen tickets</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200">
          {activeOrders.length} Active Tickets
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {activeOrders.map(order => {
          const isAllReady = order.items.every(i => i.status === 'ready' || i.status === 'served');
          const isPriority = priorities[order.id];

          return (
            <div 
              key={order.id} 
              className={`rounded-xl shadow-sm overflow-hidden border transition-colors ${
                isAllReady 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' 
                  : isPriority
                    ? 'bg-red-50 border-red-300 dark:bg-red-900/10 dark:border-red-800 ring-1 ring-red-300'
                    : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              <div className={`p-4 flex justify-between items-center border-b ${
                isAllReady ? 'border-green-200 dark:border-green-800' : isPriority ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    isAllReady ? 'bg-green-500 text-white' : isPriority ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
                  }`}>
                    T{getTableNumber(order.tableId)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">Order #{order.id.slice(-4)}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Status: {order.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                {isPriority && (
                  <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                    Priority
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                {order.items.map(item => (
                  <div 
                    key={item.id}
                    className={`p-2 rounded-md border text-sm ${getItemColor(item.status)} ${item.status === 'ready' || item.status === 'served' ? 'border-transparent' : 'border-gray-200 dark:border-gray-600'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        <span className="mr-2 text-gray-500">{item.quantity}x</span>
                        {item.name}
                      </div>
                      <span className="text-[10px] uppercase font-bold opacity-70">{item.status}</span>
                    </div>
                    {item.notes && (
                      <div className="mt-1 text-xs italic opacity-80">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => togglePriority(order.id)}
                  className={`w-full py-2 rounded-lg shadow-sm text-sm font-bold transition-colors ${
                    isPriority 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600' 
                      : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/40'
                  }`}
                >
                  {isPriority ? 'Remove Priority' : 'Mark as Priority'}
                </button>
              </div>
            </div>
          );
        })}
        
        {activeOrders.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
            <span className="text-4xl block mb-4">👨‍🍳</span>
            <h3 className="text-xl font-bold mb-2">Kitchen is clear</h3>
            <p>No active orders in the queue right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
