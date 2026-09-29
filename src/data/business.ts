import type {
  Branch,
  Customer,
  Device,
  GiftCard,
  Integration,
  Promo,
  PurchaseOrder,
  Reservation,
  Supplier,
  User,
} from '../types';

export const BRANCHES: Branch[] = [
  { id: 'maadi', name: 'Maadi', city: 'Cairo', online: true },
  { id: 'zamalek', name: 'Zamalek', city: 'Cairo', online: true },
  { id: 'sheikh', name: 'Sheikh Zayed', city: 'Giza', online: false },
];

export const SUPPLIERS: Supplier[] = [
  { name: 'Al Ahram Foods', terms: 'Net 15', phone: '0100 111 2233' },
  { name: 'Cairo Poultry', terms: 'COD', phone: '0122 444 5566' },
  { name: 'Green Valley', terms: 'Net 7', phone: '0111 777 8899' },
  { name: 'Bakery Co', terms: 'Daily', phone: '0106 222 3344' },
  { name: 'Juhayna', terms: 'Net 30', phone: '19222' },
];

export const CUSTOMERS: Customer[] = [
  { id: 1, name: 'Leslie Alexander', phone: '0100 123 4567', visits: 14, spend: 4120, points: 412, tier: 'Silver' },
  { id: 2, name: 'Sara Adel', phone: '0122 987 6543', visits: 31, spend: 9800, points: 980, tier: 'Gold' },
  { id: 3, name: 'Omar Hassan', phone: '0111 555 1212', visits: 6, spend: 1450, points: 145, tier: 'Silver' },
  { id: 4, name: 'Nour Kamel', phone: '0106 321 9876', visits: 52, spend: 18200, points: 1820, tier: 'Black' },
  { id: 5, name: 'Esther Howard', phone: '0128 444 0000', visits: 2, spend: 380, points: 38, tier: 'Silver' },
];

export const PROMOS: Promo[] = [
  { code: 'TALI10', name: 'Welcome 10%', type: 'Coupon', value: 10, active: true, uses: 23 },
  { code: 'RAMADAN20', name: 'Iftar 20% off', type: 'Coupon', value: 20, active: true, uses: 140 },
  { code: '', name: 'Happy hour drinks −30%', type: 'Timed event', value: 30, active: false, uses: 0, note: 'Weekdays 16:00–18:00 · Drinks' },
  { code: '', name: 'Buy 2 koshary get 1 lentil soup', type: 'Promotion', value: 0, active: true, uses: 11 },
];

export const GIFT_CARDS: GiftCard[] = [
  { code: 'GC-4471', balance: 150 },
  { code: 'GC-4472', balance: 420 },
  { code: 'GC-4480', balance: 0 },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { no: 'PO-1041', supplier: 'Cairo Poultry', lines: [{ ingredientId: 'beef', qty: 10 }, { ingredientId: 'chick', qty: 10 }], total: 5000, status: 'Awaiting approval' },
  { no: 'PO-1040', supplier: 'Bakery Co', lines: [{ ingredientId: 'bread', qty: 300 }], total: 750, status: 'Received' },
  { no: 'PO-1039', supplier: 'Al Ahram Foods', lines: [{ ingredientId: 'rice', qty: 25 }, { ingredientId: 'lentil', qty: 10 }, { ingredientId: 'pasta', qty: 10 }], total: 1470, status: 'Sent' },
];

export const TRANSFERS: { label: string; status: string; color: string }[] = [
  { label: 'TR-208 · Central kitchen → Maadi', status: 'In transit', color: 'blue' },
  { label: 'TR-207 · Maadi → Zamalek (bread 60 pc)', status: 'Received', color: 'lime' },
  { label: 'Waste adjustment ADJ-91', status: 'Needs approval', color: 'yellow' },
];

export const RESERVATIONS: Reservation[] = [
  { name: 'Family Mansour', time: '19:30', covers: 6, table: 7 },
  { name: 'A. Youssef', time: '20:00', covers: 2, table: 2 },
  { name: 'Birthday · Dina', time: '21:00', covers: 10, table: 8 },
];

export const USERS: User[] = [
  { name: 'Mahmoud Fathy', role: 'Cashier', branch: 'Maadi' },
  { name: 'Karim Adel', role: 'Kitchen', branch: 'Maadi' },
  { name: 'Noura Samir', role: 'Branch manager', branch: 'Maadi' },
  { name: 'Dina Lotfy', role: 'Accountant', branch: 'All' },
  { name: 'Tariq Nabil', role: 'Owner', branch: 'All' },
];

export const ROLE_PERMISSIONS: Record<User['role'], string[]> = {
  Cashier: ['Take orders', 'Accept payments'],
  Kitchen: ['View KDS', 'Bump tickets'],
  'Branch manager': ['Void & refund', 'Discounts', 'Shift close', 'Inventory counts'],
  Accountant: ['Reports', 'Exports', 'Tax'],
  Owner: ['Everything'],
};

export const INTEGRATIONS: Integration[] = [
  { name: 'Talabat', category: 'Delivery aggregator', on: true },
  { name: 'elmenus', category: 'Delivery aggregator', on: true },
  { name: 'Noon Food', category: 'Delivery aggregator', on: false },
  { name: 'Fawry', category: 'Payments', on: true },
  { name: 'InstaPay', category: 'Payments', on: true },
  { name: 'ETA e-receipts', category: 'Compliance', on: true },
  { name: 'QuickBooks', category: 'Accounting', on: false },
  { name: 'WhatsApp Business', category: 'Marketing', on: true },
];

export const DEVICES: Device[] = [
  { name: 'POS-01 · this device', type: 'Android POS', lastSync: 'just now', version: '2.4.1', online: true },
  { name: 'POS-02', type: 'iPad cashier', lastSync: '1 min ago', version: '2.4.1', online: true },
  { name: 'KDS-01', type: 'Kitchen display', lastSync: 'just now', version: '2.4.0', online: true },
  { name: 'P-01', type: 'Receipt printer', lastSync: '—', version: '—', online: true },
  { name: 'T-01', type: 'Tali Pay terminal', lastSync: '30 s ago', version: 'fw 1.9', online: true },
  { name: 'KIOSK-01', type: 'Self-order kiosk', lastSync: '4 h ago', version: '2.3.8', online: false },
];
