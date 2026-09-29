import { Avatar, Badge, Card, Group, ScrollArea, Text, UnstyledButton } from '@mantine/core';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { colorVar, STATUS_COLOR } from '../../components/ui/statusColors';
import { isOpen, isUnpaid, itemCount } from '../../domain/orders';
import { useNow } from '../../hooks/useNow';
import { ago, initials, whole } from '../../lib/format';
import { useTali } from '../../store/useTali';
import type { OrderType } from '../../types';
import { advanceWithFeedback } from '../orders/orderActions';
import { openPayment } from '../payments/openPayment';

const AVATAR_COLORS = ['violet', 'blue', 'red', 'yellow', 'lime'];

export function OrderLine({ type }: { type: OrderType }) {
  const now = useNow();
  const orders = useTali((s) => s.orders);
  const list = orders
    .filter((o) => o.type === type && (isOpen(o) || isUnpaid(o)))
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!list.length)
    return (
      <Card c="dimmed" fz="sm">
        No {type.toLowerCase()} orders right now.
      </Card>
    );

  return (
    <ScrollArea type="never">
      <Group wrap="nowrap" gap="sm" align="stretch">
        {list.map((o, i) => (
          <Card
            key={o.no}
            w={250}
            miw={250}
            bg={i === 0 ? 'white' : 'dark.6'}
            c={i === 0 ? 'dark.9' : undefined}
            style={{ borderTop: `4px solid ${colorVar(STATUS_COLOR[o.status])}` }}
          >
            <Group wrap="nowrap" gap="sm">
              <Avatar color={AVATAR_COLORS[o.no % AVATAR_COLORS.length]} variant="filled" radius="xl">
                {initials(o.customer)}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <Text fw={600} truncate>
                  {o.customer}
                </Text>
                <Text fz="xs" opacity={0.65}>
                  #{o.no} · {itemCount(o)} items · {ago(o.createdAt, now)}
                </Text>
              </div>
            </Group>
            <Group gap={6} mt="md">
              <Badge color="dark.4">{o.table || o.type}</Badge>
              <StatusBadge status={o.status} onClick={() => advanceWithFeedback(o.no)} />
              {o.paid ? (
                <Badge>Paid</Badge>
              ) : (
                <UnstyledButton onClick={() => openPayment(o.no)}>
                  <Badge color={i === 0 ? 'dark.9' : 'gray.1'}>Pay {whole(o.total)}</Badge>
                </UnstyledButton>
              )}
            </Group>
          </Card>
        ))}
      </Group>
    </ScrollArea>
  );
}
