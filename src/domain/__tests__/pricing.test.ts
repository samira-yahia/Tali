import { describe, expect, it } from 'vitest';
import { MENU } from '../../data/menu';
import { calcTotals, priceLines, unitPrice } from '../pricing';

const koshary = MENU.find((m) => m.id === 1)!;

describe('unitPrice', () => {
  it('adds the modifier surcharge to the base price', () => {
    expect(unitPrice(koshary, [])).toBe(65);
    expect(unitPrice(koshary, ['Large'])).toBe(80);
  });
});

describe('calcTotals', () => {
  const lines = priceLines([{ itemId: 1, qty: 2, mods: [], note: '' }], MENU); // 130

  it('charges 12% service and 14% VAT on dine-in orders', () => {
    const t = calcTotals(lines, null, 'Dine in');
    expect(t.subtotal).toBe(130);
    expect(t.service).toBeCloseTo(15.6);
    expect(t.vat).toBeCloseTo((130 + 15.6) * 0.14);
    expect(t.total).toBeCloseTo(130 + 15.6 + 20.384);
  });

  it('skips service on take away and delivery', () => {
    for (const type of ['Take away', 'Delivery'] as const) {
      const t = calcTotals(lines, null, type);
      expect(t.service).toBe(0);
      expect(t.total).toBeCloseTo(130 * 1.14);
    }
  });

  it('applies a percentage discount before service and VAT', () => {
    const t = calcTotals(lines, { kind: 'percent', value: 10, label: 'TALI10' }, 'Take away');
    expect(t.discount).toBeCloseTo(13);
    expect(t.total).toBeCloseTo(117 * 1.14);
  });

  it('never discounts more than the subtotal', () => {
    const t = calcTotals(lines, { kind: 'amount', value: 500, label: 'Manager' }, 'Dine in');
    expect(t.discount).toBe(130);
    expect(t.total).toBe(0);
  });
});
