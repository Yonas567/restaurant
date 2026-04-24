"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";

type DraftItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
};

type BoardOrder = {
  id: string;
  tableId: string;
  waiterId: string;
  status: string;
  waiterAcceptedReady?: boolean;
  items: {
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    notes: string;
    status: string;
  }[];
  tableNo: string | number;
};

const toBoardStatus = (status: string) => {
  if (status === "open" || status === "sent_to_kitchen") return "todo";
  if (status === "partially_ready") return "inprogress";
  if (status === "ready" || status === "sent_to_cashier" || status === "paid") return "done";
  return "todo";
};

export default function WaiterTabletDashboard() {
  const { staff, tables, menuItems, orders, setOrders, setTables } = useRestaurant();
  const waiters = staff.filter((s) => s.role === "waiter");

  const [selectedWaiterId, setSelectedWaiterId] = useState("");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  const [editingOrder, setEditingOrder] = useState<BoardOrder | null>(null);
  const [editItems, setEditItems] = useState<DraftItem[]>([]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("selectedWaiterId") : null;
    const waiterId = saved || waiters[0]?.id || "";
    setSelectedWaiterId(waiterId);
  }, [waiters]);

  const onWaiterChange = (id: string) => {
    setSelectedWaiterId(id);
    if (typeof window !== "undefined") window.localStorage.setItem("selectedWaiterId", id);
    setSelectedTableId("");
  };

  const assignedTables = useMemo(() => tables.filter((t) => t.waiterId === selectedWaiterId), [tables, selectedWaiterId]);

  const myOrders: BoardOrder[] = useMemo(
    () =>
      orders
        .filter((o) => o.waiterId === selectedWaiterId)
        .map((o) => ({ ...o, tableNo: tables.find((t) => t.id === o.tableId)?.number || "?" })),
    [orders, selectedWaiterId, tables],
  );

  const columns = {
    todo: myOrders.filter((o) => toBoardStatus(o.status) === "todo"),
    inprogress: myOrders.filter((o) => toBoardStatus(o.status) === "inprogress"),
    done: myOrders.filter((o) => toBoardStatus(o.status) === "done"),
  };

  const imageMap = useMemo(() => {
    const map: Record<string, string> = {};
    menuItems.forEach((m) => {
      map[m.id] = m.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=220&fit=crop&auto=format";
    });
    return map;
  }, [menuItems]);

  const addItem = (menuItem: any) => {
    if (!menuItem.isAvailable) return;
    const existing = draftItems.find((d) => d.menuItemId === menuItem.id && d.notes === "");
    if (existing) {
      setDraftItems((prev) => prev.map((d) => (d.id === existing.id ? { ...d, quantity: d.quantity + 1 } : d)));
      return;
    }
    setDraftItems((prev) => [
      ...prev,
      {
        id: `d_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: "",
      },
    ]);
  };

  const updateDraft = (id: string, patch: Partial<DraftItem>) => {
    setDraftItems((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const removeDraft = (id: string) => {
    setDraftItems((prev) => prev.filter((d) => d.id !== id));
  };

  const submitOrder = () => {
    if (!selectedWaiterId || !selectedTableId || draftItems.length === 0) return;

    const mappedItems = draftItems.map((d) => ({
      id: `oi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      menuItemId: d.menuItemId,
      name: d.name,
      quantity: d.quantity,
      price: d.price,
      notes: d.notes,
      status: "pending" as const,
    }));

    const existingIdx = orders.findIndex((o) => o.tableId === selectedTableId && o.status !== "paid" && o.status !== "sent_to_cashier");
    if (existingIdx >= 0) {
      const next = [...orders];
      next[existingIdx] = {
        ...next[existingIdx],
        waiterId: selectedWaiterId,
        status: "sent_to_kitchen",
        isEditedByWaiter: true,
        items: [...next[existingIdx].items, ...mappedItems],
      };
      setOrders(next);
    } else {
      setOrders([
        ...orders,
        {
          id: `o_${Date.now()}`,
          tableId: selectedTableId,
          waiterId: selectedWaiterId,
          status: "sent_to_kitchen",
          isEditedByWaiter: false,
          items: mappedItems,
        },
      ]);
    }

    setTables((prev) => prev.map((t) => (t.id === selectedTableId ? { ...t, status: "occupied" } : t)));
    setShowOrderModal(false);
    setSelectedTableId("");
    setDraftItems([]);
  };

  const openEditModal = (order: BoardOrder) => {
    setEditingOrder(order);
    setEditItems(
      order.items.map((i) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        notes: i.notes,
      })),
    );
  };

  const updateEditItem = (id: string, patch: Partial<DraftItem>) => {
    setEditItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const removeEditItem = (id: string) => {
    setEditItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addMenuItemToEdit = (menuItem: any) => {
    if (!editingOrder) return;
    const existing = editItems.find((d) => d.menuItemId === menuItem.id && d.notes === "");
    if (existing) {
      setEditItems((prev) => prev.map((d) => (d.id === existing.id ? { ...d, quantity: d.quantity + 1 } : d)));
      return;
    }
    setEditItems((prev) => [
      ...prev,
      {
        id: `edit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        notes: "",
      },
    ]);
  };

  const saveEdit = () => {
    if (!editingOrder) return;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== editingOrder.id) return o;
        return {
          ...o,
          isEditedByWaiter: true,
          items: editItems.map((i) => ({
            id: i.id,
            menuItemId: i.menuItemId,
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            notes: i.notes,
            status: "pending",
          })),
        };
      }),
    );
    setEditingOrder(null);
    setEditItems([]);
  };

  const acceptReadyFromKitchen = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId && o.status === "ready"
          ? {
              ...o,
              waiterAcceptedReady: true,
            }
          : o,
      ),
    );
  };

  const cardStyle = (kind: "todo" | "inprogress" | "done") => {
    if (kind === "todo") return "bg-slate-800 border-slate-700";
    if (kind === "inprogress") return "bg-amber-900/40 border-amber-700/60";
    return "bg-emerald-900/40 border-emerald-700/60";
  };

  const badgeStyle = (kind: "todo" | "inprogress" | "done") => {
    if (kind === "todo") return "bg-slate-700 text-slate-100";
    if (kind === "inprogress") return "bg-amber-700 text-amber-100";
    return "bg-emerald-700 text-emerald-100";
  };

  const renderOrderCard = (o: BoardOrder, kind: "todo" | "inprogress" | "done") => {
    const isLocked = o.status === "sent_to_cashier" || o.status === "paid";
    const total = o.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    return (
      <div key={o.id} className={`p-3 rounded-xl border ${cardStyle(kind)} text-white shadow-sm`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Table {o.tableNo}</div>
            <div className="text-xs text-gray-300">Order {o.id.toUpperCase()}</div>
          </div>
          <span className={`inline-block text-[10px] px-2 py-1 rounded-full ${badgeStyle(kind)}`}>{kind === "inprogress" ? "in progress" : kind}</span>
        </div>

        <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-1">
          {o.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
              <img src={imageMap[item.menuItemId]} alt={item.name} className="w-9 h-9 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium truncate">{item.name}</div>
                <div className="text-[11px] text-gray-300">{item.quantity}x · ${item.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-200">Total: ${total.toFixed(2)}</div>

        <div className="mt-2 flex justify-end">
          <div className="flex items-center gap-2">
            {kind === "done" && o.status === "ready" && (
              <button
                onClick={() => acceptReadyFromKitchen(o.id)}
                disabled={Boolean(o.waiterAcceptedReady)}
                className={`text-xs px-2.5 py-1.5 rounded ${o.waiterAcceptedReady ? "bg-emerald-700 text-emerald-100 cursor-default" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
              >
                {o.waiterAcceptedReady ? "Accepted" : "Accept from Kitchen"}
              </button>
            )}
            <button
              disabled={isLocked}
              onClick={() => openEditModal(o)}
              className={`text-xs px-2.5 py-1.5 rounded ${isLocked ? "bg-gray-500/50 text-gray-300 cursor-not-allowed" : "bg-white text-gray-900 hover:bg-gray-100"}`}
            >
              {isLocked ? "Locked" : "Edit"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <label className="block text-sm text-gray-300 mb-1">Waiter Name</label>
          <select
            value={selectedWaiterId}
            onChange={(e) => onWaiterChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-white rounded-lg p-2.5 text-sm"
          >
            <option value="">Choose waiter</option>
            {waiters.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-300 lg:ml-auto lg:mr-3">{assignedTables.length} assigned tables</div>
        <button
          onClick={() => setShowOrderModal(true)}
          className="px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 shadow-sm"
        >
          + Create Order
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold mb-3 text-slate-100">Todo</h3>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">{columns.todo.map((o) => renderOrderCard(o, "todo"))}</div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold mb-3 text-amber-300">In Progress</h3>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">{columns.inprogress.map((o) => renderOrderCard(o, "inprogress"))}</div>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4">
          <h3 className="font-semibold mb-3 text-emerald-300">Done</h3>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">{columns.done.map((o) => renderOrderCard(o, "done"))}</div>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Order</h2>
                <p className="text-xs text-gray-300">Select waiter, table, items, and notes then send.</p>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 text-gray-200">x</button>
            </div>

            <div className="p-4 sm:p-5 grid xl:grid-cols-12 gap-4 max-h-[80vh] overflow-y-auto">
              <div className="xl:col-span-3 space-y-3 bg-slate-800 rounded-xl border border-slate-700 p-4">
                <div>
                  <label className="text-sm text-gray-300">Waiter</label>
                  <select value={selectedWaiterId} onChange={(e) => onWaiterChange(e.target.value)} className="mt-1 w-full p-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white">
                    <option value="">Choose waiter</option>
                    {waiters.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-300">Table</label>
                  <select value={selectedTableId} onChange={(e) => setSelectedTableId(e.target.value)} className="mt-1 w-full p-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white">
                    <option value="">Choose table</option>
                    {assignedTables.map((t) => <option key={t.id} value={t.id}>Table {t.number} - {t.section}</option>)}
                  </select>
                </div>
              </div>

              <div className="xl:col-span-9 grid md:grid-cols-2 gap-4">
                <div className="border border-slate-700 rounded-xl p-3 sm:p-4 bg-slate-800">
                  <div className="font-semibold mb-3 text-white">Menu Items</div>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {menuItems.map((m) => (
                      <button key={m.id} onClick={() => addItem(m)} disabled={!m.isAvailable} className={`w-full text-left p-2 rounded-lg border transition-all ${m.isAvailable ? "border-slate-600 hover:border-amber-400" : "opacity-50 cursor-not-allowed"}`}>
                        <div className="flex items-center gap-3">
                          <img src={m.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=220&fit=crop&auto=format"} alt={m.name} className="w-14 h-14 rounded-lg object-cover border border-slate-600" />
                          <div>
                            <div className="text-sm font-medium text-white">{m.name}</div>
                            <div className="text-xs text-gray-300 mt-0.5">${m.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border border-slate-700 rounded-xl p-3 sm:p-4 bg-slate-800">
                  <div className="font-semibold mb-3 text-white">Order Ticket</div>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {draftItems.map((d) => (
                      <div key={d.id} className="p-3 rounded-lg border border-slate-700 bg-slate-900/70">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-white">{d.name}</span>
                          <button onClick={() => removeDraft(d.id)} className="text-red-400">x</button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateDraft(d.id, { quantity: Math.max(1, d.quantity - 1) })} className="w-7 h-7 rounded bg-slate-800 border border-slate-600 text-white">-</button>
                          <span className="text-sm font-medium w-6 text-center text-white">{d.quantity}</span>
                          <button onClick={() => updateDraft(d.id, { quantity: d.quantity + 1 })} className="w-7 h-7 rounded bg-slate-800 border border-slate-600 text-white">+</button>
                        </div>
                        <input value={d.notes} onChange={(e) => updateDraft(d.id, { notes: e.target.value })} placeholder="Add note (optional)" className="mt-2 w-full text-xs p-2 rounded border border-slate-600 bg-slate-800 text-white" />
                      </div>
                    ))}
                    {draftItems.length === 0 && <div className="text-sm text-gray-400 text-center py-8">No items added yet.</div>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-700 flex justify-end gap-2 bg-slate-800">
              <button onClick={() => setShowOrderModal(false)} className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-900 text-white">Cancel</button>
              <button onClick={submitOrder} className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 shadow-sm">Save & Send</button>
            </div>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div>
                <h3 className="text-white font-semibold">Edit Order - Table {editingOrder.tableNo}</h3>
                <p className="text-xs text-gray-300">You can edit unless sent to cashier/paid.</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-gray-200">x</button>
            </div>

            <div className="p-4 grid md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <div className="text-white font-medium mb-2">Add More Items</div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {menuItems.filter((m) => m.isAvailable).map((m) => (
                    <button key={m.id} onClick={() => addMenuItemToEdit(m)} className="w-full text-left p-2 rounded-lg border border-slate-600 hover:border-amber-400">
                      <div className="flex items-center gap-2">
                        <img src={m.imageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300&h=220&fit=crop&auto=format"} alt={m.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <div className="text-sm text-white">{m.name}</div>
                          <div className="text-xs text-gray-300">${m.price.toFixed(2)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
                <div className="text-white font-medium mb-2">Edit Items</div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {editItems.map((item) => (
                    <div key={item.id} className="p-2 rounded border border-slate-700 bg-slate-900/70">
                      <div className="flex justify-between">
                        <span className="text-sm text-white">{item.name}</span>
                        <button onClick={() => removeEditItem(item.id)} className="text-red-400 text-xs">remove</button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateEditItem(item.id, { quantity: Math.max(1, item.quantity - 1) })} className="w-7 h-7 rounded bg-slate-800 border border-slate-600 text-white">-</button>
                        <span className="text-sm text-white w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateEditItem(item.id, { quantity: item.quantity + 1 })} className="w-7 h-7 rounded bg-slate-800 border border-slate-600 text-white">+</button>
                      </div>
                      <input value={item.notes} onChange={(e) => updateEditItem(item.id, { notes: e.target.value })} placeholder="notes" className="mt-2 w-full text-xs p-2 rounded bg-slate-800 border border-slate-600 text-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end gap-2 bg-slate-800">
              <button onClick={() => setEditingOrder(null)} className="px-4 py-2 rounded border border-slate-600 text-white">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 rounded bg-amber-600 text-white">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
