import { Badge, Button, SimpleGrid, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { KpiCard } from '../../components/ui/KpiCard';
import { openForm } from '../../components/ui/openForm';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { useNow } from '../../hooks/useNow';
import { ago, money, whole } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { Customer } from '../../types';

const TIER_COLOR: Record<Customer['tier'], string> = { Silver: 'dark.4', Gold: 'yellow.5', Black: 'gray.1' };

function openAddCustomer() {
  openForm({
    title: 'Add customer',
    fields: [
      { name: 'name', label: 'Customer name', required: true },
      { name: 'phone', label: 'Phone' },
    ],
    submitLabel: 'Add customer',
    onSubmit: ({ name, phone }) => {
      useTali.getState().addCustomer(name.trim(), phone.trim());
      toast(`${name} added`);
    },
  });
}

export function CustomersPage() {
  const now = useNow();
  const navigate = useNavigate();
  const { customers, orders, giftCards, setDraft } = useTali();

  const newOrderFor = (c: Customer) => {
    setDraft({ customerId: c.id });
    navigate('/pos');
    toast(`${c.name} attached to the current order`);
  };

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <KpiCard tone="lime" label="Customers" value={customers.length} hint="Profiles" />
        <KpiCard tone="white" label="Loyalty members" value={customers.filter((c) => c.points > 0).length} hint="Earning points" />
        <KpiCard label="Points liability" value={whole(customers.reduce((s, c) => s + c.points, 0))} hint="Outstanding points" />
        <KpiCard label="Gift card balance" value={whole(giftCards.reduce((s, g) => s + g.balance, 0))} hint="EGP outstanding" />
      </SimpleGrid>

      <PageHeader title="Customers">
        <Spacer />
        <Button variant="default" onClick={() => toast('Campaign scheduled to 3 segments via WhatsApp')}>Send campaign</Button>
        <Button variant="white" color="dark" onClick={openAddCustomer}>Add customer</Button>
      </PageHeader>

      <DataTable
        data={[...customers].sort((a, b) => b.spend - a.spend)}
        rowKey={(c) => c.id}
        columns={[
          {
            header: 'Customer',
            cell: (c) => {
              const last = Math.max(0, ...orders.filter((o) => o.customerId === c.id).map((o) => o.createdAt));
              return (
                <div>
                  <b>{c.name}</b>
                  <Text fz="xs" c="dimmed">Last order {last ? ago(last, now) : '—'}</Text>
                </div>
              );
            },
          },
          { header: 'Phone', cell: (c) => c.phone },
          { header: 'Visits', cell: (c) => c.visits },
          { header: 'Lifetime spend', cell: (c) => <b>{money(c.spend)}</b> },
          { header: 'Points', cell: (c) => c.points },
          { header: 'Tier', cell: (c) => <Badge color={TIER_COLOR[c.tier]}>{c.tier}</Badge> },
          { header: '', cell: (c) => <Button size="compact-sm" variant="default" onClick={() => newOrderFor(c)}>New order</Button> },
        ]}
      />

      <InfoCard
        title="Loyalty programme"
        action={<Badge>Active</Badge>}
        rows={[
          { label: 'Earn', value: '1 point per EGP 10 spent' },
          { label: 'Redeem', value: '100 points = EGP 10 off' },
          { label: 'Tiers', value: 'Silver 0 · Gold 500 · Black 1,500 points' },
        ]}
      />
    </Stack>
  );
}
