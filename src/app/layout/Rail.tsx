import { ActionIcon, Divider, Indicator, Stack, Tooltip } from '@mantine/core';
import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useIsPhone } from '../../hooks/useIsPhone';
import { ROUTES } from '../routes';
import { useNavCounts } from './useNavCounts';

export function Rail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const counts = useNavCounts();
  const isPhone = useIsPhone();

  return (
    <Stack align="center" gap={isPhone ? 8 : 10} py={isPhone ? 'sm' : 'md'}>
      {ROUTES.map((r, i) => {
        const active = pathname.startsWith(r.path);
        const count = counts[r.path] ?? 0;
        return (
          <Fragment key={r.path}>
            {i > 0 && ROUTES[i - 1].section !== r.section && <Divider w={26} />}
            <Tooltip label={r.label} position="right" withArrow>
              <Indicator label={count} size={isPhone ? 16 : 18} color="violet.5" disabled={!count} offset={4}>
                <ActionIcon
                  size={isPhone ? 38 : 42}
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
