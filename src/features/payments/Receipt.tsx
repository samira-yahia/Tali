import { Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import type { ReactNode } from 'react';
import { lineTotal } from '../../domain/pricing';
import { clock } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

function Row({ left, right, bold }: { left: ReactNode; right: ReactNode; bold?: boolean }) {
  return (
    <Group justify="space-between" wrap="nowrap" fw={bold ? 700 : undefined}>
      <span>{left}</span>
      <span>{right}</span>
    </Group>
  );
}

export function Receipt({ no }: { no: number }) {
  const order = useTali((s) => s.orders.find((o) => o.no === no));
  const menu = useTali((s) => s.menu);
  if (!order) return null;
  const cash = order.splits?.find((s) => s.tender === 'Cash');
  const change = cash?.cashGiven && cash.cashGiven > cash.amount ? cash.cashGiven - cash.amount : 0;

  return (
    <Stack>
      <Paper bg="white" c="dark.9" p="lg" radius="md" ff="monospace" fz="xs">
        <Stack gap={4}>
          <Text ta="center" fz="xs" ff="monospace">
            <b>TALI · Maadi</b>
            <br />
            12 Road 9, Maadi, Cairo
            <br />
            Tax ID 100-234-567 · ETA e-receipt
          </Text>
          <Divider color="gray.4" variant="dashed" />
          <Row left={`Order #${order.no}`} right={order.paidAt ? clock(order.paidAt) : ''} />
          <Row left={`${order.type}${order.table ? ` · ${order.table}` : ''}`} right={order.customer} />
          <Divider color="gray.4" variant="dashed" />
          {order.lines.map((l, i) => {
            const item = menu.find((m) => m.id === l.itemId);
            return (
              <Row key={i} left={`${l.qty} × ${item?.name}${l.mods.length ? ` (${l.mods.join(', ')})` : ''}`} right={lineTotal(l).toFixed(2)} />
            );
          })}
          <Divider color="gray.4" variant="dashed" />
          <Row left="Subtotal" right={order.subtotal.toFixed(2)} />
          {order.discount > 0 && <Row left="Discount" right={`-${order.discount.toFixed(2)}`} />}
          {order.service > 0 && <Row left="Service 12%" right={order.service.toFixed(2)} />}
          <Row left="VAT 14%" right={order.vat.toFixed(2)} />
          <Row left="TOTAL" right={`EGP ${order.total.toFixed(2)}`} bold />
          <Divider color="gray.4" variant="dashed" />
          {order.splits?.map((s, i) => <Row key={i} left={s.tender} right={s.amount.toFixed(2)} />)}
          {change > 0 && <Row left="Change" right={change.toFixed(2)} />}
          <Text ta="center" fz="xs" ff="monospace" mt="xs">
            ETA UUID 9F3A-…-{order.no}
            <br />
            Thank you · شكراً
          </Text>
        </Stack>
      </Paper>
      <Group>
        <Button variant="default" onClick={() => toast('Sent to printer P-01')}>
          Print
        </Button>
        <Button variant="default" onClick={() => toast('Receipt sent by WhatsApp')}>
          WhatsApp
        </Button>
        <div style={{ flex: 1 }} />
        <Button onClick={() => modals.closeAll()}>Done</Button>
      </Group>
    </Stack>
  );
}