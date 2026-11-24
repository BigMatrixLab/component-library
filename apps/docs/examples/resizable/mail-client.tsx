import { Avatar, AvatarFallback, Badge, Icon, Item, ItemContent, ItemDescription, ItemMedia, ItemMeta, ItemTitle, ResizableHandle, ResizablePanel, ResizablePanelGroup, ScrollArea } from 'ui-kit';

const folders = [
  { name: 'Inbox', icon: 'inbox', count: 12 },
  { name: 'Starred', icon: 'star', count: 0 },
  { name: 'Sent', icon: 'mail', count: 0 },
  { name: 'Trash', icon: 'trash', count: 0 },
] as const;

const messages = [
  { from: 'Amina Rahman', initials: 'AR', subject: 'Q4 budget review', preview: 'Attached the revised figures. Can we go through marketing spend on Thursday?', time: '9:41 am', unread: true },
  { from: 'Tomás Herrera', initials: 'TH', subject: 'Deploy window tonight', preview: 'We are clear to ship at 22:00 UTC if QA signs off on the billing fix.', time: '8:15 am', unread: true },
  { from: 'Priya Nair', initials: 'PN', subject: 'Customer escalation: Fernhill', preview: 'They need an answer on the export bug before their board meeting on Friday.', time: 'Yesterday', unread: false },
  { from: 'Lena Kowalski', initials: 'LK', subject: 'Warehouse count mismatch', preview: 'Stock on hand differs by 14 units from the system. Recount scheduled for tomorrow.', time: 'Yesterday', unread: false },
  { from: 'Marcus Webb', initials: 'MW', subject: 'Partnership intro', preview: 'Great meeting you last week. Looping in our head of partnerships to continue the chat.', time: 'Mon', unread: false },
  { from: 'Design team', initials: 'DT', subject: 'New icon set ready', preview: 'The 1.75px stroke set is merged. Please review the empty states before release.', time: 'Mon', unread: false },
];

export default function ResizableMailClient() {
  return (
    <ResizablePanelGroup id="docs-mail-client" className="h-[30rem] w-full overflow-hidden rounded-xl border border-border bg-card">
      <ResizablePanel defaultSize={20} minSize={14} maxSize={30} collapsible className="hidden sm:block">
        <nav aria-label="Mail folders" className="flex h-full flex-col gap-1 p-2">
          {folders.map((f) => (
            <a
              key={f.name}
              href="#"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
              aria-current={f.name === 'Inbox' ? 'page' : undefined}
            >
              <Icon name={f.icon} />
              <span className="flex-1 truncate">{f.name}</span>
              {f.count > 0 && <span className="text-xs tabular-nums text-muted-foreground">{f.count}</span>}
            </a>
          ))}
        </nav>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize folders" className="hidden sm:flex" />
      <ResizablePanel defaultSize={36} minSize={25}>
        <ScrollArea className="h-full" label="Messages" viewportClassName="p-2">
          {messages.map((m) => (
            <Item key={m.subject} size="sm" asChild>
              <a href="#">
                <ItemMedia>
                  <Avatar size="sm">
                    <AvatarFallback>{m.initials}</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className={m.unread ? 'font-semibold' : undefined}>{m.subject}</ItemTitle>
                  <ItemDescription>{m.preview}</ItemDescription>
                </ItemContent>
                <ItemMeta>{m.time}</ItemMeta>
              </a>
            </Item>
          ))}
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle aria-label="Resize message list" />
      <ResizablePanel defaultSize={44} minSize={25}>
        <ScrollArea className="h-full" label="Message" viewportClassName="p-5">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-md font-semibold tracking-tight">Q4 budget review</h3>
              <p className="text-sm text-muted-foreground">Amina Rahman to you, 9:41 am</p>
            </div>
            <Badge variant="info" size="sm">
              Finance
            </Badge>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <p>Hi team,</p>
            <p>I attached the revised Q4 figures. Marketing spend is 8% over plan, mostly from the autumn campaign, and travel is 12% under.</p>
            <p>Can we go through the numbers on Thursday at 10:00? I would like to lock the budget before the board pack goes out on Friday.</p>
            <p>Thanks,<br />Amina</p>
          </div>
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
