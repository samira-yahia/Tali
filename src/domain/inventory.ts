import type { CartLine, Ingredient, MenuItem } from '../types';

const round = (n: number, digits = 2) => +n.toFixed(digits);

export function recipeCost(item: MenuItem, ingredients: Ingredient[]): number {
  return Object.entries(item.recipe).reduce((sum, [id, qty]) => {
    const ing = ingredients.find((i) => i.id === id);
    return sum + (ing ? qty * ing.cost : 0);
  }, 0);
}

export function cogs(lines: Pick<CartLine, 'itemId' | 'qty'>[], menu: MenuItem[], ingredients: Ingredient[]): number {
  return lines.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.itemId);
    return sum + (item ? recipeCost(item, ingredients) * line.qty : 0);
  }, 0);
}

export function isAvailable(item: MenuItem, ingredients: Ingredient[]): boolean {
  return Object.entries(item.recipe).every(([id, qty]) => {
    const ing = ingredients.find((i) => i.id === id);
    return !!ing && ing.stock >= qty;
  });
}

/** Returns the new stock levels and the value (at cost) of what was consumed. */
export function depleteStock(
  ingredients: Ingredient[],
  lines: Pick<CartLine, 'itemId' | 'qty'>[],
  menu: MenuItem[],
): { ingredients: Ingredient[]; consumedValue: number } {
  const next = ingredients.map((i) => ({ ...i }));
  let consumedValue = 0;
  for (const line of lines) {
    const item = menu.find((m) => m.id === line.itemId);
    if (!item) continue;
    for (const [id, qty] of Object.entries(item.recipe)) {
      const ing = next.find((i) => i.id === id);
      if (!ing) continue;
      const used = qty * line.qty;
      ing.stock = Math.max(0, round(ing.stock - used));
      consumedValue += used * ing.cost;
    }
  }
  return { ingredients: next, consumedValue };
}

export type StockLevel = 'ok' | 'low' | 'critical';

export function stockLevel(ing: Ingredient): StockLevel {
  if (ing.stock < ing.par * 0.5) return 'critical';
  if (ing.stock < ing.par) return 'low';
  return 'ok';
}

/** Brings every below-par ingredient back to par + 20%, grouped by supplier. */
export function suggestPurchases(ingredients: Ingredient[]) {
  const bySupplier: Record<string, { ingredient: Ingredient; qty: number; cost: number }[]> = {};
  for (const ing of ingredients.filter((i) => i.stock < i.par)) {
    const qty = round(ing.par * 1.2 - ing.stock, 1);
    (bySupplier[ing.supplier] ??= []).push({ ingredient: ing, qty, cost: qty * ing.cost });
  }
  return bySupplier;
}
