import { Badge, Button, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { SegmentTabs } from '../../components/ui/SegmentTabs';
import { STATUS_COLOR } from '../../components/ui/statusColors';
import { LATE_AFTER_MINUTES, STATION_BY_CATEGORY } from '../../domain/constants';
import { useNow } from '../../hooks/useNow';
import { minutesSince } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { MenuItem, Order, OrderLine, OrderStatus } from '../../types';
import { advanceWithFeedback } from '../orders/orderActions';

const STATIONS = ['All', 'Hot', 'Grill', 'Cold', 'Bar', 'Expo'] as const;
type StationFilter = (typeof STATIONS)[number];

const stationOf = (line: OrderLine, menu: MenuItem[]) => {
  const item = menu.find((m) => m.id === line.itemId);
  return item ? STATION_BY_CATEGORY[item.category] : undefined;
};

export function KdsPage() {
  const now = useNow();
  const orders = useTali((s) => s.orders);
  const menu = useTali((s) => s.menu);
  const setStatus = useTali((s) => s.setStatus);
  const [station, setStation] = useState<StationFilter>('All');

  const cooking = orders.filter((o) => o.status === 'New' || o.status === 'In progress');
  const atStation = (o: Order, st: string) => o.lines.some((l) => stationOf(l, menu) === st);

  let tickets = orders
    .filter((o) => o.status === 'New' || o.status === 'In progress' || o.status === 'Ready to serve')
    .sort((a, b) => a.createdAt - b.createdAt);
  if (station === 'Expo') tickets = tickets.filter((o) => o.status === 'Ready to serve');
  else if (station !== 'All') tickets = tickets.filter((o) => o.status !== 'Ready to serve' && atStation(o, station));

  const times = orders.filter((o) => o.status === 'Completed' && o.paidAt).map((o) => (o.paidAt! - o.createdAt) / 60000);
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const bump = (no: number, status: OrderStatus) => {
    setStatus(no, status);
    toast(`#${no} · ${status}`);
  };

  return (
    <Stack>
      <PageHeader title="Kitchen display">
        <SegmentTabs
          value={station}
          onChange={(v) => setStation(v as StationFilter)}
          data={STATIONS.map((st) => ({
            value: st,
            label: st === 'All' || st === 'Expo' ? st : `${st} · ${cooking.filter((o) => atStation(o, st)).length}`,
          }))}
        />
        <Spacer />
        <Badge size="lg" color="dark.4">Avg ticket time {avg} min</Badge>
      </PageHeader>

      {!tickets.length && <Card c="dimmed" fz="sm">No tickets for {station}. Kitchen is clear.</Card>}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
        {tickets.map((o) => {
          const mins = minutesSince(o.createdAt, now);
          const late = mins > LATE_AFTER_MINUTES && o.status !== 'Ready to serve';
          const lines = station === 'All' || station === 'Expo' ? o.lines : o.lines.filter((l) => stationOf(l, menu) === station);
          const headerBg = late ? 'red.6' : STATUS_COLOR[o.status];
          return (
            <Card key={o.no} p={0}>
              <Group justify="space-between" px="md" py="sm" bg={headerBg} c={headerBg === 'lime.5' || headerBg === 'yellow.5' ? 'dark.9' : 'white'} fw={600}>
                <span>#{o.no} · {o.table || o.type}</span>
                <span>{mins} min</span>
              </Group>
              <Stack gap="xs" p="md" style={{ flex: 1 }}>
                {lines.map((l, i) => {
                  const item = menu.find((m) => m.id === l.itemId);
                  return (
                    <Group key={i} gap="sm" wrap="nowrap" align="start">
                      <Text fw={700}>{l.qty}×</Text>
                      <div>
                        <Text fz="sm">{item?.name}</Text>
                        {l.mods.length > 0 && <Text fz="xs" c="dimmed">{l.mods.join(', ')}</Text>}
                        {l.note && <Text fz="xs" c="yellow">⚠ {l.note}</Text>}
                        <Text fz="xs" c="dimmed">{stationOf(l, menu)}</Text>
                      </div>
                    </Group>
                  );
                })}
              </Stack>
              <Group p="md" pt={0} gap="xs">
                {o.status === 'New' && <Button color="violet" fullWidth onClick={() => bump(o.no, 'In progress')}>Start</Button>}
                {o.status === 'In progress' && <Button fullWidth onClick={() => bump(o.no, 'Ready to serve')}>Bump · ready</Button>}
                {o.status === 'Ready to serve' && (
                  <>
                    <Button variant="default" onClick={() => bump(o.no, 'In progress')}>Recall</Button>
                    <Button style={{ flex: 1 }} onClick={() => advanceWithFeedback(o.no)}>Served</Button>
                  </>
                )}
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
