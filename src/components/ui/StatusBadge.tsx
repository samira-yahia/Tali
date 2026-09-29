import { Badge, UnstyledButton } from '@mantine/core';
import type { OrderStatus } from '../../types';
import { STATUS_COLOR } from './statusColors';

export function StatusBadge({ status, onClick }: { status: OrderStatus; onClick?: () => void }) {
  const badge = <Badge color={STATUS_COLOR[status]}>{status}</Badge>;
  if (!onClick) return badge;
  return (
    <UnstyledButton onClick={onClick} aria-label={`${status} · move forward`}>
      {badge}
    </UnstyledButton>
  );
}
