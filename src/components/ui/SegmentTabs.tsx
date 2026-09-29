import { Box, Button, Group, SegmentedControl, type SegmentedControlProps } from '@mantine/core';
import { useIsPhone } from '../../hooks/useIsPhone';

export function SegmentTabs(props: SegmentedControlProps) {
  const isPhone = useIsPhone();

  if (!isPhone)
    return (
      <Box maw="100%" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
        <SegmentedControl {...props} />
      </Box>
    );

  const items = props.data.map((d) => (typeof d === 'string' ? { value: d, label: d } : d));
  return (
    <Group gap={6} w="100%" role="radiogroup">
      {items.map((item) => {
        const active = item.value === props.value;
        return (
          <Button
            key={item.value}
            size="compact-md"
            fz="sm"
            variant={active ? 'filled' : 'default'}
            role="radio"
            aria-checked={active}
            onClick={() => props.onChange?.(item.value)}
          >
            {item.label}
          </Button>
        );
      })}
    </Group>
  );
}
