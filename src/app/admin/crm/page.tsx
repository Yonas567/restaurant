'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function CRMManagement() {
  const { customers, reservations, setReservations, tables } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'customers' | 'reservations'>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showResModal, setShowResModal] = useState(false);
  
  const [resForm, setResForm] = useState({
    customerId: '',
    tableId: '',
    date: '',
    time: '',
    guestCount: 2,
    specialRequests: ''
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resForm.customerId || !resForm.tableId || !resForm.date || !resForm.time) return;

    setReservations(prev => [...prev, {
      id: `r_${Date.now()}`,
      customerId: resForm.customerId,
      tableId: resForm.tableId,
      date: resForm.date,
      time: resForm.time,
      guestCount: resForm.guestCount,
      status: 'pending',
      specialRequests: resForm.specialRequests
    }]);

    setShowResModal(false);
    setResForm({ customerId: '', tableId: '', date: '', time: '', guestCount: 2, specialRequests: '' });
  };

  const handleResAction = (id: string, status: 'confirmed' | 'seated' | 'cancelled') => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getTableNumber = (id: string) => tables.find(t => t.id === id)?.number || '?';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">CRM & Reservations</h1>
        {activeTab === 'reservations' && (
          <button 
            onClick={() => setShowResModal(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm font-medium transition-colors"
          >
            + Add Reservation
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-fit">
        <button onClick={() => setActiveTab('customers')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Customers</button>
        <button onClick={() => setActiveTab('reservations')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reservations' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Reservations</button>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <input 
              type="text" 
              placeholder="Search customers by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
            />
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Total Visits</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{customer.phone}</div>
                    <div className="text-xs text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{customer.totalVisits}</td>
                  <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">${customer.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {customer.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-amber-600 hover:text-amber-800 font-medium text-sm"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Table</th>
                <th className="px-6 py-4 font-medium">Guests</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {reservations.sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()).map(res => (
                <tr key={res.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{res.date}</div>
                    <div className="text-sm text-gray-500">{res.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{getCustomerName(res.customerId)}</div>
                    {res.specialRequests && <div className="text-xs text-amber-600 italic mt-1">Note: {res.specialRequests}</div>}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">T{getTableNumber(res.tableId)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{res.guestCount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                      res.status === 'confirmed' ? 'bg-green-100 text-green-800 border-green-200' :
                      res.status === 'seated' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      res.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {res.status === 'pending' && (
                      <button onClick={() => handleResAction(res.id, 'confirmed')} className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md text-xs font-medium transition-colors">Confirm</button>
                    )}
                    {res.status === 'confirmed' && (
                      <button onClick={() => handleResAction(res.id, 'seated')} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-md text-xs font-medium transition-colors">Seat</button>
                    )}
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                      <button onClick={() => handleResAction(res.id, 'cancelled')} className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium transition-colors">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customer Profile</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCustomer.name}</h2>
                  <div className="flex gap-1 mt-1">
                    {selectedCustomer.tags.map((tag: string) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Total Visits</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedCustomer.totalVisits}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Total Spent</span>
                  <span className="font-medium text-green-600 dark:text-green-400">${selectedCustomer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Loyalty Points</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{selectedCustomer.loyaltyPoints} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Reservation Modal */}
      {showResModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">New Reservation</h3>
            
            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                <select 
                  required
                  value={resForm.customerId} onChange={e => setResForm({...resForm, customerId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Table</label>
                <select 
                  required
                  value={resForm.tableId} onChange={e => setResForm({...resForm, tableId: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">-- Select Table --</option>
                  {tables.map(t => <option key={t.id} value={t.id}>Table {t.number} ({t.capacity} seats) - {t.section}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" required
                    value={resForm.date} onChange={e => setResForm({...resForm, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input 
                    type="time" required
                    value={resForm.time} onChange={e => setResForm({...resForm, time: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guests</label>
                <input 
                  type="number" min="1" required
                  value={resForm.guestCount} onChange={e => setResForm({...resForm, guestCount: Number(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Requests</label>
                <input 
                  type="text"
                  value={resForm.specialRequests} onChange={e => setResForm({...resForm, specialRequests: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                  placeholder="e.g. Window seat, Birthday"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button type="button" onClick={() => setShowResModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium transition-colors">Save Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
