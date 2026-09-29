import type { OrderStatus } from '../../types';

export const STATUS_COLOR: Record<OrderStatus, string> = {
  New: 'yellow.5',
  'In progress': 'violet.5',
  'Ready to serve': 'lime.5',
  Completed: 'gray.1',
  Cancelled: 'red.6',
};

/** CSS variable for a `color.shade` theme key, e.g. `lime.5` → `var(--mantine-color-lime-5)`. */
export const colorVar = (key: string) => `var(--mantine-color-${key.replace('.', '-')})`;
