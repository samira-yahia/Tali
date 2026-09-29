# Tali — Restaurant Platform

React rebuild of the `tali-platform.html` prototype: POS, tables, kitchen display, orders, dashboard, menu, inventory, purchasing, customers & loyalty, promotions, reports and settings.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # domain unit tests (Vitest)
npm run lint     # oxlint
npm run build    # typecheck + production build
```

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | React 19 + Vite + TypeScript | Everything in the prototype is client-side staff tooling behind a login, so there is nothing for server rendering to do. |
| UI | [Mantine 9](https://mantine.dev) + Tabler icons | App shell, tables, modals, notifications, inputs and charts out of the box, so the app has almost no hand-written CSS. |
| State | Zustand (with `persist`) | One small store; data survives a page refresh via `localStorage`. |
| Routing | React Router | One route per rail item; each screen is lazy-loaded. |
| Tests | Vitest | Covers the business rules in `src/domain`. |

## Structure

```text
src/
├── app/                 routes, app shell (top bar, rail), connection toggle
├── features/            one folder per screen
│   ├── pos/             menu grid, order line, order panel, modifier picker
│   ├── payments/        tenders, numpad, split payments, receipt
│   ├── shifts/          open / close shift
│   ├── tables/  kds/  orders/  dashboard/  menu/  inventory/
│   └── purchasing/  customers/  promos/  reports/  settings/
├── domain/              pure business logic, no React — tested
│   ├── pricing.ts       subtotal → discount → service 12% (dine-in) → VAT 14%
│   ├── inventory.ts     recipe cost, stock depletion, availability, reorder suggestions
│   ├── orders.ts        status flow, loyalty tiers, expected cash
│   └── reports.ts       report tables + CSV
├── store/useTali.ts     all state and actions
├── data/                seed data copied from the prototype
├── components/ui/       shared pieces: KpiCard, DataTable, InfoCard, StatusBadge, openForm
├── lib/                 formatting and toast helpers
└── types/
```

Rules the code follows:

- Components never do money or stock math; they call `domain/`.
- Anything that changes state goes through a store action.
- A component lives in its feature folder until a second screen needs it; then it moves to `components/ui/`.

## Differences from the prototype

- Browser `prompt()` / `confirm()` dialogs are replaced with modal forms (`components/ui/openForm`).
- Data is saved in the browser. **Settings → Devices → Reset demo data** restores the starting data.
- Each order line stores its unit price at the time of sale, so later menu price changes don't rewrite past receipts.
- Purchase orders store real ingredient quantities; receiving one adds exactly those quantities to stock.
- Gift card balances and loyalty points are deducted when the payment completes, not when a partial split is taken, so abandoning a payment doesn't lose balance.
- The order panel is shown from tablet width up; the prototype stacked it under the page on phones.

## What is still simulated

Same as the prototype:

- **Offline mode.** The status pill and **Settings → Devices → Simulate connection loss** only flip a flag. Orders created while "offline" are marked as queued, and going back online clears the mark. There is no service worker, IndexedDB or real sync.
- Integrations, API keys, webhooks, printing, WhatsApp, card terminals and QR payments show a confirmation toast only.
- The "Sales by hour" chart and device sync times are static sample values.

## Next steps

1. Replace `data/` and store actions with API calls (the store is the only place that would change).
2. Real offline support: service worker for the app shell, IndexedDB for the order queue, background sync on reconnect.
3. Authentication and role permissions (roles are already defined in `data/business.ts`).
4. Component tests for the payment flow (React Testing Library).
