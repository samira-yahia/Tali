import { Card, Text } from '@mantine/core';

const TONES = {
  lime: { bg: 'lime.5', c: 'dark.9' },
  white: { bg: 'white', c: 'dark.9' },
  violet: { bg: 'violet.5', c: 'white' },
  plain: { bg: 'dark.6', c: undefined },
} as const;

interface Props {
  label: string;
  value: string | number;
  hint: string;
  tone?: keyof typeof TONES;
}

export function KpiCard({ label, value, hint, tone = 'plain' }: Props) {
  return (
    <Card {...TONES[tone]} mih={124} style={{ justifyContent: 'space-between' }}>
      <Text fw={600}>{label}</Text>
      <div>
        <Text fz={28} fw={600} lh={1}>
          {value}
        </Text>
        <Text fz="xs" mt={6} opacity={0.75}>
          {hint}
        </Text>
      </div>
    </Card>
  );
}
