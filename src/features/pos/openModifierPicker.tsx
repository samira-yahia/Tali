import { modals } from '@mantine/modals';
import type { MenuItem } from '../../types';
import { ModifierPicker } from './ModifierPicker';

export function openModifierPicker(item: MenuItem) {
  const modalId = `mods-${item.id}`;
  modals.open({ modalId, title: `${item.icon} ${item.name}`, children: <ModifierPicker item={item} modalId={modalId} /> });
}
