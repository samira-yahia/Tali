import { Card, Table, Text } from '@mantine/core';
import type { ReactNode } from 'react';

export interface Column<T> {
  header: ReactNode;
  cell: (row: T) => ReactNode;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  empty?: string;
  minWidth?: number;
}

export function DataTable<T>({ columns, data, rowKey, empty = 'No rows.', minWidth = 720 }: Props<T>) {
  return (
    <Card p={0}>
      <Table.ScrollContainer minWidth={minWidth}>
        <Table verticalSpacing="sm" horizontalSpacing="lg" highlightOnHover fz="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((c, i) => (
                <Table.Th key={i}>{c.header}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, i) => (
              <Table.Tr key={rowKey(row, i)}>
                {columns.map((c, j) => (
                  <Table.Td key={j}>{c.cell(row)}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {!data.length && (
        <Text p="lg" c="dimmed" fz="sm">
          {empty}
        </Text>
      )}
    </Card>
  );
}
