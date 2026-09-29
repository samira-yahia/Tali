import { stockLevel } from '../../domain/inventory';
import { isOpen } from '../../domain/orders';
import { useTali } from '../../store/useTali';

/** Badge counts shown on navigation items, keyed by route path. */
export function useNavCounts(): Record<string, number> {
  const orders = useTali((s) => s.orders);
  const ingredients = useTali((s) => s.ingredients);
  return {
    '/kds': orders.filter((o) => o.status === 'New' || o.status === 'In progress').length,
    '/orders': orders.filter(isOpen).length,
    '/inventory': ingredients.filter((i) => stockLevel(i) === 'critical').length,
  };
}
