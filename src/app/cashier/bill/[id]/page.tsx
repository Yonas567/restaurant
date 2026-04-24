'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRestaurant } from '@/context/RestaurantContext';

export default function BillView() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  
  const { tables, setTables, orders, setOrders } = useRestaurant();
  
  const [table, setTable] = useState(tables.find(t => t.id === tableId));
  const [activeOrder, setActiveOrder] = useState(orders.find(o => o.tableId === tableId && o.status !== 'paid'));
  
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [splitCount, setSplitCount] = useState<number>(table?.guestCount || 2);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    setTable(tables.find(t => t.id === tableId));
    setActiveOrder(orders.find(o => o.tableId === tableId && o.status !== 'paid'));
  }, [tables, orders, tableId]);

  if (!table || !activeOrder) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm mt-10">
        <h2 className="text-2xl font-bold mb-4">No Active Bill Found</h2>
        <button onClick={() => router.push('/cashier')} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Return to Tables</button>
      </div>
    );
  }

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'DEMO10') {
      setPromoApplied(true);
      triggerToast('Promo code applied: 10% off');
    } else {
      triggerToast('Invalid promo code');
    }
  };

  const handleVoidItem = (itemId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === activeOrder.id) {
        return { ...o, items: o.items.filter(i => i.id !== itemId) };
      }
      return o;
    }));
    triggerToast('Item voided from bill');
  };

  const handleReopenTable = () => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'occupied' } : t));
    triggerToast('Table reopened');
    router.push('/cashier');
  };

  const handleProcessPayment = () => {
    setShowSuccessModal(true);
    
    // Update state to close table
    setTimeout(() => {
      setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: 'available', guestCount: 0, seatedAt: undefined, waiterId: undefined } : t));
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'paid', paidAt: new Date().toISOString() } : o));
    }, 1500);
  };

  // Calculations
  const subtotal = activeOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = subtotal * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }
  
  if (promoApplied) {
    discountAmount += (subtotal - discountAmount) * 0.10; // 10% off remaining
  }
  
  const taxRate = 0.08; // 8% hardcoded tax
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;
  
  const changeDue = Math.max(0, cashReceived - grandTotal);
  const splitAmount = grandTotal / Math.max(1, splitCount);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity">
          {toastMessage}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful</h2>
            <p className="text-gray-500 mb-8">Table {table.number} has been closed and is now available.</p>
            <button 
              onClick={() => router.push('/cashier')}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/cashier')} className="text-gray-500 hover:text-gray-700">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Bill for Table {table.number}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReopenTable} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
            Reopen Table
          </button>
          <button onClick={() => { triggerToast('Receipt sent to email'); }} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
            Email Receipt
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
            Print Receipt
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Bill Details */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden print:shadow-none print:border-none">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order #{activeOrder.id.slice(-6)}</h2>
                <p className="text-sm text-gray-500">Waiter: {table.waiterId} • Guests: {table.guestCount}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${table.status === 'ready_to_pay' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {table.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-medium">Item</th>
                  <th className="px-6 py-3 font-medium w-24 text-center">Qty</th>
                  <th className="px-6 py-3 font-medium w-32 text-right">Price</th>
                  <th className="px-6 py-3 font-medium w-32 text-right">Total</th>
                  <th className="px-6 py-3 w-16 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {activeOrder.items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      {item.notes && <div className="text-xs text-gray-500 mt-1">Note: {item.notes}</div>}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right print:hidden">
                      <button 
                        onClick={() => handleVoidItem(item.id)}
                        className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium"
                      >
                        Void
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                <span>Discount {promoApplied && '(incl. DEMO10)'}</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-500">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Discounts */}
        <div className="w-full lg:w-96 space-y-6 print:hidden">
          
          {/* Discounts */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Discounts & Promos</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apply Discount</label>
                <div className="flex gap-2">
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-1/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value="percent">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <input 
                    type="number" 
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-2/3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                    placeholder="Amount" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white uppercase" 
                    placeholder="e.g. DEMO10" 
                  />
                  <button 
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:bg-gray-400 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${paymentMethod === 'cash' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}
              >
                💵 Cash
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${paymentMethod === 'card' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}
              >
                💳 Card
              </button>
              <button 
                onClick={() => setPaymentMethod('split')}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${paymentMethod === 'split' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'}`}
              >
                👥 Split
              </button>
            </div>

            {paymentMethod === 'cash' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount Received</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input 
                      type="number" 
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      className="pl-7 bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Change Due</span>
                  <span className={`text-xl font-bold ${changeDue > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'split' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Guests</label>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
                    <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="w-10 h-10 rounded-md bg-white dark:bg-gray-600 shadow-sm text-xl font-bold text-gray-700 dark:text-white">-</button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{splitCount}</span>
                    <button onClick={() => setSplitCount(splitCount + 1)} className="w-10 h-10 rounded-md bg-white dark:bg-gray-600 shadow-sm text-xl font-bold text-gray-700 dark:text-white">+</button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span className="text-amber-800 dark:text-amber-200 font-medium">Amount Per Person</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    ${splitAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={handleProcessPayment}
              disabled={paymentMethod === 'cash' && cashReceived < grandTotal}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-sm transition-all text-lg ${
                (paymentMethod !== 'cash' || cashReceived >= grandTotal) 
                  ? 'bg-amber-600 hover:bg-amber-700 hover:shadow-md active:transform active:scale-[0.98]' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {paymentMethod === 'card' ? 'Process Card' : 'Complete Payment'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
