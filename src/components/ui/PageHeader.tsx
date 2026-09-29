import { Group, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Group gap="sm" wrap="wrap">
      <Title order={3} mr="xs">
        {title}
      </Title>
      {children}
    </Group>
  );
}

/** Pushes the following header items to the right. */
export const Spacer = () => <div style={{ flex: 1 }} />;
