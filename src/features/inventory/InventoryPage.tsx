import { Badge, Button, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { KpiCard } from '../../components/ui/KpiCard';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { recipeCost, stockLevel } from '../../domain/inventory';
import { money, whole } from '../../lib/format';
import { useTali } from '../../store/useTali';
import { openLogWaste, openStockCount, openSuggestedPurchases } from './inventoryModals';

const LEVEL_COLOR = { ok: 'lime', low: 'yellow', critical: 'red' } as const;

export function InventoryPage() {
  const navigate = useNavigate();
  const { ingredients, menu, wasteValue, depletedValue } = useTali();
  const sorted = [...ingredients].sort((a, b) => a.stock / a.par - b.stock / b.par);

  return (
    <Stack>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <KpiCard tone="lime" label="Stock value" value={whole(ingredients.reduce((s, i) => s + i.stock * i.cost, 0))} hint="EGP at cost" />
        <KpiCard tone="white" label="Below par" value={ingredients.filter((i) => i.stock < i.par).length} hint="Ingredients to reorder" />
        <KpiCard label="Waste today" value={whole(wasteValue)} hint="EGP logged" />
        <KpiCard label="Depleted by sales" value={whole(depletedValue)} hint="EGP consumed today" />
      </SimpleGrid>

      <PageHeader title="Ingredients">
        <Spacer />
        <Button variant="default" onClick={openStockCount}>Start count</Button>
        <Button variant="default" onClick={openLogWaste}>Log waste</Button>
        <Button variant="white" color="dark" onClick={() => openSuggestedPurchases(() => navigate('/purchasing'))}>
          Suggest purchase order
        </Button>
      </PageHeader>

      <DataTable
        data={sorted}
        rowKey={(i) => i.id}
        columns={[
          { header: 'Ingredient', cell: (i) => <div><b>{i.name}</b><Text fz="xs" c="dimmed">{i.unit}</Text></div> },
          {
            header: 'On hand',
            cell: (i) => {
              const level = stockLevel(i);
              return <Text fz="sm" c={level === 'ok' ? undefined : LEVEL_COLOR[level]}>{i.stock} {i.unit}</Text>;
            },
          },
          { header: 'Par', cell: (i) => i.par },
          { header: 'Level', cell: (i) => <Progress value={Math.min(100, (i.stock / i.par) * 100)} color={LEVEL_COLOR[stockLevel(i)]} w={140} /> },
          { header: 'Unit cost', cell: (i) => money(i.cost) },
          { header: 'Value', cell: (i) => money(i.stock * i.cost) },
          { header: 'Supplier', cell: (i) => i.supplier },
        ]}
      />

      <InfoCard
        title="Recipes"
        action={<Badge color="dark.4">Sales deplete stock automatically</Badge>}
        rows={menu
          .filter((m) => Object.keys(m.recipe).length)
          .slice(0, 8)
          .map((m) => ({
            label: `${m.icon} ${m.name}`,
            value: `${Object.entries(m.recipe)
              .map(([id, q]) => {
                const ing = ingredients.find((x) => x.id === id);
                return `${q} ${ing?.unit} ${ing?.name}`;
              })
              .join(' · ')} → cost ${money(recipeCost(m, ingredients))}`,
          }))}
      />
    </Stack>
  );
}
