import { BarChart, DonutChart } from '@mantine/charts';
import { Badge, Card, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import { InfoCard, InfoRows } from '../../components/ui/InfoRows';
import { KpiCard } from '../../components/ui/KpiCard';
import { LATE_AFTER_MINUTES } from '../../domain/constants';
import { cogs, stockLevel } from '../../domain/inventory';
import { isOpen, isPaidSale } from '../../domain/orders';
import { useNow } from '../../hooks/useNow';
import { minutesSince, money, whole } from '../../lib/format';
import { useTali } from '../../store/useTali';

// Static in the prototype as well.
const SALES_BY_HOUR = [8, 14, 22, 60, 90, 70, 40, 30, 35, 55, 95, 100, 80, 45].map((v, i) => ({ hour: String(9 + i), sales: v }));

const TENDER_COLOR: Record<string, string> = {
  Cash: 'lime.5',
  Card: 'violet.5',
  InstaPay: 'blue.5',
  Fawry: 'yellow.5',
  'Gift card': 'gray.1',
  Points: 'red.6',
};

const ALERT = {
  red: { color: 'red.6', label: 'Act now' },
  yellow: { color: 'yellow.5', label: 'Soon' },
  violet: { color: 'violet.5', label: 'Review' },
} as const;

export function DashboardPage() {
  const now = useNow();
  const { orders, menu, ingredients, shift, purchaseOrders } = useTali();

  const paid = orders.filter(isPaidSale);
  const active = orders.filter((o) => o.status !== 'Cancelled');
  const sales = paid.reduce((s, o) => s + o.total, 0);
  const netSub = paid.reduce((s, o) => s + o.subtotal - o.discount, 0);
  const foodCost = netSub ? Math.round((cogs(paid.flatMap((o) => o.lines), menu, ingredients) / netSub) * 100) : 0;

  const mix: Record<string, number> = {};
  for (const s of paid.flatMap((o) => o.splits ?? [])) mix[s.tender] = (mix[s.tender] ?? 0) + s.amount;
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0) || 1;

  const sold: Record<number, number> = {};
  for (const l of active.flatMap((o) => o.lines)) sold[l.itemId] = (sold[l.itemId] ?? 0) + l.qty;

  const channels: Record<string, number> = {};
  for (const o of active) {
    const key = o.customer.startsWith('Talabat') ? 'Talabat' : o.type;
    channels[key] = (channels[key] ?? 0) + o.total;
  }

  const alerts: { text: string; level: keyof typeof ALERT }[] = [];
  for (const i of ingredients.filter((x) => stockLevel(x) === 'critical'))
    alerts.push({ text: `${i.name} ${i.stock <= 0 ? 'out of stock' : 'critically low'}`, level: 'red' });
  for (const i of ingredients.filter((x) => stockLevel(x) === 'low')) alerts.push({ text: `${i.name} below par`, level: 'yellow' });
  for (const o of orders.filter((x) => isOpen(x) && minutesSince(x.createdAt, now) > LATE_AFTER_MINUTES))
    alerts.push({ text: `Order #${o.no} over ${LATE_AFTER_MINUTES} min`, level: 'red' });
  if (!shift) alerts.push({ text: 'No shift open on this till', level: 'yellow' });
  if (purchaseOrders.some((p) => p.status === 'Awaiting approval')) alerts.push({ text: 'Purchase order awaiting approval', level: 'violet' });

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <KpiCard tone="lime" label="Net sales" value={whole(sales)} hint="EGP paid today" />
        <KpiCard tone="white" label="Orders" value={active.length} hint="All channels" />
        <KpiCard label="Average order" value={paid.length ? whole(sales / paid.length) : 0} hint="EGP incl. VAT" />
        <KpiCard tone="violet" label="Food cost" value={`${foodCost}%`} hint="Theoretical COGS on paid sales" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card>
          <Title order={5} mb="md">Sales by hour</Title>
          <BarChart h={200} data={SALES_BY_HOUR} dataKey="hour" series={[{ name: 'sales', color: 'lime.5' }]} withYAxis={false} gridAxis="none" />
        </Card>
        <Card>
          <Title order={5} mb="md">Payment mix</Title>
          <Group wrap="nowrap" align="center">
            <DonutChart
              size={150}
              thickness={22}
              chartLabel={`${paid.length} paid`}
              data={Object.entries(mix).map(([name, value]) => ({ name, value, color: TENDER_COLOR[name] ?? 'gray.5' }))}
              valueFormatter={money}
            />
            <div style={{ flex: 1 }}>
              <InfoRows
                rows={Object.entries(mix)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => ({
                    label: <Badge color={TENDER_COLOR[k]} variant="dot">{k}</Badge>,
                    value: `${Math.round((v / mixTotal) * 100)}% · ${money(v)}`,
                  }))}
              />
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <InfoCard
          title="Top dishes"
          rows={Object.entries(sold)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([id, qty]) => {
              const m = menu.find((x) => x.id === +id);
              return { label: `${m?.icon} ${m?.name}`, value: `${qty} sold` };
            })}
        />
        <InfoCard
          title="Needs attention"
          empty="All clear."
          rows={alerts.slice(0, 7).map(({ text, level }) => ({ label: text, value: <Badge color={ALERT[level].color}>{ALERT[level].label}</Badge> }))}
        />
        <InfoCard
          title="Channels"
          rows={Object.entries(channels)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => ({ label: k, value: money(v) }))}
        />
      </SimpleGrid>
    </Stack>
  );
}
