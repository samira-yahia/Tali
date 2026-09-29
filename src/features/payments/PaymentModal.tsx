import { Button, Card, Group, NumberInput, SimpleGrid, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { EGP_PER_POINT, MIN_POINTS_TO_REDEEM, TENDERS } from '../../domain/constants';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { PaymentSplit, Tender } from '../../types';
import { openReceipt } from './openReceipt';

const ICONS: Record<Tender, string> = { Cash: '💵', Card: '💳', InstaPay: '📱', Fawry: '🏪', 'Gift card': '🎁', Points: '⭐' };
const sum = (splits: PaymentSplit[]) => splits.reduce((s, p) => s + p.amount, 0);

export function PaymentModal({ no, modalId }: { no: number; modalId: string }) {
  const order = useTali((s) => s.orders.find((o) => o.no === no));
  const customer = useTali((s) => s.customers.find((c) => c.id === order?.customerId));
  const giftCards = useTali((s) => s.giftCards);
  const completePayment = useTali((s) => s.completePayment);

  const [tender, setTender] = useState<Tender>('Cash');
  const [given, setGiven] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [part, setPart] = useState<string | number>('');
  const [splits, setSplits] = useState<PaymentSplit[]>([]);

  if (!order) return null;
  const due = order.total - sum(splits);
  const pointsLeft = (customer?.points ?? 0) - splits.reduce((s, p) => s + (p.points ?? 0), 0);
  const cashGiven = +given || 0;
  const change = tender === 'Cash' && cashGiven > due ? cashGiven - due : 0;

  const pickTender = (t: Tender) => {
    setTender(t);
    setGiven('');
  };

  const numpad = (key: string) => {
    if (key === 'C') setGiven('');
    else if (key === '⌫') setGiven((g) => g.slice(0, -1));
    else if (key === 'Exact') setGiven(due.toFixed(2));
    else if (key === 'round') setGiven(String(Math.ceil(due)));
    else setGiven((g) => g + key);
  };

  function buildSplit(amount: number, isPart: boolean): PaymentSplit | string {
    switch (tender) {
      case 'Cash':
        if (!isPart && cashGiven < amount) return 'Cash received is less than the amount due';
        return { tender, amount, cashGiven: isPart ? amount : cashGiven };
      case 'Gift card': {
        const code = giftCode.trim().toUpperCase();
        const card = giftCards.find((g) => g.code === code);
        const available = (card?.balance ?? 0) - splits.filter((p) => p.giftCode === code).reduce((s, p) => s + p.amount, 0);
        if (!card || available <= 0) return 'Gift card not found or empty';
        return { tender, amount: Math.min(available, amount), giftCode: code };
      }
      case 'Points': {
        const points = Math.min(pointsLeft, Math.floor(amount / EGP_PER_POINT));
        return { tender, amount: points * EGP_PER_POINT, points };
      }
      default:
        return { tender, amount };
    }
  }

  const take = (amount: number, isPart = false) => {
    const split = buildSplit(amount, isPart);
    if (typeof split === 'string') return toast(split, 'red');
    const next = [...splits, split];
    const remaining = order.total - sum(next);
    if (remaining < 0.01) {
      completePayment(no, next);
      modals.close(modalId);
      openReceipt(no);
      return;
    }
    setSplits(next);
    setGiven('');
    setPart('');
    if (tender === 'Gift card' || tender === 'Points') setTender('Cash');
    toast(`${money(split.amount)} taken by ${split.tender} · ${money(remaining)} still due`);
  };

  const takePart = () => {
    const v = +part;
    if (!v || v <= 0 || v > due + 0.001) return toast(`Enter an amount up to ${money(due)}`, 'red');
    take(v, true);
  };

  return (
    <Stack>
      <Card bg="dark.8" ta="right">
        <Text fz="xs" c="dimmed">
          Amount due{splits.length ? ` · ${splits.length} split${splits.length > 1 ? 's' : ''} taken` : ''}
        </Text>
        <Text fz={30} fw={600}>
          {money(due)}
        </Text>
      </Card>

      <SimpleGrid cols={3} spacing="xs">
        {TENDERS.map((t) => {
          const disabled = t === 'Points' && pointsLeft < MIN_POINTS_TO_REDEEM;
          return (
            <Button key={t} h={64} variant={tender === t ? 'filled' : 'default'} disabled={disabled} onClick={() => pickTender(t)}>
              <Stack gap={0} align="center">
                <span>{ICONS[t]}</span>
                <Text fz="xs" fw={600}>
                  {t}
                  {t === 'Points' ? ` · ${pointsLeft} pts` : ''}
                </Text>
              </Stack>
            </Button>
          );
        })}
      </SimpleGrid>

      {tender === 'Cash' && (
        <>
          <Card bg="dark.8" ta="right" py="xs">
            <Text fz="xs" c="dimmed">
              Cash received
            </Text>
            <Text fz={24} fw={600}>
              {given || '0'}
            </Text>
          </Card>
          <SimpleGrid cols={4} spacing={8}>
            {['1', '2', '3', '⌫', '4', '5', '6', 'C', '7', '8', '9', '00', '0', '.', 'round', 'Exact'].map((k) => (
              <UnstyledButton
                key={k}
                onClick={() => numpad(k)}
                bg={k === 'round' || k === 'Exact' ? 'lime.5' : 'dark.6'}
                c={k === 'round' || k === 'Exact' ? 'dark.9' : undefined}
                h={46}
                ta="center"
                fw={600}
                style={{ borderRadius: 12 }}
              >
                {k === 'round' ? Math.ceil(due) : k}
              </UnstyledButton>
            ))}
          </SimpleGrid>
          {change > 0 && (
            <Text ta="right">
              Change due:{' '}
              <Text span c="lime" fw={700}>
                {money(change)}
              </Text>
            </Text>
          )}
        </>
      )}
      {tender === 'Card' && (
        <Card bg="dark.8" ta="center" fz="sm">
          Terminal ready · tap, insert or swipe
          <Text fz="xs" c="dimmed">
            Tali Pay terminal T-01 · Meeza / Visa / Mastercard / Apple Pay
          </Text>
        </Card>
      )}
      {(tender === 'InstaPay' || tender === 'Fawry') && (
        <Card bg="dark.8" ta="center" fz="sm">
          Ask the guest to scan · {tender} · {money(due)}
        </Card>
      )}
      {tender === 'Gift card' && (
        <TextInput label="Gift card code" placeholder="GC-4471" value={giftCode} onChange={(e) => setGiftCode(e.currentTarget.value)} />
      )}
      {tender === 'Points' && (
        <Card bg="dark.8" fz="sm">
          Redeem {Math.min(pointsLeft, Math.floor(due / EGP_PER_POINT))} points →{' '}
          {money(Math.min(pointsLeft, Math.floor(due / EGP_PER_POINT)) * EGP_PER_POINT)} off
        </Card>
      )}

      <Group align="end">
        <NumberInput placeholder="Part amount" value={part} onChange={setPart} min={0} max={due} decimalScale={2} w={140} />
        <Button variant="default" onClick={takePart}>
          Split · take part
        </Button>
        <div style={{ flex: 1 }} />
        <Button size="md" onClick={() => take(due)}>
          {tender === 'Cash' ? 'Take cash' : 'Confirm payment'}
        </Button>
      </Group>
    </Stack>
  );
}
