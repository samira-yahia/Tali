import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useNavigate } from 'react-router-dom';
import { InfoCard, InfoRows } from '../../components/ui/InfoRows';
import { openForm } from '../../components/ui/openForm';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { TABLES } from '../../domain/constants';
import { isOpen } from '../../domain/orders';
import { lineTotal } from '../../domain/pricing';
import { useNow } from '../../hooks/useNow';
import { ago, money, whole } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { Order } from '../../types';
import { advanceWithFeedback } from '../orders/orderActions';
import { openPayment } from '../payments/openPayment';

type TableState = { label: string; bg: string; c?: string; order?: Order };

function tableState(n: number, orders: Order[]): TableState {
  const order = orders.find((o) => o.table === `Table ${n}` && isOpen(o));
  if (!order) return { label: 'Free', bg: 'dark.6' };
  if (order.status === 'Ready to serve') return { label: 'Food ready', bg: 'lime.5', c: 'dark.9', order };
  if (order.billRequested) return { label: 'Bill requested', bg: 'yellow.5', c: 'dark.9', order };
  return { label: `Seated · ${order.status}`, bg: 'violet.5', c: 'white', order };
}

function openTableOrder(n: number, order: Order) {
  const { menu, requestBill } = useTali.getState();
  const id = modals.open({
    title: `Table ${n} · #${order.no}`,
    children: (
      <Stack>
        <InfoRows
          rows={[
            ...order.lines.map((l) => ({ label: `${l.qty} × ${menu.find((m) => m.id === l.itemId)?.name}`, value: money(lineTotal(l)) })),
            { label: <b>Total</b>, value: <b>{money(order.total)}</b> },
          ]}
        />
        <Group gap="xs">
          <Button variant="default" onClick={() => { requestBill(order.no); modals.close(id); toast(`Bill printed for ${order.table}`); }}>
            Print bill
          </Button>
          <Button variant="default" onClick={() => toast(`QR pay link sent to table ${n}`)}>
            Pay at table QR
          </Button>
          <Button color="violet" onClick={() => { modals.close(id); advanceWithFeedback(order.no); }}>
            Advance status
          </Button>
          <Spacer />
          {order.paid ? (
            <Badge size="lg">Paid</Badge>
          ) : (
            <Button onClick={() => { modals.close(id); openPayment(order.no); }}>Pay {whole(order.total)}</Button>
          )}
        </Group>
      </Stack>
    ),
  });
}

function addReservation() {
  openForm({
    title: 'Add reservation',
    fields: [
      { name: 'name', label: 'Guest name', required: true },
      { name: 'time', label: 'Time', defaultValue: '20:30' },
      { name: 'covers', label: 'Covers', type: 'number', defaultValue: 2 },
      { name: 'table', label: 'Table', type: 'select', options: TABLES.map((t) => String(t.n)), defaultValue: '5' },
    ],
    submitLabel: 'Add reservation',
    onSubmit: ({ name, time, covers, table }) => {
      useTali.getState().addReservation({ name, time, covers: +covers || 2, table: +table });
      toast('Reservation added · WhatsApp confirmation sent');
    },
  });
}

export function TablesPage() {
  const now = useNow();
  const navigate = useNavigate();
  const orders = useTali((s) => s.orders);
  const reservations = useTali((s) => s.reservations);
  const setDraft = useTali((s) => s.setDraft);
  const states = TABLES.map((t) => ({ ...t, ...tableState(t.n, orders) }));

  const onTable = (t: (typeof states)[number]) => {
    if (t.order) return openTableOrder(t.n, t.order);
    setDraft({ type: 'Dine in', table: `Table ${t.n}` });
    navigate('/pos');
    toast(`Table ${t.n} selected · add dishes`);
  };

  return (
    <Stack>
      <PageHeader title="Floor">
        <Badge color="dark.4">Free</Badge>
        <Badge color="violet.5">Seated</Badge>
        <Badge color="yellow.5">Bill requested</Badge>
        <Badge color="lime.5">Food ready</Badge>
        <Spacer />
        <Badge size="lg" color="dark.4">
          {states.filter((t) => t.order).length}/{TABLES.length} tables seated
        </Badge>
      </PageHeader>

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        {states.map((t) => (
          <UnstyledButton key={t.n} onClick={() => onTable(t)}>
            <Card bg={t.bg} c={t.c} mih={130} style={{ justifyContent: 'space-between' }}>
              <div>
                <Text fz="lg" fw={600}>Table {t.n}</Text>
                <Text fz="xs" opacity={0.75}>{t.seats} seats</Text>
              </div>
              <Text fz="xs" opacity={0.85}>
                {t.label}
                {t.order && (
                  <>
                    <br />#{t.order.no} · {money(t.order.total)} · {ago(t.order.createdAt, now)}
                  </>
                )}
              </Text>
            </Card>
          </UnstyledButton>
        ))}
      </SimpleGrid>

      <InfoCard
        title="Reservations tonight"
        action={<Button size="xs" variant="white" color="dark" onClick={addReservation}>Add reservation</Button>}
        rows={reservations.map((r) => ({ label: `${r.time} · ${r.name}`, value: `${r.covers} covers · Table ${r.table}` }))}
        empty="No reservations."
      />
    </Stack>
  );
}
