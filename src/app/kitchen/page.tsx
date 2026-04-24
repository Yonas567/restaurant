"use client";

import React, { useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";

const boardStatus = (status: string) => {
  if (status === "sent_to_kitchen" || status === "open") return "todo";
  if (status === "partially_ready") return "in progress";
  if (status === "ready") return "done";
  return "other";
};

export default function KitchenDashboard() {
  const { orders, setOrders, tables, menuItems } = useRestaurant();
  const [priorities, setPriorities] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"board" | "inventory">("board");

  const activeOrders = orders.filter((o) => ["sent_to_kitchen", "open", "partially_ready", "ready"].includes(o.status));
  const imageMap = useMemo(() => {
    const map: Record<string, string> = {};
    menuItems.forEach((m) => {
      map[m.id] = m.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=220&fit=crop&auto=format";
    });
    return map;
  }, [menuItems]);

  const acceptTicket = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "partially_ready",
              items: o.items.map((i) => (i.status === "pending" ? { ...i, status: "preparing" as const } : i)),
            }
          : o,
      ),
    );
  };

  const markOrderDone = (orderId: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== orderId || boardStatus(o.status) !== "in progress") return o;
      return {
        ...o,
        status: "ready",
        waiterAcceptedReady: false,
        items: o.items.map((i) => ({ ...i, status: i.status === "served" ? "served" : "ready" as const })),
      };
    }));
  };

  const markPriority = (orderId: string) => setPriorities((p) => ({ ...p, [orderId]: !p[orderId] }));

  const getTable = (id: string) => tables.find((t) => t.id === id)?.number || "?";

  const renderColumn = (title: string, key: string) => {
    const list = activeOrders.filter((o) => boardStatus(o.status) === key);
    return (
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <h3 className="font-semibold mb-3 text-white">{title}</h3>
        <div className="space-y-3">
          {list.map((o) => (
            <div key={o.id} className={`rounded-lg border p-3 ${priorities[o.id] ? "border-red-500 bg-red-900/20" : "border-slate-700 bg-slate-800"}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-white">Table {getTable(o.tableId)}</div>
                <button onClick={() => markPriority(o.id)} className="text-xs px-2 py-1 rounded bg-red-700 text-red-100">Priority</button>
              </div>
              {o.isEditedByWaiter && (
                <div className="mb-2 text-[11px] inline-block px-2 py-1 rounded-full bg-amber-700 text-amber-100">
                  Edited by waiter
                </div>
              )}
              {key === "done" && (
                <div className={`mb-2 text-[11px] inline-block px-2 py-1 rounded-full ${o.waiterAcceptedReady ? "bg-emerald-700 text-emerald-100" : "bg-slate-700 text-slate-100"}`}>
                  {o.waiterAcceptedReady ? "Accepted by waiter" : "Waiting waiter acceptance"}
                </div>
              )}
              <div className="rounded border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/60 text-gray-300">
                    <tr>
                      <th className="px-2 py-1.5 font-medium w-12">Photo</th>
                      <th className="px-2 py-1.5 font-medium">Item</th>
                      <th className="px-2 py-1.5 font-medium">Qty</th>
                      <th className="px-2 py-1.5 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {o.items.map((i) => (
                      <tr key={i.id} className="bg-black/20">
                        <td className="px-2 py-1.5">
                          <img src={imageMap[i.menuItemId]} alt={i.name} className="w-9 h-9 rounded object-cover border border-slate-600" />
                        </td>
                        <td className="px-2 py-1.5">
                          <span className="text-white truncate block">{i.name}</span>
                        </td>
                        <td className="px-2 py-1.5 text-gray-200 font-medium">{i.quantity}x</td>
                        <td className="px-2 py-1.5 text-gray-300">{i.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {key === "todo" && <button onClick={() => acceptTicket(o.id)} className="mt-2 w-full py-2 text-xs rounded bg-amber-600 text-white">Accept Ticket</button>}
              {key === "in progress" && <button onClick={() => markOrderDone(o.id)} className="mt-2 w-full py-2 text-xs rounded bg-emerald-600 text-white">Done</button>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold text-white font-serif">Kitchen Board Flow</h1>
      {activeTab === "board" ? (
        <div className="grid md:grid-cols-3 gap-4">
          {renderColumn("todo (new tickets)", "todo")}
          {renderColumn("in progress (accepted)", "in progress")}
          {renderColumn("done (ready)", "done")}
        </div>
      ) : (
        <KitchenInventoryStatus />
      )}

      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700 rounded-xl p-1.5 flex gap-2 shadow-lg">
        <button
          onClick={() => setActiveTab("board")}
          className={`px-4 py-2 text-sm rounded-lg ${activeTab === "board" ? "bg-amber-600 text-white" : "text-gray-300 hover:bg-slate-800"}`}
        >
          Kitchen Board
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 text-sm rounded-lg ${activeTab === "inventory" ? "bg-amber-600 text-white" : "text-gray-300 hover:bg-slate-800"}`}
        >
          Inventory Status
        </button>
      </div>
    </div>
  );
}

function KitchenInventoryStatus() {
  const { inventory, setInventoryReports, inventoryReports } = useRestaurant();
  const inventoryImageByName: Record<string, string> = {
    "Salmon Fillet": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=120&h=120&fit=crop&auto=format",
    "Ribeye Beef": "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=120&h=120&fit=crop&auto=format",
    Flour: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=120&h=120&fit=crop&auto=format",
    Tomatoes: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=120&h=120&fit=crop&auto=format",
    "Coffee Beans": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=120&h=120&fit=crop&auto=format",
  };
  const [reportItems, setReportItems] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    inventory.forEach(item => {
      initial[item.id] = item.currentStock;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateReportedStock = (id: string, val: number) => {
    setReportItems(prev => ({ ...prev, [id]: val }));
  };

  const submitReport = () => {
    setIsSubmitting(true);
    const newReport = {
      id: `rep_${Date.now()}`,
      chefId: 'e2', // Marco Rossi (Chef)
      date: new Date().toISOString(),
      items: inventory.map(item => ({
        inventoryItemId: item.id,
        name: item.name,
        reportedStock: reportItems[item.id] || 0,
        previousStock: item.currentStock
      })),
      status: 'pending' as const
    };

    setTimeout(() => {
      setInventoryReports(prev => [newReport, ...prev]);
      setIsSubmitting(false);
      alert("Inventory report submitted to manager!");
    }, 800);
  };

  const latestReport = inventoryReports[0];

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg">On-Demand Stock Checkpoint</h3>
            <p className="text-xs text-gray-400 mt-1">Fill only when manager requests a check before adding or purchasing new stock.</p>
          </div>
          <button 
            onClick={submitReport}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/70 text-gray-300">
              <tr>
                <th className="px-3 py-2 font-medium w-16">Photo</th>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Unit</th>
                <th className="px-3 py-2 font-medium">System Stock</th>
                <th className="px-3 py-2 font-medium">Physical Count</th>
                <th className="px-3 py-2 font-medium">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {inventory.map((item) => {
                const currentVal = reportItems[item.id];
                const diff = currentVal - item.currentStock;
                return (
                  <tr key={item.id} className="bg-slate-800/40 hover:bg-slate-800/70">
                    <td className="px-3 py-2">
                      <img
                        src={inventoryImageByName[item.name] || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=120&h=120&fit=crop&auto=format"}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover border border-slate-600"
                      />
                    </td>
                    <td className="px-3 py-2 text-white font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-gray-300">{item.unit}</td>
                    <td className="px-3 py-2 text-gray-200 font-mono">{item.currentStock}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={currentVal}
                        onChange={(e) => updateReportedStock(item.id, Number(e.target.value))}
                        className="w-28 bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </td>
                    <td className={`px-3 py-2 font-semibold ${diff === 0 ? "text-gray-400" : diff < 0 ? "text-red-400" : "text-emerald-400"}`}>
                      {diff > 0 ? "+" : ""}
                      {diff} {item.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {latestReport && (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Last Checkpoint Submission</h4>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${latestReport.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <span className="text-sm text-gray-300">Report from {new Date(latestReport.date).toLocaleTimeString()} is {latestReport.status}</span>
          </div>
        </div>
      )}
    </div>
  );
}