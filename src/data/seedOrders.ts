import type { Order, OrderStatus, OrderType, Tender } from '../types';
import { depleteStock } from '../domain/inventory';
import { calcTotals, priceLines } from '../domain/pricing';
import { INGREDIENTS, MENU } from './menu';

type SeedLine = [itemId: number, qty: number, mods?: string[]];

interface SeedSpec {
  customer: string;
  customerId?: number;
  type: OrderType;
  table?: string;
  lines: SeedLine[];
  status: OrderStatus;
  minutesAgo: number;
  tender?: Tender;
  cancelReason?: string;
}

const SPECS: SeedSpec[] = [
  { customer: 'Leslie Alexander', customerId: 1, type: 'Dine in', table: 'Table 6', lines: [[1, 2], [10, 1]], status: 'Ready to serve', minutesAgo: 6 },
  { customer: 'Sara Adel', customerId: 2, type: 'Dine in', table: 'Table 3', lines: [[7, 1], [12, 2], [14, 2, ['Large']]], status: 'In progress', minutesAgo: 4 },
  { customer: 'Omar Hassan', customerId: 3, type: 'Take away', lines: [[6, 2, ['Beef']], [15, 1]], status: 'Completed', minutesAgo: 12, tender: 'Card' },
  { customer: 'Nour Kamel', customerId: 4, type: 'Delivery', lines: [[3, 1], [17, 1]], status: 'Cancelled', minutesAgo: 9, cancelReason: 'Customer cancelled' },
  { customer: 'Esther Howard', customerId: 5, type: 'Dine in', table: 'Table 1', lines: [[9, 1], [13, 1], [16, 2]], status: 'New', minutesAgo: 1 },
  { customer: 'Walk-in', type: 'Take away', lines: [[1, 1], [14, 1]], status: 'Completed', minutesAgo: 35, tender: 'Cash' },
  { customer: 'Walk-in', type: 'Take away', lines: [[5, 2], [15, 2]], status: 'Completed', minutesAgo: 58, tender: 'InstaPay' },
  { customer: 'Talabat #88213', type: 'Delivery', lines: [[8, 1], [12, 1], [14, 1]], status: 'Completed', minutesAgo: 75, tender: 'Card' },
  { customer: 'Walk-in', type: 'Dine in', table: 'Table 4', lines: [[2, 1], [10, 1], [16, 1]], status: 'Completed', minutesAgo: 110, tender: 'Cash' },
];

export const FIRST_ORDER_NO = 6836457;

export function buildSeed(now = Date.now()) {
  const orders: Order[] = SPECS.map((s, i) => {
    const lines = priceLines(
      s.lines.map(([itemId, qty, mods]) => ({ itemId, qty, mods: mods ?? [], note: '' })),
      MENU,
    );
    const totals = calcTotals(lines, null, s.type);
    const createdAt = now - s.minutesAgo * 60000;
    const order: Order = {
      ...totals,
      no: FIRST_ORDER_NO + i,
      customer: s.customer,
      customerId: s.customerId ?? null,
      type: s.type,
      table: s.table ?? '',
      status: s.status,
      lines,
      createdAt,
      paid: !!s.tender,
      cancelReason: s.cancelReason,
    };
    if (s.tender) {
      order.tender = s.tender;
      order.paidAt = createdAt + 2 * 60000;
      order.splits = [{ tender: s.tender, amount: totals.total }];
    }
    return order;
  });

  const sold = orders.filter((o) => o.status !== 'Cancelled').flatMap((o) => o.lines);
  const { ingredients } = depleteStock(INGREDIENTS, sold, MENU);

  return { orders, ingredients, nextNo: FIRST_ORDER_NO + orders.length };
}
