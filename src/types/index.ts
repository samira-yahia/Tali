export type OrderType = 'Dine in' | 'Take away' | 'Delivery';
export type OrderStatus = 'New' | 'In progress' | 'Ready to serve' | 'Completed' | 'Cancelled';
export type Tender = 'Cash' | 'Card' | 'InstaPay' | 'Fawry' | 'Gift card' | 'Points';
export type Station = 'Hot' | 'Grill' | 'Cold' | 'Bar';
export type Category = 'Main course' | 'Grills' | 'Soup' | 'Salads' | 'Drinks' | 'Dessert';
export type ModifierGroupId = 'size' | 'protein';

export interface ModifierGroup {
  name: string;
  options: { name: string; price: number }[];
}

export interface MenuItem {
  id: number;
  category: Category;
  name: string;
  price: number;
  icon: string;
  recipe: Record<string, number>;
  modifiers?: ModifierGroupId;
  hidden?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'l' | 'pc';
  stock: number;
  par: number;
  cost: number;
  supplier: string;
}

export interface CartLine {
  itemId: number;
  qty: number;
  mods: string[];
  note: string;
}

export interface OrderLine extends CartLine {
  unitPrice: number;
}

export interface Discount {
  kind: 'percent' | 'amount';
  value: number;
  label: string;
}

export interface Totals {
  subtotal: number;
  discount: number;
  service: number;
  vat: number;
  total: number;
}

export interface PaymentSplit {
  tender: Tender;
  amount: number;
  cashGiven?: number;
  giftCode?: string;
  points?: number;
}

export interface Order extends Totals {
  no: number;
  customer: string;
  customerId: number | null;
  type: OrderType;
  table: string;
  status: OrderStatus;
  lines: OrderLine[];
  createdAt: number;
  paid: boolean;
  paidAt?: number;
  tender?: Tender | 'Split';
  splits?: PaymentSplit[];
  discountLabel?: string;
  cancelReason?: string;
  refunded?: boolean;
  billRequested?: boolean;
  offline?: boolean;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  visits: number;
  spend: number;
  points: number;
  tier: 'Silver' | 'Gold' | 'Black';
}

export interface Promo {
  code: string;
  name: string;
  type: 'Coupon' | 'Timed event' | 'Promotion';
  value: number;
  active: boolean;
  uses: number;
  note?: string;
}

export interface GiftCard {
  code: string;
  balance: number;
}

export type PurchaseOrderStatus = 'Awaiting approval' | 'Sent' | 'Received';

export interface PurchaseOrder {
  no: string;
  supplier: string;
  lines: { ingredientId: string; qty: number }[];
  total: number;
  status: PurchaseOrderStatus;
}

export interface Supplier {
  name: string;
  terms: string;
  phone: string;
}

export interface Reservation {
  name: string;
  time: string;
  covers: number;
  table: number;
}

export interface Shift {
  user: string;
  float: number;
  start: number;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  online: boolean;
}

export interface User {
  name: string;
  role: 'Cashier' | 'Kitchen' | 'Branch manager' | 'Accountant' | 'Owner';
  branch: string;
}

export interface Integration {
  name: string;
  category: string;
  on: boolean;
}

export interface Device {
  name: string;
  type: string;
  lastSync: string;
  version: string;
  online: boolean;
}
