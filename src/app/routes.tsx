import {
  IconBuildingStore,
  IconChartBar,
  IconChefHat,
  IconHome,
  IconLayoutGrid,
  IconList,
  IconPackage,
  IconReceipt,
  IconSettings,
  IconShoppingCart,
  IconTicket,
  IconUsers,
  type Icon,
} from '@tabler/icons-react';
import { lazy, type ComponentType } from 'react';

/** Each screen is its own chunk, loaded the first time it's opened. */
const lazyPage = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const PosPage = lazyPage(() => import('../features/pos/PosPage'), 'PosPage');
const TablesPage = lazyPage(() => import('../features/tables/TablesPage'), 'TablesPage');
const KdsPage = lazyPage(() => import('../features/kds/KdsPage'), 'KdsPage');
const OrdersPage = lazyPage(() => import('../features/orders/OrdersPage'), 'OrdersPage');
const DashboardPage = lazyPage(() => import('../features/dashboard/DashboardPage'), 'DashboardPage');
const MenuPage = lazyPage(() => import('../features/menu/MenuPage'), 'MenuPage');
const InventoryPage = lazyPage(() => import('../features/inventory/InventoryPage'), 'InventoryPage');
const PurchasingPage = lazyPage(() => import('../features/purchasing/PurchasingPage'), 'PurchasingPage');
const CustomersPage = lazyPage(() => import('../features/customers/CustomersPage'), 'CustomersPage');
const PromosPage = lazyPage(() => import('../features/promos/PromosPage'), 'PromosPage');
const ReportsPage = lazyPage(() => import('../features/reports/ReportsPage'), 'ReportsPage');
const SettingsPage = lazyPage(() => import('../features/settings/SettingsPage'), 'SettingsPage');

export interface AppRoute {
  path: string;
  /** Rail tooltip */
  label: string;
  /** Top bar title */
  title: string;
  icon: Icon;
  page: ComponentType;
  /** Rail section; a divider is drawn between sections */
  section: 'front' | 'back' | 'admin';
}

export const ROUTES: AppRoute[] = [
  { path: '/pos', label: 'Point of sale', title: 'Point of Sale', icon: IconLayoutGrid, page: PosPage, section: 'front' },
  { path: '/tables', label: 'Tables', title: 'Tables & reservations', icon: IconBuildingStore, page: TablesPage, section: 'front' },
  { path: '/kds', label: 'Kitchen display', title: 'Kitchen display', icon: IconChefHat, page: KdsPage, section: 'front' },
  { path: '/orders', label: 'Orders', title: 'Orders', icon: IconReceipt, page: OrdersPage, section: 'front' },
  { path: '/dashboard', label: 'Dashboard', title: 'Dashboard', icon: IconHome, page: DashboardPage, section: 'back' },
  { path: '/menu', label: 'Menu manager', title: 'Menu manager', icon: IconList, page: MenuPage, section: 'back' },
  { path: '/inventory', label: 'Inventory', title: 'Inventory', icon: IconPackage, page: InventoryPage, section: 'back' },
  { path: '/purchasing', label: 'Purchasing', title: 'Purchasing', icon: IconShoppingCart, page: PurchasingPage, section: 'back' },
  { path: '/customers', label: 'Customers & loyalty', title: 'Customers & loyalty', icon: IconUsers, page: CustomersPage, section: 'back' },
  { path: '/promos', label: 'Promotions', title: 'Promotions', icon: IconTicket, page: PromosPage, section: 'back' },
  { path: '/reports', label: 'Reports', title: 'Reports', icon: IconChartBar, page: ReportsPage, section: 'back' },
  { path: '/settings', label: 'Settings', title: 'Settings', icon: IconSettings, page: SettingsPage, section: 'admin' },
];
