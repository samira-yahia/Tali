import { Button, SimpleGrid, Stack, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KpiCard } from '../../components/ui/KpiCard';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { ScrollSegments } from '../../components/ui/ScrollSegments';
import { CATEGORIES, ORDER_TYPES } from '../../domain/constants';
import { cashExpected, isOpen, isPaidSale, isUnpaid } from '../../domain/orders';
import { whole } from '../../lib/format';
import { useTali } from '../../store/useTali';
import type { OrderType } from '../../types';
import { MenuGrid } from './MenuGrid';
import { OrderLine } from './OrderLine';

export function PosPage() {
  const navigate = useNavigate();
  const orders = useTali((s) => s.orders);
  const menu = useTali((s) => s.menu);
  const shift = useTali((s) => s.shift);
  const [lineType, setLineType] = useState<OrderType>('Dine in');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const sales = orders.filter(isPaidSale).reduce((s, o) => s + o.total, 0);
  const unpaid = orders.filter(isUnpaid).reduce((s, o) => s + o.total, 0);

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <KpiCard tone="lime" label="Open orders" value={orders.filter(isOpen).length} hint="In kitchen right now" />
        <KpiCard tone="white" label="Net sales" value={whole(sales)} hint="EGP paid today" />
        <KpiCard label="Unpaid" value={whole(unpaid)} hint="EGP awaiting payment" />
        <KpiCard label="Cash in drawer" value={whole(cashExpected(orders, shift))} hint="EGP expected" />
      </SimpleGrid>

      <PageHeader title="Order line">
        <ScrollSegments
          value={lineType}
          onChange={(v) => setLineType(v as OrderType)}
          data={ORDER_TYPES.map((t) => ({ value: t, label: `${t} · ${orders.filter((o) => o.type === t && isOpen(o)).length}` }))}
        />
        <Spacer />
        <Button variant="default" onClick={() => navigate('/orders')}>
          All orders
        </Button>
      </PageHeader>
      <OrderLine type={lineType} />

      <PageHeader title="Menu">
        <ScrollSegments
          value={category}
          onChange={setCategory}
          data={['All', ...CATEGORIES].map((c) => ({
            value: c,
            label: `${c} · ${c === 'All' ? menu.length : menu.filter((m) => m.category === c).length}`,
          }))}
        />
        <Spacer />
        <TextInput
          placeholder="Search dishes"
          leftSection={<IconSearch size={16} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          radius="xl"
          w={{ base: '100%', xs: 220 }}
        />
      </PageHeader>
      <MenuGrid category={category} query={query} />
    </Stack>
  );
}
