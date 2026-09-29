import { AppShell, Center, Loader } from '@mantine/core';
import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { OrderPanel } from '../../features/pos/OrderPanel';
import { ROUTES } from '../routes';
import { Rail } from './Rail';
import { Topbar } from './Topbar';

export function AppLayout() {
  const { pathname } = useLocation();
  const isPos = pathname.startsWith('/pos');
  const title = ROUTES.find((r) => pathname.startsWith(r.path))?.title ?? '';

  return (
    <AppShell
      header={{ height: 72 }}
      navbar={{ width: 78, breakpoint: 0 }}
      aside={{ width: 340, breakpoint: 'sm', collapsed: { desktop: !isPos, mobile: true } }}
      padding="lg"
    >
      <AppShell.Header bg="dark.8" withBorder={false}>
        <Topbar title={title} />
      </AppShell.Header>
      <AppShell.Navbar bg="dark.8" withBorder={false} style={{ overflowY: 'auto' }}>
        <Rail />
      </AppShell.Navbar>
      <AppShell.Main>
        <Suspense fallback={<Center h={300}><Loader /></Center>}>
          <Outlet />
        </Suspense>
      </AppShell.Main>
      <AppShell.Aside bg="dark.8" withBorder={false}>
        {isPos && <OrderPanel />}
      </AppShell.Aside>
    </AppShell>
  );
}
