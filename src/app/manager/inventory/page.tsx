"use client";

import React, { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";

export default function ManagerInventoryPage() {
  const { inventory, setInventory, inventoryReports, setInventoryReports } = useRestaurant();
  const [activeTab, setActiveTab] = useState<"current" | "reports">("current");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const pendingReports = inventoryReports.filter(r => r.status === 'pending');
  const historyReports = inventoryReports.filter(r => r.status !== 'pending');

  const approveAndPurchase = (reportId: string) => {
    const report = inventoryReports.find(r => r.id === reportId);
    if (!report) return;

    // Update inventory stock based on reported values (Manager fills/purchases to reach desired levels)
    setInventory(prev => prev.map(item => {
      const reported = report.items.find(ri => ri.inventoryItemId === item.id);
      if (reported) {
        // Manager "purchases" material to restore stock or just accepts the count
        return { ...item, currentStock: reported.reportedStock };
      }
      return item;
    }));

    // Mark report as purchased
    setInventoryReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: 'purchased' as const } : r
    ));
    
    setSelectedReportId(null);
    alert("Stock updated and purchase recorded!");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-gray-500">Run on-demand checkpoints before adding new items or purchasing stock.</p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab("current")}
            className={`px-4 py-2 text-sm rounded-md transition-all ${activeTab === "current" ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          >
            Current Stock
          </button>
          <button 
            onClick={() => setActiveTab("reports")}
            className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 ${activeTab === "reports" ? "bg-amber-100 text-amber-700 font-medium" : "text-gray-500 hover:text-gray-700"}`}
          >
            Chef Reports
            {pendingReports.length > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{pendingReports.length}</span>}
          </button>
        </div>
      </div>

      {activeTab === "current" ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-800">Before adding a new material, request a chef checkpoint</div>
              <div className="text-xs text-amber-700">This ensures purchase decisions use the latest physical stock values.</div>
            </div>
            <button
              onClick={() => setActiveTab("reports")}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700"
            >
              Review Checkpoint Reports
            </button>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {inventory.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">{item.unit}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-600">{item.currentStock}</div>
                  <div className="text-[10px] text-gray-400">Current Stock</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${item.currentStock <= item.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {item.currentStock <= item.minStockLevel ? 'Low Stock' : 'Healthy'}
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.currentStock <= item.minStockLevel ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${Math.min(100, (item.currentStock / (item.minStockLevel * 2)) * 100)}%` }}
                ></div>
              </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Checkpoints</h3>
            {pendingReports.length === 0 && <div className="text-sm text-gray-400 italic">No pending reports.</div>}
            {pendingReports.map(report => (
              <button 
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedReportId === report.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-gray-200 bg-white hover:border-amber-300'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-gray-900">On-demand Stock Checkpoint</div>
                  <div className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">New</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{new Date(report.date).toLocaleString()}</div>
                <div className="text-xs text-gray-600 mt-2 font-medium">{report.items.length} items checked</div>
              </button>
            ))}

            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-4">History</h3>
            {historyReports.map(report => (
              <div key={report.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 opacity-75">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-gray-700">On-demand Stock Checkpoint</div>
                  <div className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Purchased</div>
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(report.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-8">
            {selectedReportId ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Report Details</h2>
                    <p className="text-sm text-gray-500">Reviewing submission from Chef Marco Rossi</p>
                  </div>
                  <button 
                    onClick={() => approveAndPurchase(selectedReportId)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md transition-all"
                  >
                    Approve & Purchase
                  </button>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-[10px] uppercase text-gray-500 font-bold">
                      <tr>
                        <th className="px-6 py-3">Item Name</th>
                        <th className="px-6 py-3">System Stock</th>
                        <th className="px-6 py-3">Chef Reported</th>
                        <th className="px-6 py-3">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {inventoryReports.find(r => r.id === selectedReportId)?.items.map(ri => {
                        const diff = ri.reportedStock - ri.previousStock;
                        return (
                          <tr key={ri.inventoryItemId} className="text-sm">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ri.name}</td>
                            <td className="px-6 py-4 text-gray-500">{ri.previousStock}</td>
                            <td className="px-6 py-4 font-bold text-amber-600">{ri.reportedStock}</td>
                            <td className={`px-6 py-4 font-bold ${diff < 0 ? 'text-red-500' : diff > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/30 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </div>
                <p className="text-gray-500 font-medium">Select a report to review variance and approve purchase</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}