'use client';

import { Button, toast } from 'ui-kit';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function exportReport(fail: boolean) {
  await wait(2000);
  if (fail) throw new Error('The export service timed out.');
  return { name: 'Q3 revenue report', rows: 12480 };
}

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(exportReport(false), {
            loading: 'Exporting report…',
            success: (report) => ({ title: `${report.name} exported`, description: `${report.rows.toLocaleString()} rows saved to CSV.` }),
            error: 'Export failed',
          })
        }
      >
        Export (succeeds)
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(exportReport(true), {
            loading: 'Exporting report…',
            success: 'Report exported',
            error: (err) => ({ title: 'Export failed', description: (err as Error).message }),
          })
        }
      >
        Export (fails)
      </Button>
    </div>
  );
}
