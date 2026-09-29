import { Button, Stack } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { PageHeader, Spacer } from '../../components/ui/PageHeader';
import { ScrollSegments } from '../../components/ui/ScrollSegments';
import { buildReport, REPORT_TABS, toCsv, type ReportRows, type ReportTab } from '../../domain/reports';
import { toast } from '../../lib/notify';
import { useTali } from '../../store/useTali';

export function ReportsPage() {
  const { orders, menu, ingredients, shift } = useTali();
  const [tab, setTab] = useState<ReportTab>('sales');
  const [head, ...body] = buildReport(tab, { orders, menu, ingredients, shift });

  const exportCsv = () => {
    const url = URL.createObjectURL(new Blob([toCsv([head, ...body])], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `tali-${tab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV downloaded');
  };

  return (
    <Stack>
      <PageHeader title="Reports">
        <ScrollSegments
          value={tab}
          onChange={(v) => setTab(v as ReportTab)}
          data={Object.entries(REPORT_TABS).map(([value, label]) => ({ value, label }))}
        />
        <Spacer />
        <Button variant="white" color="dark" leftSection={<IconDownload size={16} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </PageHeader>
      <DataTable<ReportRows[number]>
        data={body}
        rowKey={(_, i) => i}
        empty="No data yet."
        columns={head.map((h, j) => ({ header: h, cell: (row) => (j === 0 ? <b>{row[0]}</b> : row[j]) }))}
      />
    </Stack>
  );
}
