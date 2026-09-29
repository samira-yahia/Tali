import { ActionIcon, Divider, Indicator, Stack, Tooltip } from '@mantine/core';
import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stockLevel } from '../../domain/inventory';
import { isOpen } from '../../domain/orders';
import { useTali } from '../../store/useTali';
import { ROUTES } from '../routes';

export function Rail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const orders = useTali((s) => s.orders);
  const ingredients = useTali((s) => s.ingredients);

  const counts: Record<string, number> = {
    '/kds': orders.filter((o) => o.status === 'New' || o.status === 'In progress').length,
    '/orders': orders.filter(isOpen).length,
    '/inventory': ingredients.filter((i) => stockLevel(i) === 'critical').length,
  };

  return (
    <Stack align="center" gap={10} py="md">
      {ROUTES.map((r, i) => {
        const active = pathname.startsWith(r.path);
        const count = counts[r.path] ?? 0;
        return (
          <Fragment key={r.path}>
            {i > 0 && ROUTES[i - 1].section !== r.section && <Divider w={26} />}
            <Tooltip label={r.label} position="right" withArrow>
              <Indicator label={count} size={18} color="violet.5" disabled={!count} offset={4}>
                <ActionIcon
                  size={42}
                  radius="xl"
                  variant={active ? 'filled' : 'default'}
                  onClick={() => navigate(r.path)}
                  aria-label={r.label}
                  aria-current={active ? 'page' : undefined}
                >
                  <r.icon size={19} />
                </ActionIcon>
              </Indicator>
            </Tooltip>
          </Fragment>
        );
      })}
    </Stack>
  );
}
