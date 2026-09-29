import type { Customer, Order, OrderStatus, Shift } from '../types';
import { POINTS_PER_EGP, STATUS_FLOW } from './constants';

export const isOpen = (o: Order) => o.status !== 'Completed' && o.status !== 'Cancelled';
export const isUnpaid = (o: Order) => !o.paid && o.status !== 'Cancelled';
export const isPaidSale = (o: Order) => o.paid && !o.refunded;
export const itemCount = (o: Pick<Order, 'lines'>) => o.lines.reduce((s, l) => s + l.qty, 0);

export type AdvanceResult =
  | { ok: true; status: OrderStatus }
  | { ok: false; reason: 'needs-payment' | 'final' };

/** An order can't be completed until it has been paid. */
export function nextStatus(order: Order): AdvanceResult {
  const i = STATUS_FLOW.indexOf(order.status);
  if (i < 0 || i === STATUS_FLOW.length - 1) return { ok: false, reason: 'final' };
  if (order.status === 'Ready to serve' && !order.paid) return { ok: false, reason: 'needs-payment' };
  return { ok: true, status: STATUS_FLOW[i + 1] };
}

export function tierFor(points: number): Customer['tier'] {
  if (points >= 1500) return 'Black';
  if (points >= 500) return 'Gold';
  return 'Silver';
}

export function applyLoyalty(customer: Customer, orderTotal: number, pointsRedeemed: number): Customer {
  const points = customer.points - pointsRedeemed + Math.floor(orderTotal * POINTS_PER_EGP);
  return {
    ...customer,
    points,
    spend: customer.spend + orderTotal,
    visits: customer.visits + 1,
    tier: tierFor(points),
  };
}

/** Opening float plus cash taken on orders paid during the current shift. */
export function cashExpected(orders: Order[], shift: Shift | null): number {
  if (!shift) return 0;
  const cashSales = orders
    .filter((o) => isPaidSale(o) && (o.paidAt ?? 0) >= shift.start)
    .flatMap((o) => o.splits ?? [])
    .filter((s) => s.tender === 'Cash')
    .reduce((sum, s) => sum + s.amount, 0);
  return shift.float + cashSales;
}
