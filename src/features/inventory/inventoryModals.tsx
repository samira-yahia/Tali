import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { InfoRows } from '../../components/ui/InfoRows';
import { openForm } from '../../components/ui/openForm';
import { SUPPLIERS } from '../../data/business';
import { suggestPurchases } from '../../domain/inventory';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

export function openLogWaste() {
  const { ingredients } = useTali.getState();
  openForm({
    title: 'Log waste',
    fields: [
      { name: 'id', label: 'Ingredient', type: 'select', options: ingredients.map((i) => ({ value: i.id, label: i.name })), defaultValue: ingredients[0].id },
      { name: 'qty', label: 'Quantity', type: 'number', defaultValue: 1 },
      { name: 'reason', label: 'Reason', type: 'select', options: ['Expired', 'Spoiled', 'Over-prepared', 'Dropped / damaged', 'Staff meal'], defaultValue: 'Expired' },
    ],
    submitLabel: 'Log waste',
    onSubmit: ({ id, qty, reason }) => {
      const q = +qty;
      if (!q || q <= 0) return 'Enter a quantity';
      const ing = ingredients.find((i) => i.id === id)!;
      useTali.getState().logWaste(id, q);
      toast(`${q} ${ing.unit} ${ing.name} logged as ${reason.toLowerCase()}`);
    },
  });
}

export function openStockCount() {
  const { ingredients } = useTali.getState();
  openForm({
    title: 'Stock count',
    intro: <Text fz="sm" c="dimmed">Enter counted quantities. Differences are posted as adjustments for manager approval.</Text>,
    fields: ingredients.map((i) => ({ name: i.id, label: `${i.name} (${i.unit})`, type: 'number' as const, defaultValue: i.stock })),
    submitLabel: 'Post count',
    onSubmit: (values) => {
      const counts = Object.fromEntries(Object.entries(values).map(([id, v]) => [id, +v || 0]));
      const adjustment = useTali.getState().postCount(counts);
      toast(`Count posted · ${money(adjustment)} in adjustments`);
    },
  });
}

export function openSuggestedPurchases(onCreated?: () => void) {
  const suggestions = Object.entries(suggestPurchases(useTali.getState().ingredients));
  if (!suggestions.length) return toast('Everything is at par — nothing to order');

  const id = modals.open({
    title: 'Suggested purchase orders',
    size: 'lg',
    children: (
      <Stack>
        <Text fz="sm" c="dimmed">Quantities bring each ingredient back to par plus 20%.</Text>
        {suggestions.map(([supplier, lines]) => (
          <Card key={supplier} bg="dark.8">
            <Group justify="space-between" mb="xs">
              <Title order={5}>{supplier}</Title>
              <Badge color="dark.4">{SUPPLIERS.find((s) => s.name === supplier)?.terms}</Badge>
            </Group>
            <InfoRows rows={lines.map((l) => ({ label: l.ingredient.name, value: `${l.qty} ${l.ingredient.unit} · ${money(l.cost)}` }))} />
          </Card>
        ))}
        <Button
          size="md"
          onClick={() => {
            useTali.getState().createSuggestedPurchaseOrders();
            modals.close(id);
            onCreated?.();
            toast('Purchase orders created · manager approval requested');
          }}
        >
          Create {suggestions.length} purchase order{suggestions.length > 1 ? 's' : ''} for approval
        </Button>
      </Stack>
    ),
  });
}
