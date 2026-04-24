"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRestaurant } from "@/context/RestaurantContext";

export default function CashierDashboard() {
  const { tables, orders, staff } = useRestaurant();
  const [filter, setFilter] = useState<"all" | "sent" | "processing" | "paid">(
    "all",
  );
  const [dateMode, setDateMode] = useState<"today" | "custom" | "all">("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const waiterMap = useMemo(() => {
    const map: Record<string, string> = {};
    staff.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [staff]);

  const queue = useMemo(
    () =>
      orders
        .map((o) => {
          const table = tables.find((t) => t.id === o.tableId);
          const total = o.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          const statusLabel =
            o.status === "sent_to_cashier"
              ? "sent"
              : o.status === "paid"
                ? "paid"
                : "processing";
          return {
            ...o,
            tableNo: table?.number || "?",
            tableStatus: table?.status,
            waiterName: waiterMap[o.waiterId] || o.waiterId,
            total,
            itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
            statusLabel,
          };
        })
        .filter(
          (o) =>
            o.status === "sent_to_cashier" ||
            o.status === "paid" ||
            o.status === "ready",
        ),
    [orders, tables, waiterMap],
  );

  const visible = queue.filter((q) => {
    const statusMatch =
      filter === "all"
        ? true
        : filter === "sent"
          ? q.status === "sent_to_cashier"
          : filter === "paid"
            ? q.status === "paid"
            : q.status === "ready";

    if (!statusMatch) return false;

    if (dateMode === "all") return true;
    if (dateMode === "today") {
      return (
        q.status !== "paid" ||
        (q.paidAt || "").slice(0, 10) === new Date().toISOString().slice(0, 10)
      );
    }

    if (q.status !== "paid") return false;
    return (q.paidAt || "").slice(0, 10) === selectedDate;
  });

  const statusClass = (status: string) => {
    if (status === "sent_to_cashier") return "bg-amber-700 text-amber-100";
    if (status === "paid") return "bg-emerald-700 text-emerald-100";
    return "bg-slate-700 text-slate-100";
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 border border-slate-700 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">
            Cashier POS Board
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Built to match waiter flow: receive cashier cards, process bill,
            close table.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All"],
            ["sent", "Sent to Cashier"],
            ["processing", "Ready Orders"],
            ["paid", "Paid"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() =>
                setFilter(value as "all" | "sent" | "processing" | "paid")
              }
              className={`px-3 py-1.5 rounded-lg text-xs border ${filter === value ? "bg-amber-600 text-white border-amber-500" : "bg-slate-800 text-gray-300 border-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-wrap items-end gap-3">
        <div className="flex rounded-lg overflow-hidden border border-slate-600">
          <button
            onClick={() => setDateMode("today")}
            className={`px-3 py-2 text-xs ${dateMode === "today" ? "bg-amber-600 text-white" : "bg-slate-800 text-gray-300"}`}
          >
            Today
          </button>
          <button
            onClick={() => setDateMode("custom")}
            className={`px-3 py-2 text-xs ${dateMode === "custom" ? "bg-amber-600 text-white" : "bg-slate-800 text-gray-300"}`}
          >
            Select Day
          </button>
          <button
            onClick={() => setDateMode("all")}
            className={`px-3 py-2 text-xs ${dateMode === "all" ? "bg-amber-600 text-white" : "bg-slate-800 text-gray-300"}`}
          >
            All Days
          </button>
        </div>
        {dateMode === "custom" && (
          <label className="text-xs text-gray-300">
            Day
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white"
            />
          </label>
        )}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((card) => (
          <div
            key={card.id}
            className="bg-slate-900 rounded-xl border border-slate-700 p-4 text-white shadow-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="text-sm font-semibold">
                  Table {card.tableNo}
                </div>
                <div className="text-xs text-gray-300">
                  Waiter: {card.waiterName}
                </div>
              </div>
              <span
                className={`text-[11px] px-2 py-1 rounded-full ${statusClass(card.status)}`}
              >
                {card.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="mt-3 rounded border border-slate-700 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-gray-300">
                  <tr>
                    <th className="px-2 py-1.5 font-medium">Item</th>
                    <th className="px-2 py-1.5 font-medium">Qty</th>
                    <th className="px-2 py-1.5 font-medium text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {card.items.slice(0, 3).map((item) => (
                    <tr key={item.id} className="bg-black/20">
                      <td className="px-2 py-1.5 text-gray-100">{item.name}</td>
                      <td className="px-2 py-1.5 text-gray-300">
                        {item.quantity}x
                      </td>
                      <td className="px-2 py-1.5 text-gray-100 text-right">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-400">
                  {card.itemCount} items total
                </div>
                <div className="text-lg font-bold text-amber-400">
                  ${card.total.toFixed(2)}
                </div>
              </div>
              {card.status !== "paid" ? (
                <Link
                  href={`/cashier/bill/${card.tableId}`}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-medium"
                >
                  Open Bill
                </Link>
              ) : (
                <span className="px-3 py-2 rounded-lg bg-emerald-700 text-xs font-medium">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="bg-slate-900 rounded-xl border border-dashed border-slate-600 p-8 text-center text-gray-400">
          No cashier cards for this filter.
        </div>
      )}
    </div>
  );
}
