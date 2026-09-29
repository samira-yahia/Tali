import { ActionIcon, Avatar, Box, Button, Group, Select, Text, Title } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useState } from 'react';
import { BRANCHES } from '../../data/business';
import { openShiftModal } from '../../features/shifts/shiftModals';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';
import { toggleConnection } from '../connection';

const Dot = ({ color }: { color: string }) => (
  <Box w={8} h={8} bg={color} style={{ borderRadius: '50%' }} />
);

export function Topbar({ title }: { title: string }) {
  const online = useTali((s) => s.online);
  const shift = useTali((s) => s.shift);
  const [branch, setBranch] = useState(BRANCHES[0].id);

  const today = () =>
    toast(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));

  return (
    <Box h="100%" px="lg" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
      <Group gap="sm">
        <Text fz={23} fw={700} c="lime">
          TALI
        </Text>
        <Select
          size="xs"
          radius="xl"
          w={140}
          visibleFrom="sm"
          allowDeselect={false}
          value={branch}
          aria-label="Branch"
          data={BRANCHES.map((b) => ({ value: b.id, label: b.name }))}
          onChange={(v) => {
            if (!v) return;
            setBranch(v);
            toast(`Switched to ${BRANCHES.find((b) => b.id === v)?.name} branch`);
          }}
        />
      </Group>

      <Title order={3} ta="center">
        {title}
      </Title>

      <Group gap="xs" justify="flex-end">
        <Button variant="default" size="xs" visibleFrom="md" leftSection={<Dot color={online ? 'lime.5' : 'red.6'} />} onClick={toggleConnection}>
          {online ? 'Online' : 'Offline · orders queued'}
        </Button>
        <Button variant="default" size="xs" visibleFrom="md" leftSection={<Dot color={shift ? 'lime.5' : 'yellow.5'} />} onClick={openShiftModal}>
          {shift ? `${shift.user.split(' ')[0]} · shift open` : 'No shift · tap to open'}
        </Button>
        <ActionIcon size={38} radius="xl" variant="white" color="dark" onClick={today} aria-label="Today">
          <IconCalendar size={18} />
        </ActionIcon>
        <Avatar radius="xl" variant="gradient" gradient={{ from: 'violet.5', to: 'lime.5', deg: 135 }} title="Mahmoud · Cashier" />
      </Group>
    </Box>
  );
}
