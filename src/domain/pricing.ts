import type { CartLine, Discount, MenuItem, OrderLine, OrderType, Totals } from '../types';
import { MODIFIER_GROUPS, SERVICE_RATE, VAT_RATE } from './constants';

export function unitPrice(item: MenuItem, mods: string[]): number {
  if (!item.modifiers) return item.price;
  const options = MODIFIER_GROUPS[item.modifiers].options;
  return mods.reduce((sum, mod) => sum + (options.find((o) => o.name === mod)?.price ?? 0), item.price);
}

export function priceLines(lines: CartLine[], menu: MenuItem[]): OrderLine[] {
  return lines.map((line) => {
    const item = menu.find((m) => m.id === line.itemId);
    if (!item) throw new Error(`Unknown menu item ${line.itemId}`);
    return { ...line, mods: [...line.mods], unitPrice: unitPrice(item, line.mods) };
  });
}

export const lineTotal = (line: Pick<OrderLine, 'unitPrice' | 'qty'>) => line.unitPrice * line.qty;

/**
 * Discount comes off the subtotal first. Service (dine-in only) is charged on the
 * discounted subtotal, and VAT is charged on subtotal + service.
 */
export function calcTotals(
  lines: Pick<OrderLine, 'unitPrice' | 'qty'>[],
  discount: Discount | null,
  type: OrderType,
): Totals {
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  let off = 0;
  if (discount?.kind === 'percent') off = (subtotal * discount.value) / 100;
  if (discount?.kind === 'amount') off = Math.min(subtotal, discount.value);
  const net = subtotal - off;
  const service = type === 'Dine in' ? net * SERVICE_RATE : 0;
  const vat = (net + service) * VAT_RATE;
  return { subtotal, discount: off, service, vat, total: net + service + vat };
}
