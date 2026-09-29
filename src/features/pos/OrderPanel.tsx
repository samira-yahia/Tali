import { ActionIcon, Button, CloseButton, Divider, Group, ScrollArea, SegmentedControl, Select, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconDiscount, IconMinus, IconPencil, IconPlus, IconTicket } from '@tabler/icons-react';
import { openForm } from '../../components/ui/openForm';
import { ORDER_TYPES, TABLES } from '../../domain/constants';
import { calcTotals, lineTotal, priceLines } from '../../domain/pricing';
import { money, whole } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { OrderType } from '../../types';
import { openPayment } from '../payments/openPayment';
import { openShiftModal } from '../shifts/shiftModals';

/** `onClose` is set when the panel is shown in the phone bottom sheet. */
export function OrderPanel({ onClose }: { onClose?: () => void }) {
  const s = useTali();
  const lines = priceLines(s.cart, s.menu);
  const totals = calcTotals(lines, s.draft.discount, s.draft.type);
  const count = s.cart.reduce((n, l) => n + l.qty, 0);

  const send = (payNow: boolean) => {
    if (!s.shift) {
      toast('Open a shift before taking orders', 'yellow');
      return openShiftModal();
    }
    const result = s.sendOrder();
    if (!result.ok) return toast(result.error, 'red');
    onClose?.();
    if (payNow) openPayment(result.value.no);
    else toast(`Order #${result.value.no} sent to kitchen${s.online ? '' : ' · queued offline'}`);
  };

  const cookingRequest = () => {
    if (!s.cart.length) return toast('Add a dish first', 'yellow');
    const index = s.cart.length - 1;
    const item = s.menu.find((m) => m.id === s.cart[index].itemId);
    openForm({
      title: `Cooking request · ${item?.name}`,
      fields: [{ name: 'note', label: 'Request', defaultValue: s.cart[index].note, placeholder: 'No onions, extra spicy…' }],
      submitLabel: 'Save request',
      onSubmit: ({ note }) => useTali.getState().setLineNote(index, note.trim()),
    });
  };

  const voucher = () =>
    openForm({
      title: 'Voucher',
      fields: [{ name: 'code', label: 'Voucher code', placeholder: 'Try TALI10 or RAMADAN20', required: true }],
      submitLabel: 'Apply voucher',
      onSubmit: ({ code }) => {
        const promo = useTali.getState().applyVoucher(code);
        if (!promo) return 'That code isn’t valid or is paused';
        toast(`${promo.code} applied · ${promo.value}% off`);
      },
    });

  const discount = () =>
    openForm({
      title: 'Manager discount',
      intro: <Text fz="sm" c="dimmed">Manager PIN required. Every discount is logged for audit.</Text>,
      fields: [
        { name: 'kind', label: 'Type', type: 'select', options: [{ value: 'percent', label: 'Percent %' }, { value: 'amount', label: 'Amount EGP' }], defaultValue: 'percent' },
        { name: 'value', label: 'Value', type: 'number', defaultValue: 10, required: true },
      ],
      submitLabel: 'Apply discount',
      onSubmit: ({ kind, value }) => {
        const n = +value;
        if (!n || n < 0) return 'Enter a positive value';
        const d = kind === 'percent'
          ? { kind: 'percent' as const, value: Math.min(100, n), label: `Manager ${Math.min(100, n)}%` }
          : { kind: 'amount' as const, value: n, label: 'Manager discount' };
        useTali.getState().setDraft({ discount: d });
        toast('Discount applied · logged for audit');
      },
    });

  return (
    <Stack h="100%" p="md" gap="sm">
      <Group justify="space-between">
        <Title order={4}>Order details</Title>
        <Group gap={4}>
          <Button variant="subtle" color="gray" size="xs" disabled={!s.cart.length} onClick={() => { s.clearCart(); toast('Order cleared'); }}>
            Clear
          </Button>
          {onClose && <CloseButton onClick={onClose} aria-label="Close order" />}
        </Group>
      </Group>

      <SegmentedControl fullWidth value={s.draft.type} onChange={(v) => s.setDraft({ type: v as OrderType })} data={ORDER_TYPES} />
      <Select
        placeholder="Walk-in customer"
        clearable
        value={s.draft.customerId ? String(s.draft.customerId) : null}
        onChange={(v) => s.setDraft({ customerId: v ? +v : null })}
        data={s.customers.map((c) => ({ value: String(c.id), label: `${c.name} · ${c.points} pts` }))}
      />
      {s.draft.type === 'Dine in' && (
        <Select
          placeholder="Select table"
          value={s.draft.table || null}
          onChange={(v) => s.setDraft({ table: v ?? '' })}
          data={TABLES.map((t) => `Table ${t.n}`)}
        />
      )}

      <Group justify="space-between">
        <Text fw={600}>Order #{s.nextNo}</Text>
        <Text fz="sm" c="dimmed">
          {count} item{count === 1 ? '' : 's'}
        </Text>
      </Group>

      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        {!lines.length && (
          <Text c="dimmed" ta="center" fz="sm" py="xl">
            Your order is empty.
            <br />
            Tap + on any dish to start.
          </Text>
        )}
        <Stack gap="xs">
          {lines.map((l, i) => {
            const item = s.menu.find((m) => m.id === l.itemId)!;
            return (
              <Stack key={i} gap={4} p="sm" bg="dark.6" style={{ borderRadius: 14 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Text fz="sm" fw={600}>
                    {item.icon} {item.name}
                  </Text>
                  <CloseButton size="sm" onClick={() => s.removeLine(i)} aria-label="Remove" />
                </Group>
                {l.mods.length > 0 && <Text fz="xs" c="dimmed">{l.mods.join(', ')}</Text>}
                {l.note && <Text fz="xs" c="yellow">⚠ {l.note}</Text>}
                <Group justify="space-between">
                  <Group gap={8}>
                    <ActionIcon size="sm" variant="default" radius="xl" onClick={() => s.changeLineQty(i, -1)} aria-label="Less">
                      <IconMinus size={12} />
                    </ActionIcon>
                    <Text fz="sm" fw={600}>{l.qty}</Text>
                    <ActionIcon size="sm" radius="xl" onClick={() => s.changeLineQty(i, 1)} aria-label="More">
                      <IconPlus size={12} />
                    </ActionIcon>
                  </Group>
                  <Text fz="sm" fw={600}>{money(lineTotal(l))}</Text>
                </Group>
              </Stack>
            );
          })}
        </Stack>
      </ScrollArea>

      <SimpleGrid cols={3} spacing={6}>
        <Button variant="default" size="xs" px={6} leftSection={<IconPencil size={14} />} onClick={cookingRequest}>Request</Button>
        <Button variant="default" size="xs" px={6} leftSection={<IconTicket size={14} />} onClick={voucher}>Voucher</Button>
        <Button variant="default" size="xs" px={6} leftSection={<IconDiscount size={14} />} onClick={discount}>Discount</Button>
      </SimpleGrid>

      <Stack gap={4} fz="sm">
        <Group justify="space-between"><span>Subtotal</span><span>{money(totals.subtotal)}</span></Group>
        {s.draft.discount && (
          <Group justify="space-between" c="lime">
            <span>{s.draft.discount.label}</span>
            <span>– {money(totals.discount)}</span>
          </Group>
        )}
        {s.draft.type === 'Dine in' && <Group justify="space-between"><span>Service 12%</span><span>{money(totals.service)}</span></Group>}
        <Group justify="space-between"><span>VAT 14%</span><span>{money(totals.vat)}</span></Group>
        <Divider my={4} />
        <Group justify="space-between" fz="lg" fw={600}><span>Total</span><span>{money(totals.total)}</span></Group>
      </Stack>

      <SimpleGrid cols={2}>
        <Button color="violet" size="md" fz="sm" px="xs" disabled={!s.cart.length} onClick={() => send(false)}>
          Send to kitchen
        </Button>
        <Button size="md" fz="sm" px="xs" disabled={!s.cart.length} onClick={() => send(true)}>
          {s.cart.length ? `Pay ${whole(totals.total)}` : 'Pay'}
        </Button>
      </SimpleGrid>
    </Stack>
  );
}
