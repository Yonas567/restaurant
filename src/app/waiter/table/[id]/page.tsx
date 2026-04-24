"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRestaurant } from "@/context/RestaurantContext";

export default function TableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tableId = params.id as string;
  const { tables, setTables, orders, setOrders } = useRestaurant();

  const [table, setTable] = useState(tables.find((t) => t.id === tableId));
  const [order, setOrder] = useState(orders.find((o) => o.tableId === tableId && o.status !== "paid"));

  useEffect(() => {
    setTable(tables.find((t) => t.id === tableId));
    setOrder(orders.find((o) => o.tableId === tableId && o.status !== "paid"));
  }, [tables, orders, tableId]);

  if (!table) return <div className="p-4">Table not found</div>;

  const requestBill = () => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: "ready_to_pay" } : t)));
  };

  const markServed = (itemId: string) => {
    if (!order) return;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, items: o.items.map((i) => (i.id === itemId ? { ...i, status: "served" } : i)) } : o)));
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "bg-gray-100 text-gray-800";
    if (s === "preparing") return "bg-yellow-100 text-yellow-800";
    if (s === "ready") return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-5 pb-10">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div>
          <button onClick={() => router.push('/waiter/dashboard')} className="text-sm text-gray-500">← Back</button>
          <h1 className="text-2xl font-bold font-serif">Table {table.number}</h1>
          <p className="text-sm text-gray-500">{table.section}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-gray-100">{table.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Current Order Status</h2>
        </div>
        {!order || order.items.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No items yet.</div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map((item) => (
              <li key={item.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.quantity}x {item.name}</div>
                  {item.notes && <div className="text-xs text-gray-500">note: {item.notes}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${statusColor(item.status)}`}>{item.status}</span>
                  {item.status === 'ready' && (
                    <button onClick={() => markServed(item.id)} className="text-xs px-2 py-1 rounded bg-blue-600 text-white">Mark Served</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/waiter/table/${tableId}/order`}>
          <button className="w-full py-3 rounded-lg bg-amber-600 text-white">Add More Items</button>
        </Link>
        <button onClick={requestBill} disabled={table.status === 'ready_to_pay'} className="w-full py-3 rounded-lg border border-gray-300 bg-white disabled:bg-gray-200">
          {table.status === 'ready_to_pay' ? 'Bill Requested' : 'Request Bill'}
        </button>
      </div>
    </div>
  );
}
