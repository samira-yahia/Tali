import { describe, expect, it } from 'vitest';
import type { Order } from '../../types';
import { applyLoyalty, cashExpected, nextStatus, tierFor } from '../orders';

const order = (patch: Partial<Order>): Order => ({
  no: 1,
  customer: 'Walk-in',
  customerId: null,
  type: 'Take away',
  table: '',
  status: 'New',
  lines: [],
  createdAt: 0,
  paid: false,
  subtotal: 100,
  discount: 0,
  service: 0,
  vat: 14,
  total: 114,
  ...patch,
});

describe('nextStatus', () => {
  it('moves an order forward one step', () => {
    expect(nextStatus(order({ status: 'New' }))).toEqual({ ok: true, status: 'In progress' });
    expect(nextStatus(order({ status: 'In progress' }))).toEqual({ ok: true, status: 'Ready to serve' });
  });

  it('blocks completing an unpaid order', () => {
    expect(nextStatus(order({ status: 'Ready to serve' }))).toEqual({ ok: false, reason: 'needs-payment' });
    expect(nextStatus(order({ status: 'Ready to serve', paid: true }))).toEqual({ ok: true, status: 'Completed' });
  });

  it('does not move completed or cancelled orders', () => {
    expect(nextStatus(order({ status: 'Completed' }))).toEqual({ ok: false, reason: 'final' });
    expect(nextStatus(order({ status: 'Cancelled' }))).toEqual({ ok: false, reason: 'final' });
  });
});

describe('loyalty', () => {
  it('uses Silver / Gold 500 / Black 1,500 tiers', () => {
    expect(tierFor(499)).toBe('Silver');
    expect(tierFor(500)).toBe('Gold');
    expect(tierFor(1500)).toBe('Black');
  });

  it('earns 1 point per EGP 10 and deducts redeemed points', () => {
    const c = applyLoyalty({ id: 1, name: 'A', phone: '', visits: 1, spend: 0, points: 495, tier: 'Silver' }, 114, 0);
    expect(c.points).toBe(506);
    expect(c.tier).toBe('Gold');
    expect(c.visits).toBe(2);
  });
});

describe('cashExpected', () => {
  it('adds only cash taken during the shift to the float', () => {
    const shift = { user: 'M', float: 500, start: 1000 };
    const orders = [
      order({ paid: true, paidAt: 2000, splits: [{ tender: 'Cash', amount: 50 }, { tender: 'Card', amount: 64 }] }),
      order({ paid: true, paidAt: 500, splits: [{ tender: 'Cash', amount: 114 }] }),
      order({ paid: true, paidAt: 3000, refunded: true, splits: [{ tender: 'Cash', amount: 114 }] }),
    ];
    expect(cashExpected(orders, shift)).toBe(550);
    expect(cashExpected(orders, null)).toBe(0);
  });
});
