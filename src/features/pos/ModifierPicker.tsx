import { Button, Radio, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { MODIFIER_GROUPS } from '../../domain/constants';
import { money } from '../../lib/format';
import { useTali } from '../../store/useTali';
import type { MenuItem } from '../../types';

export function ModifierPicker({ item, modalId }: { item: MenuItem; modalId: string }) {
  const group = MODIFIER_GROUPS[item.modifiers!];
  const [choice, setChoice] = useState(group.options[0].name);
  const addToCart = useTali((s) => s.addToCart);

  return (
    <Stack>
      <Radio.Group value={choice} onChange={setChoice} label={`${group.name} · choose one`}>
        <Stack gap="xs" mt="xs">
          {group.options.map((o) => (
            <Radio.Card key={o.name} value={o.name} p="sm" radius="md">
              <Text fz="sm" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{o.name}</span>
                <span>{o.price ? `+ ${money(o.price)}` : ''}</span>
              </Text>
            </Radio.Card>
          ))}
        </Stack>
      </Radio.Group>
      <Button
        size="md"
        onClick={() => {
          addToCart(item.id, [choice]);
          modals.close(modalId);
        }}
      >
        Add to order
      </Button>
    </Stack>
  );
}