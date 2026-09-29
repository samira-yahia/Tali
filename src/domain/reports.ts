import type { Ingredient, MenuItem, Order, Shift } from '../types';
import { clock, money } from '../lib/format';
import { cogs } from './inventory';
import { isPaidSale } from './orders';
import { lineTotal } from './pricing';

export const REPORT_TABS = {
  sales: 'Sales',
  products: 'Products',
  payments: 'Payments',
  tax: 'Tax',
  staff: 'Staff & shifts',
  voids: 'Discounts & voids',
} as const;
export type ReportTab = keyof typeof REPORT_TABS;

type Cell = string | number;
/** First row is the header. */
export type ReportRows = Cell[][];

interface ReportInput {
  orders: Order[];
  menu: MenuItem[];
  ingredients: Ingredient[];
  shift: Shift | null;
}

const SETTLEMENT: Record<string, string> = {
  Cash: 'In drawer',
  Card: 'T+1 · Tali Pay',
  Points: 'Loyalty liability',
  'Gift card': 'Prepaid',
};

export function buildReport(tab: ReportTab, { orders, menu, ingredients, shift }: ReportInput): ReportRows {
  const paid = orders.filter(isPaidSale);
  const active = orders.filter((o) => o.status !== 'Cancelled');
  const activeTotal = active.reduce((s, o) => s + o.total, 0);

  switch (tab) {
    case 'sales': {
      const byType: Record<string, { n: number; total: number; discount: number }> = {};
      for (const o of active) {
        const t = (byType[o.type] ??= { n: 0, total: 0, discount: 0 });
        t.n++;
        t.total += o.total;
        t.discount += o.discount;
      }
      return [
        ['Channel', 'Orders', 'Discounts', 'Net sales', 'Avg order'],
        ...Object.entries(byType).map(([k, v]) => [k, v.n, money(v.discount), money(v.total), money(v.total / v.n)]),
        ['Total', active.length, money(active.reduce((s, o) => s + o.discount, 0)), money(activeTotal), money(activeTotal / (active.length || 1))],
      ];
    }
    case 'products': {
      const byItem: Record<number, { qty: number; revenue: number }> = {};
      for (const l of active.flatMap((o) => o.lines)) {
        const t = (byItem[l.itemId] ??= { qty: 0, revenue: 0 });
        t.qty += l.qty;
        t.revenue += lineTotal(l);
      }
      return [
        ['Dish', 'Category', 'Qty sold', 'Revenue', 'Food cost', 'Margin'],
        ...Object.entries(byItem)
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .map(([id, v]) => {
            const item = menu.find((m) => m.id === +id);
            const cost = cogs([{ itemId: +id, qty: v.qty }], menu, ingredients);
            return [item?.name ?? `#${id}`, item?.category ?? '—', v.qty, money(v.revenue), money(cost), `${Math.round(((v.revenue - cost) / v.revenue) * 100)}%`];
          }),
      ];
    }
    case 'payments': {
      const paidTotal = paid.reduce((s, o) => s + o.total, 0) || 1;
      const byTender: Record<string, { n: number; amount: number }> = {};
      for (const s of paid.flatMap((o) => o.splits ?? [])) {
        const t = (byTender[s.tender] ??= { n: 0, amount: 0 });
        t.n++;
        t.amount += s.amount;
      }
      return [
        ['Tender', 'Transactions', 'Amount', 'Share', 'Settlement'],
        ...Object.entries(byTender).map(([k, v]) => [k, v.n, money(v.amount), `${Math.round((v.amount / paidTotal) * 100)}%`, SETTLEMENT[k] ?? 'T+1']),
      ];
    }
    case 'tax': {
      const net = paid.reduce((s, o) => s + o.subtotal - o.discount, 0);
      const service = paid.reduce((s, o) => s + o.service, 0);
      const vat = paid.reduce((s, o) => s + o.vat, 0);
      return [
        ['Line', 'Amount', 'Note'],
        ['Net sales (ex VAT)', money(net + service), 'Includes service charge'],
        ['VAT 14% collected', money(vat), 'Payable to ETA'],
        ['E-receipts submitted', paid.length, 'ETA · 100% accepted'],
        ['Gross', money(net + service + vat), ''],
      ];
    }
    case 'staff': {
      const cancelled = orders.filter((o) => o.status === 'Cancelled');
      return [
        ['Staff', 'Role', 'Clocked in', 'Orders', 'Sales', 'Voids'],
        ['Mahmoud Fathy', 'Cashier', shift ? clock(shift.start) : '—', active.length, money(activeTotal), cancelled.length],
        ['Karim Adel', 'Kitchen', '08:30', `${orders.filter((o) => o.status === 'Completed').length} bumped`, '—', 0],
        ['Noura Samir', 'Branch manager', '08:00', '—', '—', `${orders.filter((o) => o.cancelReason).length} approved`],
      ];
    }
    case 'voids':
      return [
        ['Order', 'Type', 'Reason / label', 'Amount', 'By'],
        ...orders
          .filter((o) => o.status === 'Cancelled' || o.discount > 0)
          .map((o) => {
            const cancelled = o.status === 'Cancelled';
            return [
              `#${o.no}`,
              cancelled ? (o.refunded ? 'Refund' : 'Void') : 'Discount',
              o.cancelReason ?? o.discountLabel ?? '—',
              money(cancelled ? o.total : o.discount),
              'Mahmoud · approved by Noura',
            ];
          }),
      ];
  }
}

export function toCsv(rows: ReportRows): string {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
}
