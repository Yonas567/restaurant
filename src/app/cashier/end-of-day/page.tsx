'use client';

import React, { useMemo, useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportMode = 'today' | 'custom';

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

export default function CashierReportsPage() {
  const { orders, tables, staff } = useRestaurant();
  const today = new Date();
  const [mode, setMode] = useState<ReportMode>('today');
  const [fromDate, setFromDate] = useState(toISODate(today));
  const [toDate, setToDate] = useState(toISODate(today));

  const waiterMap = useMemo(() => {
    const map: Record<string, string> = {};
    staff.forEach((s) => {
      map[s.id] = s.name;
    });
    return map;
  }, [staff]);

  const rangeStart = useMemo(() => {
    const d = mode === 'today' ? new Date() : new Date(fromDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [mode, fromDate]);

  const rangeEnd = useMemo(() => {
    const d = mode === 'today' ? new Date() : new Date(toDate);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [mode, toDate]);

  const paidOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === 'paid')
        .filter((o) => {
          const paidAt = o.paidAt ? new Date(o.paidAt) : new Date();
          return paidAt >= rangeStart && paidAt <= rangeEnd;
        })
        .map((o) => {
          const tableNo = tables.find((t) => t.id === o.tableId)?.number || '?';
          const paidAt = o.paidAt ? new Date(o.paidAt) : new Date();
          const total = o.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          return {
            id: o.id,
            tableNo,
            waiter: waiterMap[o.waiterId] || o.waiterId,
            paidAt,
            itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
            total,
          };
        }),
    [orders, rangeStart, rangeEnd, tables, waiterMap],
  );

  const summary = useMemo(() => {
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = paidOrders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, avgTicket };
  }, [paidOrders]);

  const exportPdf = () => {
    const doc = new jsPDF();
    const title = mode === 'today' ? 'Cashier Report - Today' : `Cashier Report - ${fromDate} to ${toDate}`;

    doc.setFontSize(16);
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);

    doc.setFontSize(11);
    doc.text(`Total Orders: ${summary.totalOrders}`, 14, 31);
    doc.text(`Total Revenue: $${summary.totalRevenue.toFixed(2)}`, 14, 37);
    doc.text(`Average Ticket: $${summary.avgTicket.toFixed(2)}`, 14, 43);

    autoTable(doc, {
      startY: 50,
      head: [['Order', 'Table', 'Waiter', 'Paid At', 'Items', 'Total']],
      body: paidOrders.map((o) => [
        o.id.toUpperCase(),
        `Table ${o.tableNo}`,
        o.waiter,
        o.paidAt.toLocaleString(),
        String(o.itemCount),
        `$${o.total.toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [217, 119, 6] },
    });

    doc.save(mode === 'today' ? 'cashier-report-today.pdf' : `cashier-report-${fromDate}-to-${toDate}.pdf`);
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-sm">
        <h1 className="text-2xl font-bold text-white font-serif">Cashier Reports</h1>
        <p className="text-xs text-gray-300 mt-1">Generate POS report as PDF: today or custom date range.</p>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex rounded-lg overflow-hidden border border-slate-600">
            <button
              onClick={() => setMode('today')}
              className={`px-3 py-2 text-xs ${mode === 'today' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-gray-300'}`}
            >
              Today
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`px-3 py-2 text-xs ${mode === 'custom' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-gray-300'}`}
            >
              Custom Range
            </button>
          </div>

          {mode === 'custom' && (
            <>
              <label className="text-xs text-gray-300">
                From
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1 block bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white"
                />
              </label>
              <label className="text-xs text-gray-300">
                To
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 block bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-white"
                />
              </label>
            </>
          )}

          <button onClick={exportPdf} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium">
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">Total Orders</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalOrders}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${summary.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500">Average Ticket</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">${summary.avgTicket.toFixed(2)}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 font-medium text-gray-800 dark:text-gray-200">
          Paid Orders ({paidOrders.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 text-xs uppercase">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Table</th>
                <th className="px-4 py-2">Waiter</th>
                <th className="px-4 py-2">Paid At</th>
                <th className="px-4 py-2">Items</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paidOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{o.id.toUpperCase()}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">Table {o.tableNo}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{o.waiter}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{o.paidAt.toLocaleString()}</td>
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{o.itemCount}</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900 dark:text-white">${o.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paidOrders.length === 0 && <div className="px-4 py-8 text-center text-sm text-gray-500">No paid orders in selected range.</div>}
      </div>
    </div>
  );
}
