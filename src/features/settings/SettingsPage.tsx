import { Badge, Button, Card, Group, SimpleGrid, Stack, Switch, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { toggleConnection } from '../../app/connection';
import { DataTable } from '../../components/ui/DataTable';
import { InfoCard } from '../../components/ui/InfoRows';
import { PageHeader } from '../../components/ui/PageHeader';
import { SegmentTabs } from '../../components/ui/SegmentTabs';
import { BRANCHES, DEVICES, ROLE_PERMISSIONS, USERS } from '../../data/business';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

const TABS = {
  branches: 'Branches',
  users: 'Users & roles',
  tax: 'Tax & receipts',
  integrations: 'Integrations',
  devices: 'Devices',
} as const;
type Tab = keyof typeof TABS;

const saved = () => toast('Setting saved');

function BranchesTab() {
  return (
    <Stack>
      <DataTable
        data={BRANCHES}
        rowKey={(b) => b.id}
        columns={[
          { header: 'Branch', cell: (b) => <b>{b.name}</b> },
          { header: 'City', cell: (b) => b.city },
          { header: 'Devices', cell: () => '2 POS · 1 KDS · 1 printer' },
          { header: 'Menu', cell: () => 'Shared + local specials' },
          { header: 'Status', cell: (b) => <Badge color={b.online ? 'lime.5' : 'red.6'}>{b.online ? 'Online' : 'Offline · syncing'}</Badge> },
        ]}
      />
      <InfoCard
        title="Brands at this location"
        action={<Badge>Multi-brand included</Badge>}
        rows={[
          { label: 'Tali Kitchen (dine-in & takeaway)', value: 'Primary brand' },
          { label: 'Koshary Express (virtual brand · Talabat, elmenus)', value: 'Shares inventory & KDS' },
          { label: <Button size="xs" variant="white" color="dark" onClick={() => toast('Brand added · menu cloned for editing')}>Add virtual brand</Button> },
        ]}
      />
    </Stack>
  );
}

function UsersTab() {
  return (
    <Stack>
      <DataTable
        data={USERS}
        rowKey={(u) => u.name}
        columns={[
          { header: 'User', cell: (u) => <b>{u.name}</b> },
          { header: 'Role', cell: (u) => u.role },
          { header: 'Permissions', cell: (u) => <Text fz="xs">{ROLE_PERMISSIONS[u.role].join(' · ')}</Text> },
          { header: 'Branch', cell: (u) => u.branch },
          { header: 'PIN', cell: () => '••••' },
        ]}
      />
      <Group>
        <Button variant="white" color="dark" onClick={() => toast('Invite sent by WhatsApp')}>Invite user</Button>
        <Button variant="default" onClick={() => toast('Audit log: 148 events today · every void, discount and price change is recorded')}>
          View audit log
        </Button>
      </Group>
    </Stack>
  );
}

function TaxTab() {
  return (
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <InfoCard
        title="Taxes & charges"
        rows={[
          { label: 'VAT', value: '14% · added at checkout' },
          { label: 'Service charge (dine-in)', value: '12%' },
          { label: 'Tax registration', value: '100-234-567' },
        ]}
      />
      <InfoCard
        title="Receipts & compliance"
        rows={[
          { label: 'ETA e-receipt submission', value: <Badge>Connected</Badge> },
          { label: 'Bilingual receipts (AR/EN)', value: <Switch defaultChecked onChange={saved} /> },
          { label: 'Digital receipt by WhatsApp', value: <Switch defaultChecked onChange={saved} /> },
          { label: 'Receipt footer', value: 'Thank you · شكراً' },
        ]}
      />
    </SimpleGrid>
  );
}

function IntegrationsTab() {
  const { integrations, toggleIntegration } = useTali();
  return (
    <Stack>
      <DataTable
        data={integrations.map((x, index) => ({ x, index }))}
        rowKey={(r) => r.x.name}
        columns={[
          { header: 'App', cell: ({ x }) => <b>{x.name}</b> },
          { header: 'Category', cell: ({ x }) => x.category },
          { header: 'Status', cell: ({ x }) => <Badge color={x.on ? 'lime.5' : 'dark.4'}>{x.on ? 'Connected' : 'Not connected'}</Badge> },
          {
            header: 'On',
            cell: ({ x, index }) => (
              <Switch
                checked={x.on}
                aria-label={`Toggle ${x.name}`}
                onChange={() => {
                  toggleIntegration(index);
                  toast(`${x.name} ${x.on ? 'disconnected' : 'connected'}`);
                }}
              />
            ),
          },
        ]}
      />
      <Group>
        <Button variant="white" color="dark" onClick={() => toast('Marketplace: 100+ apps · opening catalogue')}>Browse marketplace</Button>
        <Button variant="default" onClick={() => toast('API key created · copy it from the developer console')}>Create API key</Button>
        <Button variant="default" onClick={() => toast('Webhook added: order.paid → https://…')}>Add webhook</Button>
      </Group>
    </Stack>
  );
}

function DevicesTab() {
  const { online, orders, resetDemo } = useTali();
  const queued = orders.filter((o) => o.offline).length;

  const confirmReset = () =>
    modals.openConfirmModal({
      title: 'Reset demo data?',
      children: <Text fz="sm">Orders, stock, customers and settings go back to the starting data.</Text>,
      labels: { confirm: 'Reset', cancel: 'Keep my data' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        resetDemo();
        toast('Demo data reset');
      },
    });

  return (
    <Stack>
      <DataTable
        data={DEVICES}
        rowKey={(d) => d.name}
        columns={[
          { header: 'Device', cell: (d) => <b>{d.name}</b> },
          { header: 'Type', cell: (d) => d.type },
          { header: 'Last sync', cell: (d) => d.lastSync },
          { header: 'Version', cell: (d) => d.version },
          { header: 'Status', cell: (d) => <Badge color={d.online ? 'lime.5' : 'red.6'}>{d.online ? 'Online' : 'Offline'}</Badge> },
        ]}
      />
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <InfoCard
          title="Offline mode"
          rows={[
            { label: 'Local order queue', value: online ? 'Empty · synced' : `${queued} orders waiting to sync` },
            { label: 'Offline card cap per order', value: 'EGP 2,000' },
            { label: 'Simulate connection loss', value: <Switch checked={!online} onChange={toggleConnection} /> },
          ]}
        />
        <Card>
          <Title order={5} mb="xs">Demo data</Title>
          <Text fz="sm" c="dimmed" mb="md">
            Data is saved in this browser, so it survives a refresh.
          </Text>
          <Button variant="default" color="red" onClick={confirmReset}>Reset demo data</Button>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

const PANELS: Record<Tab, () => React.JSX.Element> = {
  branches: BranchesTab,
  users: UsersTab,
  tax: TaxTab,
  integrations: IntegrationsTab,
  devices: DevicesTab,
};

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('branches');
  const Panel = PANELS[tab];
  return (
    <Stack>
      <PageHeader title="Settings">
        <SegmentTabs value={tab} onChange={(v) => setTab(v as Tab)} data={Object.entries(TABS).map(([value, label]) => ({ value, label }))} />
      </PageHeader>
      <Panel />
    </Stack>
  );
}
