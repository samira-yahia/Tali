import { ActionIcon, Badge, Card, Center, Group, SimpleGrid, Text } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { isAvailable } from '../../domain/inventory';
import { useTali } from '../../store/useTali';
import { openModifierPicker } from './openModifierPicker';

export function MenuGrid({ category, query }: { category: string; query: string }) {
  const menu = useTali((s) => s.menu);
  const ingredients = useTali((s) => s.ingredients);
  const cart = useTali((s) => s.cart);
  const addToCart = useTali((s) => s.addToCart);
  const removeOneOfItem = useTali((s) => s.removeOneOfItem);

  const q = query.trim().toLowerCase();
  const list = menu.filter((m) => (category === 'All' || m.category === category) && (!q || m.name.toLowerCase().includes(q)));

  if (!list.length)
    return (
      <Card c="dimmed" fz="sm">
        No dishes match “{query}”.
      </Card>
    );

  return (
    <SimpleGrid type="container" cols={{ base: 1, '600px': 2, '920px': 3 }}>
      {list.map((m) => {
        const qty = cart.filter((l) => l.itemId === m.id).reduce((s, l) => s + l.qty, 0);
        const out = m.hidden || !isAvailable(m, ingredients);
        const add = () => (m.modifiers ? openModifierPicker(m) : addToCart(m.id));
        return (
          <Card key={m.id} p="sm" opacity={out ? 0.45 : 1}>
            <Group wrap="nowrap" align="stretch">
              <Center w={84} h={84} bg="dark.4" fz={40} style={{ borderRadius: 16, flexShrink: 0 }} aria-hidden>
                {m.icon}
              </Center>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text fz="xs" c="dimmed">
                  {m.category}
                </Text>
                <Text fw={600} truncate>
                  {m.name}
                </Text>
                <Group gap={8} mt={8}>
                  <ActionIcon variant="default" radius="xl" disabled={!qty} onClick={() => removeOneOfItem(m.id)} aria-label={`Remove one ${m.name}`}>
                    <IconMinus size={14} />
                  </ActionIcon>
                  <Text fw={600} w={16} ta="center">
                    {qty}
                  </Text>
                  <ActionIcon radius="xl" disabled={out} onClick={add} aria-label={`Add ${m.name}`}>
                    <IconPlus size={14} />
                  </ActionIcon>
                  {out && <Badge color="red">{m.hidden ? 'Hidden' : 'Out of stock'}</Badge>}
                </Group>
              </div>
              <Text fw={600}>{m.price.toFixed(2)}</Text>
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
