import { Badge, Button, SimpleGrid, Stack, Text } from '@mantine/core';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { SUPPLIERS, TRANSFERS } from '../../data/business';
import { money } from '../../lib/format';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import type { PurchaseOrderStatus } from '../../types';
import { openSuggestedPurchases } from '../inventory/inventoryModals';

const STATUS_COLOR: Record<PurchaseOrderStatus, string> = { 'Awaiting approval': 'yellow.5', Sent: 'blue.5', Received: 'lime.5' };

export function PurchasingPage() {
  const { purchaseOrders, ingredients, setPurchaseOrderStatus } = useTali();

  const move = (no: string, status: PurchaseOrderStatus) => {
    setPurchaseOrderStatus(no, status);
    toast(`${no} · ${status}${status === 'Received' ? ' · stock updated' : ' · emailed to supplier'}`);
  };

  return (
    <Stack>
      <PageHeader title="Purchasing">
        <Spacer />
        <Button variant="white" color="dark" onClick={() => openSuggestedPurchases()}>New purchase order</Button>
      </PageHeader>

      <DataTable
        data={purchaseOrders}
        rowKey={(p) => p.no}
        columns={[
          { header: 'PO', cell: (p) => <b>{p.no}</b> },
          { header: 'Supplier', cell: (p) => p.supplier },
          {
            header: 'Lines',
            cell: (p) => (
              <Text fz="xs">
                {p.lines
                  .map((l) => {
                    const ing = ingredients.find((i) => i.id === l.ingredientId);
                    return `${ing?.name} ${l.qty} ${ing?.unit}`;
                  })
                  .join(' · ')}
              </Text>
            ),
          },
          { header: 'Total', cell: (p) => <b>{money(p.total)}</b> },
          { header: 'Status', cell: (p) => <Badge color={STATUS_COLOR[p.status]}>{p.status}</Badge> },
          {
            header: '',
            cell: (p) =>
              p.status === 'Awaiting approval' ? (
                <Button size="compact-sm" onClick={() => move(p.no, 'Sent')}>Approve & send</Button>
              ) : p.status === 'Sent' ? (
                <Button size="compact-sm" variant="white" color="dark" onClick={() => move(p.no, 'Received')}>Receive</Button>
              ) : null,
          },
        ]}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <InfoCard title="Suppliers" rows={SUPPLIERS.map((s) => ({ label: s.name, value: `${s.terms} · ${s.phone}` }))} />
        <InfoCard title="Transfers & approvals" rows={TRANSFERS.map((t) => ({ label: t.label, value: <Badge color={t.color}>{t.status}</Badge> }))} />
      </SimpleGrid>
    </Stack>
  );
}
