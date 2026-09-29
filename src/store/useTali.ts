import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CartLine,
  Customer,
  Discount,
  GiftCard,
  Ingredient,
  Integration,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  PaymentSplit,
  Promo,
  PurchaseOrder,
  PurchaseOrderStatus,
  Reservation,
  Shift,
} from '../types';
import { CUSTOMERS, GIFT_CARDS, INTEGRATIONS, PROMOS, PURCHASE_ORDERS, RESERVATIONS } from '../data/business';
import { MENU } from '../data/menu';
import { buildSeed } from '../data/seedOrders';
import { depleteStock, suggestPurchases } from '../domain/inventory';
import { applyLoyalty, nextStatus, type AdvanceResult } from '../domain/orders';
import { calcTotals, priceLines } from '../domain/pricing';

interface Draft {
  type: OrderType;
  customerId: number | null;
  table: string;
  discount: Discount | null;
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

interface Data {
  menu: MenuItem[];
  ingredients: Ingredient[];
  customers: Customer[];
  promos: Promo[];
  giftCards: GiftCard[];
  purchaseOrders: PurchaseOrder[];
  reservations: Reservation[];
  integrations: Integration[];
  orders: Order[];
  nextNo: number;
  nextPoNo: number;
  cart: CartLine[];
  draft: Draft;
  shift: Shift | null;
  online: boolean;
  wasteValue: number;
  depletedValue: number;
}

interface Actions {
  // cart
  addToCart: (itemId: number, mods?: string[]) => void;
  removeOneOfItem: (itemId: number) => void;
  changeLineQty: (index: number, delta: number) => void;
  removeLine: (index: number) => void;
  setLineNote: (index: number, note: string) => void;
  setDraft: (patch: Partial<Draft>) => void;
  applyVoucher: (code: string) => Promo | null;
  clearCart: () => void;
  sendOrder: () => Result<Order>;
  // orders
  advanceOrder: (no: number) => AdvanceResult;
  setStatus: (no: number, status: OrderStatus) => void;
  cancelOrder: (no: number, reason: string) => void;
  refundOrder: (no: number, reason: string) => void;
  requestBill: (no: number) => void;
  completePayment: (no: number, splits: PaymentSplit[]) => void;
  // shift
  openShift: (user: string, float: number) => void;
  closeShift: () => void;
  // floor
  addReservation: (r: Reservation) => void;
  // menu
  addMenuItem: (item: Omit<MenuItem, 'id' | 'recipe'>) => void;
  setPrice: (itemId: number, price: number) => void;
  toggleHidden: (itemId: number) => void;
  // inventory & purchasing
  logWaste: (ingredientId: string, qty: number) => void;
  postCount: (counts: Record<string, number>) => number;
  createSuggestedPurchaseOrders: () => number;
  setPurchaseOrderStatus: (no: string, status: PurchaseOrderStatus) => void;
  // customers & promos
  addCustomer: (name: string, phone: string) => void;
  addPromo: (promo: Omit<Promo, 'uses' | 'active'>) => void;
  togglePromo: (index: number) => void;
  sellGiftCard: (amount: number) => GiftCard;
  // settings
  toggleIntegration: (index: number) => void;
  toggleOnline: () => boolean;
  resetDemo: () => void;
}

export type TaliState = Data & Actions;

const emptyDraft: Draft = { type: 'Dine in', customerId: null, table: '', discount: null };

function initialData(): Data {
  const seed = buildSeed();
  return {
    menu: MENU,
    ingredients: seed.ingredients,
    customers: CUSTOMERS,
    promos: PROMOS,
    giftCards: GIFT_CARDS,
    purchaseOrders: PURCHASE_ORDERS,
    reservations: RESERVATIONS,
    integrations: INTEGRATIONS,
    orders: seed.orders,
    nextNo: seed.nextNo,
    nextPoNo: 1042,
    cart: [],
    draft: emptyDraft,
    shift: { user: 'Mahmoud Fathy', float: 500, start: Date.now() - 3 * 3600000 },
    online: true,
    wasteValue: 0,
    depletedValue: 0,
  };
}

const sameMods = (a: string[], b: string[]) => a.length === b.length && a.every((m, i) => m === b[i]);

export const useTali = create<TaliState>()(
  persist(
    (set, get) => {
      const updateOrder = (no: number, patch: Partial<Order> | ((o: Order) => Partial<Order>)) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.no === no ? { ...o, ...(typeof patch === 'function' ? patch(o) : patch) } : o)),
        }));

      return {
        ...initialData(),

        addToCart: (itemId, mods = []) =>
          set((s) => {
            const i = s.cart.findIndex((l) => l.itemId === itemId && sameMods(l.mods, mods));
            if (i < 0) return { cart: [...s.cart, { itemId, qty: 1, mods, note: '' }] };
            return { cart: s.cart.map((l, j) => (j === i ? { ...l, qty: l.qty + 1 } : l)) };
          }),

        removeOneOfItem: (itemId) => {
          const i = get().cart.map((l) => l.itemId).lastIndexOf(itemId);
          if (i >= 0) get().changeLineQty(i, -1);
        },

        changeLineQty: (index, delta) =>
          set((s) => ({
            cart: s.cart.map((l, i) => (i === index ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0),
          })),

        removeLine: (index) => set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),

        setLineNote: (index, note) => set((s) => ({ cart: s.cart.map((l, i) => (i === index ? { ...l, note } : l)) })),

        setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

        applyVoucher: (code) => {
          const promo = get().promos.find((p) => p.code && p.code === code.trim().toUpperCase() && p.active);
          if (!promo) return null;
          set((s) => ({
            draft: { ...s.draft, discount: { kind: 'percent', value: promo.value, label: promo.code } },
            promos: s.promos.map((p) => (p === promo ? { ...p, uses: p.uses + 1 } : p)),
          }));
          return promo;
        },

        clearCart: () => set({ cart: [], draft: emptyDraft }),

        sendOrder: () => {
          const s = get();
          if (!s.cart.length) return { ok: false, error: 'Add a dish first' };
          if (!s.shift) return { ok: false, error: 'Open a shift before taking orders' };
          if (s.draft.type === 'Dine in' && !s.draft.table) return { ok: false, error: 'Choose a table for this dine-in order' };

          const lines = priceLines(s.cart, s.menu);
          const customer = s.customers.find((c) => c.id === s.draft.customerId);
          const order: Order = {
            ...calcTotals(lines, s.draft.discount, s.draft.type),
            no: s.nextNo,
            customer: customer?.name ?? 'Walk-in',
            customerId: customer?.id ?? null,
            type: s.draft.type,
            table: s.draft.type === 'Dine in' ? s.draft.table : '',
            status: 'New',
            lines,
            createdAt: Date.now(),
            paid: false,
            discountLabel: s.draft.discount?.label,
            offline: !s.online,
          };
          const { ingredients, consumedValue } = depleteStock(s.ingredients, lines, s.menu);
          set({
            orders: [...s.orders, order],
            nextNo: s.nextNo + 1,
            ingredients,
            depletedValue: s.depletedValue + consumedValue,
            cart: [],
            draft: emptyDraft,
          });
          return { ok: true, value: order };
        },

        advanceOrder: (no) => {
          const order = get().orders.find((o) => o.no === no);
          if (!order) return { ok: false, reason: 'final' };
          const result = nextStatus(order);
          if (result.ok) updateOrder(no, { status: result.status });
          return result;
        },

        setStatus: (no, status) => updateOrder(no, { status }),

        cancelOrder: (no, reason) => updateOrder(no, { status: 'Cancelled', cancelReason: reason }),

        refundOrder: (no, reason) =>
          updateOrder(no, { status: 'Cancelled', refunded: true, cancelReason: `Refund: ${reason}` }),

        requestBill: (no) => updateOrder(no, { billRequested: true }),

        completePayment: (no, splits) => {
          const order = get().orders.find((o) => o.no === no);
          if (!order) return;
          const giftUse = (code: string) =>
            splits.filter((p) => p.giftCode === code).reduce((sum, p) => sum + p.amount, 0);
          const pointsUsed = splits.reduce((sum, p) => sum + (p.points ?? 0), 0);

          set((s) => ({
            giftCards: s.giftCards.map((g) => ({ ...g, balance: g.balance - giftUse(g.code) })),
            customers: s.customers.map((c) => (c.id === order.customerId ? applyLoyalty(c, order.total, pointsUsed) : c)),
          }));
          updateOrder(no, (o) => ({
            paid: true,
            paidAt: Date.now(),
            splits,
            tender: splits.length === 1 ? splits[0].tender : 'Split',
            status: o.status === 'Ready to serve' ? 'Completed' : o.status,
          }));
        },

        openShift: (user, float) => set({ shift: { user, float, start: Date.now() } }),
        closeShift: () => set({ shift: null }),

        addReservation: (r) => set((s) => ({ reservations: [...s.reservations, r] })),

        addMenuItem: (item) =>
          set((s) => ({ menu: [...s.menu, { ...item, id: Math.max(...s.menu.map((m) => m.id)) + 1, recipe: {} }] })),

        setPrice: (itemId, price) => set((s) => ({ menu: s.menu.map((m) => (m.id === itemId ? { ...m, price } : m)) })),

        toggleHidden: (itemId) =>
          set((s) => ({ menu: s.menu.map((m) => (m.id === itemId ? { ...m, hidden: !m.hidden } : m)) })),

        logWaste: (ingredientId, qty) =>
          set((s) => {
            const ing = s.ingredients.find((i) => i.id === ingredientId);
            if (!ing) return {};
            return {
              wasteValue: s.wasteValue + qty * ing.cost,
              ingredients: s.ingredients.map((i) => (i.id === ingredientId ? { ...i, stock: Math.max(0, +(i.stock - qty).toFixed(2)) } : i)),
            };
          }),

        postCount: (counts) => {
          let adjustment = 0;
          set((s) => ({
            ingredients: s.ingredients.map((i) => {
              const counted = counts[i.id];
              if (counted === undefined || counted === i.stock) return i;
              adjustment += Math.abs(counted - i.stock) * i.cost;
              return { ...i, stock: counted };
            }),
          }));
          return adjustment;
        },

        createSuggestedPurchaseOrders: () => {
          const s = get();
          const suggestions = Object.entries(suggestPurchases(s.ingredients));
          const created: PurchaseOrder[] = suggestions.map(([supplier, lines], i) => ({
            no: `PO-${s.nextPoNo + i}`,
            supplier,
            lines: lines.map((l) => ({ ingredientId: l.ingredient.id, qty: l.qty })),
            total: lines.reduce((sum, l) => sum + l.cost, 0),
            status: 'Awaiting approval',
          }));
          set({ purchaseOrders: [...created, ...s.purchaseOrders], nextPoNo: s.nextPoNo + created.length });
          return created.length;
        },

        setPurchaseOrderStatus: (no, status) =>
          set((s) => {
            const po = s.purchaseOrders.find((p) => p.no === no);
            if (!po) return {};
            const received = status === 'Received' ? po.lines : [];
            return {
              purchaseOrders: s.purchaseOrders.map((p) => (p.no === no ? { ...p, status } : p)),
              ingredients: s.ingredients.map((i) => {
                const line = received.find((l) => l.ingredientId === i.id);
                return line ? { ...i, stock: +(i.stock + line.qty).toFixed(1) } : i;
              }),
            };
          }),

        addCustomer: (name, phone) =>
          set((s) => ({
            customers: [...s.customers, { id: Math.max(0, ...s.customers.map((c) => c.id)) + 1, name, phone, visits: 0, spend: 0, points: 0, tier: 'Silver' }],
          })),

        addPromo: (promo) => set((s) => ({ promos: [...s.promos, { ...promo, active: true, uses: 0 }] })),

        togglePromo: (index) =>
          set((s) => ({ promos: s.promos.map((p, i) => (i === index ? { ...p, active: !p.active } : p)) })),

        sellGiftCard: (amount) => {
          const card = { code: `GC-${4480 + get().giftCards.length}`, balance: amount };
          set((s) => ({ giftCards: [...s.giftCards, card] }));
          return card;
        },

        toggleIntegration: (index) =>
          set((s) => ({ integrations: s.integrations.map((x, i) => (i === index ? { ...x, on: !x.on } : x)) })),

        toggleOnline: () => {
          const online = !get().online;
          set((s) => ({ online, orders: online ? s.orders.map((o) => ({ ...o, offline: false })) : s.orders }));
          return online;
        },

        resetDemo: () => set(initialData()),
      };
    },
    { name: 'tali-pos', version: 1 },
  ),
);
