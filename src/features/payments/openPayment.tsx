import { modals } from '@mantine/modals';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import { PaymentModal } from './PaymentModal';

export function openPayment(no: number) {
  const order = useTali.getState().orders.find((o) => o.no === no);
  if (!order) return;
  if (order.paid) return toast(`Order #${no} is already paid`, 'yellow');
  const modalId = `pay-${no}`;
  modals.open({ modalId, title: `Pay · Order #${no}`, size: 'lg', children: <PaymentModal no={no} modalId={modalId} /> });
}
