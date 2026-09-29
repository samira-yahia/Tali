import { Badge, Button, NumberInput, SimpleGrid, Stack, Switch, Text } from '@mantine/core';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { openForm } from '../../components/ui/openForm';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { CATEGORIES, MODIFIER_GROUPS, STATION_BY_CATEGORY } from '../../domain/constants';
import { isAvailable, recipeCost } from '../../domain/inventory';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { Category, ModifierGroupId } from '../../types';

function openAddDish() {
  openForm({
    title: 'Add dish',
    fields: [
      { name: 'name', label: 'Name', placeholder: 'e.g. Feteer meshaltet', required: true, full: true },
      { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, defaultValue: CATEGORIES[0] },
      { name: 'price', label: 'Price (EGP)', type: 'number', defaultValue: 60 },
      { name: 'icon', label: 'Emoji', defaultValue: '🍽️' },
      {
        name: 'modifiers',
        label: 'Modifier group',
        type: 'select',
        options: [{ value: '', label: 'None' }, ...Object.entries(MODIFIER_GROUPS).map(([value, g]) => ({ value, label: g.name }))],
        defaultValue: '',
      },
    ],
    submitLabel: 'Save dish',
    onSubmit: ({ name, category, price, icon, modifiers }) => {
      useTali.getState().addMenuItem({
        name: name.trim(),
        category: category as Category,
        price: +price || 0,
        icon: icon || '🍽️',
        modifiers: (modifiers || undefined) as ModifierGroupId | undefined,
      });
      toast(`${name} added to the menu across 3 branches`);
    },
  });
}

export function MenuPage() {
  const { menu, ingredients, setPrice, toggleHidden } = useTali();

  return (
    <Stack>
      <PageHeader title="Menu manager">
        <Badge color="dark.4">Maadi · {menu.length} items</Badge>
        <Spacer />
        <Button variant="white" color="dark" onClick={openAddDish}>Add dish</Button>
      </PageHeader>

      <DataTable
        minWidth={900}
        data={menu.map((m) => {
          const cost = recipeCost(m, ingredients);
          return { m, cost, margin: m.price ? (m.price - cost) / m.price : 0, ok: isAvailable(m, ingredients) };
        })}
        rowKey={(r) => r.m.id}
        columns={[
          { header: '', cell: ({ m }) => <Text fz={22}>{m.icon}</Text> },
          {
            header: 'Dish',
            cell: ({ m }) => (
              <div>
                <b>{m.name}</b>
                <Text fz="xs" c="dimmed">
                  {m.modifiers ? `Modifiers: ${MODIFIER_GROUPS[m.modifiers].name}` : 'No modifiers'} · {STATION_BY_CATEGORY[m.category]} station
                </Text>
              </div>
            ),
          },
          { header: 'Category', cell: ({ m }) => m.category },
          {
            header: 'Price',
            cell: ({ m }) => (
              <NumberInput
                key={m.price}
                w={100}
                size="xs"
                min={0}
                defaultValue={m.price}
                aria-label={`${m.name} price`}
                onBlur={(e) => {
                  const price = +e.currentTarget.value;
                  if (!price || price === m.price) return;
                  setPrice(m.id, price);
                  toast(`${m.name} price updated · pushed to POS, online & aggregators`);
                }}
              />
            ),
          },
          { header: 'Cost', cell: ({ cost }) => money(cost) },
          { header: 'Margin', cell: ({ margin }) => <Text fz="sm" c={margin < 0.6 ? 'yellow' : undefined}>{Math.round(margin * 100)}%</Text> },
          { header: 'Stock', cell: ({ ok }) => <Text fz="sm" c={ok ? undefined : 'red'}>{ok ? 'OK' : 'Out'}</Text> },
          {
            header: 'On menu',
            cell: ({ m }) => (
              <Switch
                checked={!m.hidden}
                aria-label="On menu"
                onChange={() => {
                  toggleHidden(m.id);
                  toast(`${m.name} ${m.hidden ? 'shown on' : 'hidden from'} POS, online and aggregators`);
                }}
              />
            ),
          },
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <InfoCard
          title="Categories"
          rows={CATEGORIES.map((c) => ({ label: c, value: `${menu.filter((m) => m.category === c).length} dishes · ${STATION_BY_CATEGORY[c]} station` }))}
        />
        <InfoCard
          title="Modifier groups"
          rows={Object.values(MODIFIER_GROUPS).map((g) => ({
            label: g.name,
            value: g.options.map((o) => o.name + (o.price ? ` +${o.price}` : '')).join(' · '),
          }))}
        />
      </SimpleGrid>
    </Stack>
  );
}
