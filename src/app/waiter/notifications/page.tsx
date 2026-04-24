"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";

export default function WaiterCashierCardsPage() {
  const { orders, staff, tables, menuItems } = useRestaurant();
  const waiters = staff.filter((s) => s.role === "waiter");
  const [selectedWaiterId, setSelectedWaiterId] = useState("");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("selectedWaiterId") : null;
    setSelectedWaiterId(saved || waiters[0]?.id || "");
  }, [waiters]);

  const imageMap = useMemo(() => {
    const map: Record<string, string> = {};
    menuItems.forEach((m) => {
      map[m.id] = m.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=220&fit=crop&auto=format";
    });
    return map;
  }, [menuItems]);

  const cashierCards = useMemo(() => {
    return orders
      .filter((o) => (o.status === "sent_to_cashier" || o.status === "paid") && o.waiterId === selectedWaiterId)
      .map((o) => ({
        ...o,
        waiterName: staff.find((s) => s.id === o.waiterId)?.name || "Unknown",
        tableNo: tables.find((t) => t.id === o.tableId)?.number || "?",
        total: o.items.reduce((sum, i) => sum + i.quantity * i.price, 0),
      }))
      .sort((a, b) => b.id.localeCompare(a.id));
  }, [orders, staff, tables, selectedWaiterId]);

  const todayAmount = useMemo(() => cashierCards.reduce((sum, c) => sum + c.total, 0), [cashierCards]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <label className="block text-sm text-gray-300 mb-1">Waiter</label>
        <select
          value={selectedWaiterId}
          onChange={(e) => {
            setSelectedWaiterId(e.target.value);
            if (typeof window !== "undefined") window.localStorage.setItem("selectedWaiterId", e.target.value);
          }}
          className="w-full md:max-w-sm bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white"
        >
          <option value="">Choose waiter</option>
          {waiters.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900 dark:text-white">Sent to Cashier</h1>
          <p className="text-sm text-gray-500">Only this waiter cards are listed.</p>
        </div>
        <div className="bg-amber-900/40 border border-amber-700 rounded-xl p-4 text-right">
          <div className="text-xs uppercase tracking-wide text-amber-200">Waiter Amount Today</div>
          <div className="text-2xl font-semibold text-amber-100">${todayAmount.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cashierCards.map((o) => (
          <div key={o.id} className="bg-slate-900 rounded-xl border border-slate-700 p-4 shadow-sm text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-amber-300">{o.waiterName}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${o.status === "paid" ? "bg-emerald-700 text-emerald-100" : "bg-amber-700 text-amber-100"}`}>
                {o.status === "paid" ? "paid" : "sent"}
              </span>
            </div>
            <div className="text-sm text-gray-200">Table {o.tableNo}</div>

            <div className="mt-2 space-y-2 max-h-44 overflow-y-auto pr-1">
              {o.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-black/20 rounded p-2">
                  <img src={imageMap[item.menuItemId]} alt={item.name} className="w-10 h-10 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium truncate">{item.name}</div>
                    <div className="text-[11px] text-gray-300">{item.quantity}x · ${item.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700 text-sm font-semibold">Total: ${o.total.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {cashierCards.length === 0 && (
        <div className="bg-slate-900 rounded-xl border border-dashed border-slate-600 p-8 text-center text-gray-400">
          No cards sent to cashier yet for this waiter.
        </div>
      )}
    </div>
  );
}
