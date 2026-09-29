import type { Category, ModifierGroup, ModifierGroupId, OrderStatus, OrderType, Station, Tender } from '../types';

export const VAT_RATE = 0.14;
export const SERVICE_RATE = 0.12;

export const ORDER_TYPES: OrderType[] = ['Dine in', 'Take away', 'Delivery'];
export const STATUS_FLOW: OrderStatus[] = ['New', 'In progress', 'Ready to serve', 'Completed'];
export const TENDERS: Tender[] = ['Cash', 'Card', 'InstaPay', 'Fawry', 'Gift card', 'Points'];
export const CATEGORIES: Category[] = ['Main course', 'Grills', 'Soup', 'Salads', 'Drinks', 'Dessert'];

export const STATION_BY_CATEGORY: Record<Category, Station> = {
  'Main course': 'Hot',
  Grills: 'Grill',
  Soup: 'Hot',
  Salads: 'Cold',
  Drinks: 'Bar',
  Dessert: 'Cold',
};

export const MODIFIER_GROUPS: Record<ModifierGroupId, ModifierGroup> = {
  size: { name: 'Size', options: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 15 }] },
  protein: {
    name: 'Protein',
    options: [
      { name: 'Chicken', price: 0 },
      { name: 'Beef', price: 25 },
      { name: 'Extra meat', price: 35 },
    ],
  },
};

export const TABLES = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ n, seats: n > 6 ? 8 : 4 }));

/** Tickets older than this are flagged late on the KDS and dashboard. */
export const LATE_AFTER_MINUTES = 12;

export const POINTS_PER_EGP = 0.1;
/** 100 points = EGP 10 */
export const EGP_PER_POINT = 0.1;
export const MIN_POINTS_TO_REDEEM = 100;
