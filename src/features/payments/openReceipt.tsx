import { modals } from '@mantine/modals';
import { Receipt } from './Receipt';

export function openReceipt(no: number) {
  modals.open({ title: 'Paid ✓', children: <Receipt no={no} /> });
}
