import { Button, Stack, Switch, Text } from '@mantine/core';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { openForm } from '../../components/ui/openForm';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

function openAddPromo() {
  openForm({
    title: 'New promotion',
    fields: [
      { name: 'name', label: 'Promotion name', required: true, full: true },
      { name: 'value', label: 'Discount %', type: 'number', defaultValue: 15 },
      { name: 'code', label: 'Coupon code', placeholder: 'Blank = automatic promotion' },
    ],
    submitLabel: 'Go live',
    onSubmit: ({ name, value, code }) => {
      const c = code.trim().toUpperCase();
      useTali.getState().addPromo({ name, value: +value || 0, code: c, type: c ? 'Coupon' : 'Promotion' });
      toast(`${name} is live`);
    },
  });
}

function openSellGiftCard() {
  openForm({
    title: 'Sell gift card',
    fields: [{ name: 'amount', label: 'Load amount (EGP)', type: 'number', defaultValue: 200, required: true }],
    submitLabel: 'Sell gift card',
    onSubmit: ({ amount }) => {
      const v = +amount;
      if (!v || v <= 0) return 'Enter an amount';
      const card = useTali.getState().sellGiftCard(v);
      toast(`Gift card ${card.code} sold · ${money(v)}`);
    },
  });
}

export function PromosPage() {
  const { promos, giftCards, togglePromo } = useTali();

  return (
    <Stack>
      <PageHeader title="Promotions">
        <Spacer />
        <Button variant="white" color="dark" onClick={openAddPromo}>New promotion</Button>
      </PageHeader>

      <DataTable
        data={promos.map((p, index) => ({ p, index }))}
        rowKey={(r) => r.index}
        columns={[
          {
            header: 'Promotion',
            cell: ({ p }) => (
              <div>
                <b>{p.name}</b>
                {p.note && <Text fz="xs" c="dimmed">{p.note}</Text>}
              </div>
            ),
          },
          { header: 'Type', cell: ({ p }) => p.type },
          { header: 'Code', cell: ({ p }) => p.code || '—' },
          { header: 'Value', cell: ({ p }) => (p.value ? `${p.value}%` : 'Item') },
          { header: 'Uses', cell: ({ p }) => p.uses },
          {
            header: 'Active',
            cell: ({ p, index }) => (
              <Switch
                checked={p.active}
                aria-label="Active"
                onChange={() => {
                  togglePromo(index);
                  toast(`${p.name} ${p.active ? 'paused' : 'activated'}`);
                }}
              />
            ),
          },
        ]}
      />

      <InfoCard
        title="Gift cards"
        action={<Button size="xs" variant="white" color="dark" onClick={openSellGiftCard}>Sell gift card</Button>}
        rows={giftCards.map((g) => ({ label: g.code, value: `Balance ${money(g.balance)}` }))}
      />
    </Stack>
  );
}
