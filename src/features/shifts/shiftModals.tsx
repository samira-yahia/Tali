import { openForm } from '../../components/ui/openForm';
import { InfoRows } from '../../components/ui/InfoRows';
import { USERS } from '../../data/business';
import { cashExpected } from '../../domain/orders';
import { clock, money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

export function openShiftModal() {
  const { shift } = useTali.getState();
  if (shift) return closeShiftModal();
  const cashiers = USERS.filter((u) => u.role === 'Cashier' || u.role === 'Branch manager').map((u) => u.name);
  openForm({
    title: 'Open shift',
    fields: [
      { name: 'user', label: 'Cashier', type: 'select', options: cashiers, defaultValue: cashiers[0] },
      { name: 'float', label: 'Opening float (EGP)', type: 'number', defaultValue: 500 },
    ],
    submitLabel: 'Open shift',
    onSubmit: ({ user, float }) => {
      useTali.getState().openShift(user, +float || 0);
      toast(`Shift opened · ${user}`);
    },
  });
}

function closeShiftModal() {
  const { shift, orders } = useTali.getState();
  if (!shift) return;
  const expected = cashExpected(orders, shift);
  openForm({
    title: 'Close shift',
    intro: (
      <InfoRows
        rows={[
          { label: 'Cashier', value: shift.user },
          { label: 'Opened', value: clock(shift.start) },
          { label: 'Opening float', value: money(shift.float) },
          { label: 'Cash sales this shift', value: money(expected - shift.float) },
          { label: <b>Expected in drawer</b>, value: <b>{money(expected)}</b> },
        ]}
      />
    ),
    fields: [{ name: 'counted', label: 'Counted cash (blind count)', type: 'number', placeholder: '0.00', required: true }],
    submitLabel: 'Close & print Z report',
    onSubmit: ({ counted }) => {
      const variance = (+counted || 0) - expected;
      useTali.getState().closeShift();
      toast(`Shift closed · variance ${variance >= 0 ? '+' : ''}${money(variance)}`, variance < 0 ? 'yellow' : 'lime');
    },
  });
}
