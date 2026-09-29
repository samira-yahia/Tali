import { openForm } from '../../components/ui/openForm';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import { openPayment } from '../payments/openPayment';

export function advanceWithFeedback(no: number) {
  const result = useTali.getState().advanceOrder(no);
  if (result.ok) return toast(`Order #${no} · ${result.status}`);
  if (result.reason === 'needs-payment') {
    toast('Take payment before completing this order', 'yellow');
    return openPayment(no);
  }
  const order = useTali.getState().orders.find((o) => o.no === no);
  toast(`Order #${no} is ${order?.status.toLowerCase()}`, 'yellow');
}

export function cancelWithReason(no: number) {
  const order = useTali.getState().orders.find((o) => o.no === no);
  if (!order) return;
  if (order.paid) return toast('Refund it from Orders first', 'yellow');
  openForm({
    title: `Cancel order #${no}`,
    intro: 'A manager PIN is required.',
    fields: [{ name: 'reason', label: 'Reason', placeholder: 'Customer left, wrong order, test…', required: true }],
    submitLabel: 'Cancel order',
    onSubmit: ({ reason }) => {
      useTali.getState().cancelOrder(no, reason);
      toast(`Order #${no} cancelled`);
    },
  });
}

export function refundWithReason(no: number) {
  const order = useTali.getState().orders.find((o) => o.no === no);
  if (!order?.paid) return;
  openForm({
    title: `Refund order #${no}`,
    intro: `Refund ${money(order.total)} to ${order.tender}. Manager PIN required.`,
    fields: [{ name: 'reason', label: 'Reason', required: true }],
    submitLabel: `Refund ${money(order.total)}`,
    onSubmit: ({ reason }) => {
      useTali.getState().refundOrder(no, reason);
      toast(`Refunded ${money(order.total)}`);
    },
  });
}
