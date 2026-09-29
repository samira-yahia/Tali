import { Box, Card, Group, Stack, Title } from '@mantine/core';
import type { ReactNode } from 'react';

export interface InfoRow {
  label: ReactNode;
  value?: ReactNode;
}

export function InfoRows({ rows, empty = 'Nothing here yet.' }: { rows: InfoRow[]; empty?: string }) {
  if (!rows.length) return <Box fz="sm" c="dimmed">{empty}</Box>;
  return (
    <Stack gap={0}>
      {rows.map((r, i) => (
        <Group
          key={i}
          justify="space-between"
          wrap="nowrap"
          py={9}
          fz="sm"
          style={{ borderTop: i ? '1px solid var(--mantine-color-dark-4)' : undefined }}
        >
          <Box>{r.label}</Box>
          <Box c="dimmed" ta="right">
            {r.value}
          </Box>
        </Group>
      ))}
    </Stack>
  );
}

export function InfoCard({ title, action, rows, empty }: { title: ReactNode; action?: ReactNode; rows: InfoRow[]; empty?: string }) {
  return (
    <Card>
      <Group justify="space-between" mb="xs">
        <Title order={5}>{title}</Title>
        {action}
      </Group>
      <InfoRows rows={rows} empty={empty} />
    </Card>
  );
}
