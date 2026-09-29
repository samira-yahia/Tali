import { Button, Drawer, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronUp } from '@tabler/icons-react';
import { calcTotals, priceLines } from '../../domain/pricing';
import { money } from '../../lib/format';
import { useTali } from '../../store/useTali';
import { OrderPanel } from './OrderPanel';

/** Phones have no room for the order panel beside the menu, so it opens as a bottom sheet. */
export function MobileOrderBar() {
  const [opened, { open, close }] = useDisclosure(false);
  const cart = useTali((s) => s.cart);
  const menu = useTali((s) => s.menu);
  const draft = useTali((s) => s.draft);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const total = calcTotals(priceLines(cart, menu), draft.discount, draft.type).total;

  return (
    <>
      <Group h={60} px="sm" wrap="nowrap">
        <Button fullWidth size="md" color={count ? 'lime' : 'gray'} variant={count ? 'filled' : 'default'} onClick={open} rightSection={<IconChevronUp size={18} />}>
          {count ? (
            <Text span fw={600} fz="sm">
              View order · {count} item{count === 1 ? '' : 's'} · {money(total)}
            </Text>
          ) : (
            'Order is empty · view details'
          )}
        </Button>
      </Group>
      <Drawer
        opened={opened}
        onClose={close}
        position="bottom"
        size="92%"
        withCloseButton={false}
        trapFocus={false}
        zIndex={150}
        styles={{
          content: { display: 'flex', flexDirection: 'column', borderTopLeftRadius: 26, borderTopRightRadius: 26, background: 'var(--mantine-color-dark-8)' },
          body: { flex: 1, minHeight: 0, padding: 0 },
        }}
      >
        <OrderPanel onClose={close} />
      </Drawer>
    </>
  );
}
