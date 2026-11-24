import { ResizableHandle, ResizablePanel, ResizablePanelGroup, ScrollArea } from 'ui-kit';

const logs = [
  '[14:32:08] Build started for a3f9c21',
  '[14:32:11] Installing dependencies (214 packages)',
  '[14:32:29] Compiled client in 17.2 s',
  '[14:32:31] Compiled server in 1.9 s',
  '[14:32:33] Running 128 unit tests',
  '[14:32:41] All tests passed',
  '[14:32:44] Uploading build output (4.8 MB)',
  '[14:32:52] Deployed to production',
];

export default function ResizableVertical() {
  return (
    <ResizablePanelGroup direction="vertical" className="h-96 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card">
      <ResizablePanel defaultSize={65} minSize={30}>
        <div className="p-4 font-mono text-sm">
          <p className="text-muted-foreground">// billing/summary.tsx</p>
          <p>export function roundCents(amount: number) {'{'}</p>
          <p className="pl-4">return Math.round(amount * 100) / 100;</p>
          <p>{'}'}</p>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize terminal" />
      <ResizablePanel defaultSize={35} minSize={15} collapsible>
        <ScrollArea className="h-full" label="Build log" viewportClassName="p-4">
          <pre className="font-mono text-xs leading-5 text-muted-foreground">{logs.join('\n')}</pre>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
