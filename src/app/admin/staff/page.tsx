'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';

export default function StaffManagement() {
  const { staff, shifts, attendance, leaveRequests, setLeaveRequests } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'employees' | 'schedule' | 'attendance' | 'leaves'>('employees');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const handleLeaveAction = (id: string, status: 'approved' | 'rejected') => {
    setLeaveRequests(prev => prev.map(lr => lr.id === id ? { ...lr, status } : lr));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'chef': return 'bg-red-100 text-red-800 border-red-200';
      case 'waiter': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cashier': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">Staff & HRM</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-fit">
        <button onClick={() => setActiveTab('employees')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'employees' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Directory</button>
        <button onClick={() => setActiveTab('schedule')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Schedule</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'attendance' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Attendance</button>
        <button onClick={() => setActiveTab('leaves')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'leaves' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
          Leave Requests
          {leaveRequests.filter(lr => lr.status === 'pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {leaveRequests.filter(lr => lr.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Directory Tab */}
      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Employee Name</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Hire Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {staff.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{employee.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getRoleColor(employee.role)}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.phone}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.hireDate}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedEmployee(employee)}
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

      {/* Schedule Tab (Visual Grid) */}
      {activeTab === 'schedule' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Schedule</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">&lt; Prev</button>
              <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">Next &gt;</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase text-center">
                <tr>
                  <th className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 text-left w-48">Staff</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700">Mon 18</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700">Tue 19</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700 bg-amber-50 dark:bg-amber-900/10 text-amber-700">Wed 20 (Today)</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700">Thu 21</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700">Fri 22</th>
                  <th className="px-2 py-3 border-r border-gray-200 dark:border-gray-700">Sat 23</th>
                  <th className="px-2 py-3">Sun 24</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {staff.map(employee => (
                  <tr key={employee.id}>
                    <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="font-medium text-gray-900 dark:text-white">{employee.name}</div>
                      <div className="text-xs text-gray-500">{employee.role}</div>
                    </td>
                    {[18, 19, 20, 21, 22, 23, 24].map(day => {
                      const dateStr = `2024-12-${day}`;
                      const shift = shifts.find(s => s.employeeId === employee.id && s.date === dateStr);
                      return (
                        <td key={day} className={`px-2 py-3 border-r border-gray-200 dark:border-gray-700 text-center ${day === 20 ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}`}>
                          {shift ? (
                            <div className={`text-xs font-medium px-2 py-1.5 rounded-md ${getRoleColor(employee.role)}`}>
                              {shift.startTime} - {shift.endTime}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-300 dark:text-gray-600 italic">Off</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Check In</th>
                <th className="px-6 py-4 font-medium">Check Out</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendance.map(record => {
                const emp = staff.find(s => s.id === record.employeeId);
                return (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{record.date}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{emp?.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{record.checkIn || '--:--'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{record.checkOut || '--:--'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        record.status === 'present' ? 'bg-green-100 text-green-800 border-green-200' :
                        record.status === 'late' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Dates</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaveRequests.map(req => {
                const emp = staff.find(s => s.id === req.employeeId);
                return (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{emp?.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{req.startDate} to {req.endDate}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{req.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                        req.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleLeaveAction(req.id, 'approved')}
                            className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-md text-xs font-medium transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleLeaveAction(req.id, 'rejected')}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Employee Profile</h3>
              <button onClick={() => setSelectedEmployee(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">×</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold uppercase">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedEmployee.name}</h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleColor(selectedEmployee.role)}`}>
                    {selectedEmployee.role}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedEmployee.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Hire Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedEmployee.hireDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Salary</span>
                  <span className="font-medium text-gray-900 dark:text-white">${selectedEmployee.salary} / month</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className={`font-medium ${selectedEmployee.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedEmployee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 font-medium rounded-lg transition-colors">Edit Details</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
