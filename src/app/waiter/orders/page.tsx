"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";

type CartItem = { id: string; menuItemId: string; name: string; quantity: number; price: number; notes: string };

type BoardOrder = {
  id: string;
  tableId: string;
  waiterId: string;
  waiterName: string;
  status: string;
  items: { id: string; quantity: number; name: string; price: number }[];
};

const toBoardStatus = (status: string) => {
  if (status === "sent_to_kitchen" || status === "open") return "todo";
  if (status === "partially_ready") return "in progress";
  if (status === "ready") return "done";
  return "other";
};

export default function WaiterOrdersPage() {
  const { staff, tables, menuItems, menuCategories, orders, setOrders, setTables } = useRestaurant();
  const waiters = staff.filter((s) => s.role === "waiter");

  const [selectedWaiterId, setSelectedWaiterId] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id || "");
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("selectedWaiterId") : null;
    const waiterId = saved || waiters[0]?.id || "";
    setSelectedWaiterId(waiterId);
  }, [waiters]);

  const onWaiterChange = (id: string) => {
    setSelectedWaiterId(id);
    setSelectedTableId("");
    if (typeof window !== "undefined") window.localStorage.setItem("selectedWaiterId", id);
  };

  const assignedTables = tables.filter((t) => t.waiterId === selectedWaiterId);
  const filteredMenu = menuItems.filter((m) => m.categoryId === activeCategory);

  const addMenuItem = (item: any) => {
    if (!item.isAvailable) return;
    const existing = cart.find((c) => c.menuItemId === item.id && c.notes === "");
    if (existing) {
      setCart((prev) => prev.map((c) => (c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c)));
      return;
    }
    setCart((prev) => [...prev, { id: `c_${Date.now()}`, menuItemId: item.id, name: item.name, quantity: 1, price: item.price, notes: "" }]);
  };

  const updateItem = (id: string, patch: Partial<CartItem>) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const sendToKitchen = () => {
    if (!selectedWaiterId || !selectedTableId || cart.length === 0) return;

    const newItems = cart.map((c) => ({
      id: `oi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      menuItemId: c.menuItemId,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
      notes: c.notes,
      status: "pending" as const,
    }));

    const existingIdx = orders.findIndex((o) => o.tableId === selectedTableId && o.status !== "paid" && o.status !== "sent_to_cashier");
    if (existingIdx >= 0) {
      const next = [...orders];
      next[existingIdx] = {
        ...next[existingIdx],
        waiterId: selectedWaiterId,
        status: "sent_to_kitchen",
        items: [...next[existingIdx].items, ...newItems],
      };
      setOrders(next);
    } else {
      setOrders([
        ...orders,
        { id: `o_${Date.now()}`, tableId: selectedTableId, waiterId: selectedWaiterId, status: "sent_to_kitchen", items: newItems },
      ]);
    }

    setTables((prev) => prev.map((t) => (t.id === selectedTableId ? { ...t, status: "occupied" } : t)));
    setCart([]);
  };

  const sendToCashier = (orderId: string, tableId: string) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "sent_to_cashier" } : o)));
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: "ready_to_pay" } : t)));
  };

  const addMoreToDoneOrder = (order: BoardOrder) => {
    setSelectedWaiterId(order.waiterId);
    setSelectedTableId(order.tableId);
    if (typeof window !== "undefined") window.localStorage.setItem("selectedWaiterId", order.waiterId);
  };

  const grouped = useMemo(() => {
    const withName: BoardOrder[] = orders
      .map((o) => ({ ...o, waiterName: waiters.find((w) => w.id === o.waiterId)?.name || "Unknown" }))
      .filter((o) => toBoardStatus(o.status) !== "other");

    const todo = withName.filter((o) => toBoardStatus(o.status) === "todo");
    const inProgress = withName.filter((o) => toBoardStatus(o.status) === "in progress");
    const done = withName
      .filter((o) => toBoardStatus(o.status) === "done")
      .sort((a, b) => a.waiterName.localeCompare(b.waiterName));

    return { todo, inProgress, done };
  }, [orders, waiters]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div>
          <label className="text-sm text-gray-500">Waiter Name</label>
          <select value={selectedWaiterId} onChange={(e) => onWaiterChange(e.target.value)} className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option value="">Select waiter</option>
            {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-500">Assigned Table</label>
          <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="mt-1 w-full p-2.5 rounded-lg bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option value="">Select table</option>
            {assignedTables.map((t) => <option key={t.id} value={t.id}>Table {t.number} - {t.section}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2 overflow-x-auto">
            {menuCategories.map((c) => (
              <button key={c.id} onClick={() => setActiveCategory(c.id)} className={`px-3 py-1.5 rounded-full text-sm ${activeCategory === c.id ? "bg-amber-600 text-white" : "bg-gray-100 dark:bg-gray-700"}`}>{c.name}</button>
            ))}
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {filteredMenu.map((m) => (
              <button key={m.id} onClick={() => addMenuItem(m)} disabled={!m.isAvailable} className={`text-left p-3 rounded-lg border ${m.isAvailable ? "border-gray-200 hover:border-amber-400" : "opacity-50 cursor-not-allowed"}`}>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-500">{m.description}</div>
                <div className="text-sm font-semibold text-amber-600 mt-1">${m.price.toFixed(2)}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <h3 className="font-semibold">Current Ticket</h3>
          {cart.map((item) => (
            <div key={item.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                <div className="text-sm font-medium">{item.name}</div>
                <button onClick={() => removeItem(item.id)} className="text-red-500">x</button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })} className="px-2 bg-gray-200 rounded">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })} className="px-2 bg-gray-200 rounded">+</button>
              </div>
              <input value={item.notes} onChange={(e) => updateItem(item.id, { notes: e.target.value })} placeholder="notes" className="mt-2 w-full text-xs p-2 rounded border border-gray-300" />
            </div>
          ))}
          <button onClick={sendToKitchen} disabled={!selectedWaiterId || !selectedTableId || cart.length===0} className="w-full py-3 rounded bg-amber-600 text-white disabled:bg-gray-300">Send to Kitchen</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold mb-3">todo (new tickets)</h4>
          <div className="space-y-2">
            {grouped.todo.map((o) => (
              <div key={o.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-semibold">{o.waiterName}</div>
                <div className="text-xs text-gray-500">Table {tables.find((t)=>t.id===o.tableId)?.number}</div>
                <div className="text-xs text-gray-500">{o.items.length} items</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold mb-3">in progress (accepted by kitchen)</h4>
          <div className="space-y-2">
            {grouped.inProgress.map((o) => (
              <div key={o.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-semibold">{o.waiterName}</div>
                <div className="text-xs text-gray-500">Table {tables.find((t)=>t.id===o.tableId)?.number}</div>
                <div className="text-xs text-gray-500">{o.items.length} items</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h4 className="font-semibold mb-3">done (ready to deliver)</h4>
          <div className="space-y-2">
            {grouped.done.map((o) => (
              <div key={o.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
                <div className="text-sm font-semibold">{o.waiterName}</div>
                <div className="text-xs text-gray-500">Table {tables.find((t)=>t.id===o.tableId)?.number}</div>
                <div className="text-xs text-gray-500 mb-2">{o.items.length} items</div>
                <div className="flex gap-2">
                  <button onClick={() => addMoreToDoneOrder(o)} className="text-xs px-2 py-1 rounded border border-gray-300 bg-white">Add New Items</button>
                  <button onClick={() => sendToCashier(o.id, o.tableId)} className="text-xs px-2 py-1 rounded bg-amber-600 text-white">Send to Cashier</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
