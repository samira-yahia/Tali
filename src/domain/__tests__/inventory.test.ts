import { describe, expect, it } from 'vitest';
import { INGREDIENTS, MENU } from '../../data/menu';
import { depleteStock, isAvailable, suggestPurchases } from '../inventory';

describe('inventory', () => {
  it('depletes recipe ingredients and reports the consumed value', () => {
    const { ingredients, consumedValue } = depleteStock(INGREDIENTS, [{ itemId: 10, qty: 2 }], MENU); // lentil soup
    expect(ingredients.find((i) => i.id === 'lentil')!.stock).toBe(5.8);
    expect(ingredients.find((i) => i.id === 'veg')!.stock).toBe(11.9);
    expect(consumedValue).toBeCloseTo(0.2 * 45 + 0.1 * 25);
    expect(INGREDIENTS.find((i) => i.id === 'lentil')!.stock).toBe(6);
  });

  it('marks a dish unavailable when an ingredient runs out', () => {
    expect(isAvailable(MENU.find((m) => m.name === 'Konafa')!, INGREDIENTS)).toBe(false);
    expect(isAvailable(MENU.find((m) => m.name === 'Koshary')!, INGREDIENTS)).toBe(true);
  });

  it('suggests topping below-par stock up to par + 20%', () => {
    const poultry = suggestPurchases(INGREDIENTS)['Cairo Poultry'];
    const beef = poultry.find((l) => l.ingredient.id === 'beef')!;
    expect(beef.qty).toBe(7.5);
    expect(beef.cost).toBe(7.5 * 380);
  });
});
