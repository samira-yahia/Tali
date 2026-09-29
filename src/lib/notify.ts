import { notifications } from '@mantine/notifications';

export function toast(message: string, color: 'lime' | 'red' | 'yellow' = 'lime') {
  notifications.show({ message, color, autoClose: 2400 });
}
