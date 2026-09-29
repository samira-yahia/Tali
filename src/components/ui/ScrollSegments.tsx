import { Box, SegmentedControl, type SegmentedControlProps } from '@mantine/core';

/**
 * SegmentedControl that scrolls sideways instead of widening the page on small screens.
 * The scroll container must wrap the control: its indicator is positioned from bounding rects.
 */
export function ScrollSegments(props: SegmentedControlProps) {
  return (
    <Box maw="100%" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
      <SegmentedControl {...props} />
    </Box>
  );
}
