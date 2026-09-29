import { AppShell, Center, Loader } from '@mantine/core';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileOrderBar } from '../../features/pos/MobileOrderBar';
import { OrderPanel } from '../../features/pos/OrderPanel';
import { useIsPhone } from '../../hooks/useIsPhone';
import { ROUTES } from '../routes';
import { Rail } from './Rail';
import { Topbar } from './Topbar';

const ORDER_BAR_HEIGHT = 60;

export function AppLayout() {
  const { pathname } = useLocation();
  const isPhone = useIsPhone();
  const isPos = pathname.startsWith('/pos');
  const title = ROUTES.find((r) => pathname.startsWith(r.path))?.title ?? '';

  return (
    <AppShell
      header={{ height: { base: 56, sm: 72 } }}
      navbar={{ width: { base: 60, sm: 78 }, breakpoint: 0 }}
      aside={{ width: 340, breakpoint: 'sm', collapsed: { desktop: !isPos, mobile: true } }}
      footer={{ height: ORDER_BAR_HEIGHT, collapsed: !(isPhone && isPos) }}
      padding={{ base: 'sm', sm: 'lg' }}
    >
      <AppShell.Header bg="dark.8" withBorder={false}>
        <Topbar title={title} />
      </AppShell.Header>
      <AppShell.Navbar bg="dark.8" withBorder={false} style={{ overflowY: 'auto', scrollbarWidth: 'none' }}>
        <Rail />
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense fallback={<Center h={300}><Loader /></Center>}>
          <Outlet />
        </Suspense>
      </AppShell.Main>
      <AppShell.Aside bg="dark.8" withBorder={false}>
        {isPos && !isPhone && <OrderPanel />}
      </AppShell.Aside>
      {isPhone && isPos && (
        <AppShell.Footer bg="dark.8" withBorder={false}>
          <MobileOrderBar />
        </AppShell.Footer>
      )}
    </AppShell>
  );
}
