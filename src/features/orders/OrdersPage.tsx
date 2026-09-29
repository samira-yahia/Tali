import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { ScrollSegments } from '../../components/ui/ScrollSegments';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { isOpen, isUnpaid, itemCount } from '../../domain/orders';
import { useNow } from '../../hooks/useNow';
import { ago, money } from '../../lib/format';
import { useTali } from '../../store/useTali';
import type { Order } from '../../types';
import { openPayment } from '../payments/openPayment';
import { openReceipt } from '../payments/openReceipt';
import { advanceWithFeedback, cancelWithReason, refundWithReason } from './orderActions';

const FILTERS: Record<string, { label: string; test: (o: Order) => boolean }> = {
  all: { label: 'All', test: () => true },
  open: { label: 'Open', test: isOpen },
  unpaid: { label: 'Unpaid', test: isUnpaid },
  done: { label: 'Completed', test: (o) => o.status === 'Completed' },
  cancelled: { label: 'Cancelled', test: (o) => o.status === 'Cancelled' },
};

function PaymentBadge({ order }: { order: Order }) {
  if (order.refunded) return <Badge color="red.6">Refunded</Badge>;
  if (order.paid) return <Badge>{order.tender}</Badge>;
  return <Badge color="yellow.5">Unpaid</Badge>;
}

export function OrdersPage() {
  const now = useNow();
  const orders = useTali((s) => s.orders);
  const [filter, setFilter] = useState('all');
  const list = orders.filter(FILTERS[filter].test).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Stack>
      <PageHeader title="Orders">
        <ScrollSegments value={filter} onChange={setFilter} data={Object.entries(FILTERS).map(([value, f]) => ({ value, label: f.label }))} />
        <Spacer />
        <Text fz="sm" c="dimmed">Tap a status to move it forward</Text>
      </PageHeader>

      <DataTable
        minWidth={960}
        empty="No orders match this filter."
        data={list}
        rowKey={(o) => o.no}
        columns={[
          { header: 'Order', cell: (o) => <b>#{o.no}</b> },
          {
            header: 'Customer',
            cell: (o) => (
              <div>
                {o.customer}
                <Text fz="xs" c="dimmed">
                  {ago(o.createdAt, now)}
                  {o.table && ` · ${o.table}`}
                  {o.cancelReason && ` · ${o.cancelReason}`}
                  {o.offline && ' · queued offline'}
                </Text>
              </div>
            ),
          },
          { header: 'Type', cell: (o) => o.type },
          { header: 'Items', cell: itemCount },
          { header: 'Total', cell: (o) => <b>{money(o.total)}</b> },
          { header: 'Status', cell: (o) => <StatusBadge status={o.status} onClick={() => advanceWithFeedback(o.no)} /> },
          { header: 'Payment', cell: (o) => <PaymentBadge order={o} /> },
          {
            header: '',
            cell: (o) => (
              <Group gap={6} justify="flex-end" wrap="nowrap">
                {isUnpaid(o) && (
                  <>
                    <Button size="compact-sm" variant="white" color="dark" onClick={() => openPayment(o.no)}>Pay</Button>
                    <Button size="compact-sm" variant="default" onClick={() => cancelWithReason(o.no)}>Cancel</Button>
                  </>
                )}
                {o.paid && !o.refunded && (
                  <>
                    <Button size="compact-sm" variant="default" onClick={() => openReceipt(o.no)}>Receipt</Button>
                    <Button size="compact-sm" variant="default" onClick={() => refundWithReason(o.no)}>Refund</Button>
                  </>
                )}
              </Group>
            ),
          },
        ]}
      />
    </Stack>
  );
}
