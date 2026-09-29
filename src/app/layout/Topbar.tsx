import { ActionIcon, Avatar, Box, Button, Group, Indicator, Menu, Select, Text, Title } from '@mantine/core';
import { IconCalendar, IconClock, IconDotsVertical, IconWifi, IconWifiOff } from '@tabler/icons-react';
import { useState } from 'react';
import { BRANCHES } from '../../data/business';
import { openShiftModal } from '../../features/shifts/shiftModals';
import { useIsPhone } from '../../hooks/useIsPhone';
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
  const isPhone = useIsPhone();

  const today = () =>
    toast(new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));

  const onlineLabel = online ? 'Online' : 'Offline · orders queued';
  const shiftLabel = shift ? `${shift.user.split(' ')[0]} · shift open` : 'No shift · tap to open';

  return (
    <Box
      h="100%"
      px={{ base: 'sm', sm: 'lg' }}
      style={{ display: 'grid', gridTemplateColumns: isPhone ? 'auto minmax(0, 1fr) auto' : '1fr auto 1fr', gap: 12, alignItems: 'center' }}
    >
      <Group gap="sm" wrap="nowrap">
        <Text fz={{ base: 19, sm: 23 }} fw={700} c="lime">
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

      <Title order={3} fz={{ base: 16, sm: 22 }} ta="center" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title}
      </Title>

      <Group gap="xs" justify="flex-end" wrap="nowrap">
        <Button variant="default" size="xs" visibleFrom="md" leftSection={<Dot color={online ? 'lime.5' : 'red.6'} />} onClick={toggleConnection}>
          {onlineLabel}
        </Button>
        <Button variant="default" size="xs" visibleFrom="md" leftSection={<Dot color={shift ? 'lime.5' : 'yellow.5'} />} onClick={openShiftModal}>
          {shiftLabel}
        </Button>
        <Menu position="bottom-end" width={240} radius="lg">
          <Menu.Target>
            <Indicator color={online ? (shift ? 'lime.5' : 'yellow.5') : 'red.6'} size={10} offset={4} hiddenFrom="md">
              <ActionIcon size={38} radius="xl" variant="default" aria-label="Connection and shift">
                <IconDotsVertical size={18} />
              </ActionIcon>
            </Indicator>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={online ? <IconWifi size={18} /> : <IconWifiOff size={18} />} rightSection={<Dot color={online ? 'lime.5' : 'red.6'} />} onClick={toggleConnection}>
              {onlineLabel}
            </Menu.Item>
            <Menu.Item leftSection={<IconClock size={18} />} rightSection={<Dot color={shift ? 'lime.5' : 'yellow.5'} />} onClick={openShiftModal}>
              {shiftLabel}
            </Menu.Item>
            <Menu.Item leftSection={<IconCalendar size={18} />} onClick={today}>
              Today
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <ActionIcon size={38} radius="xl" variant="white" color="dark" onClick={today} aria-label="Today" visibleFrom="md">
          <IconCalendar size={18} />
        </ActionIcon>
        <Avatar radius="xl" variant="gradient" gradient={{ from: 'violet.5', to: 'lime.5', deg: 135 }} title="Mahmoud · Cashier" size={isPhone ? 34 : 38} />
      </Group>
    </Box>
  );
}
