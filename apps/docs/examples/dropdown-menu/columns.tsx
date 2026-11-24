'use client';

import { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from 'ui-kit';

const all = ['Customer', 'Status', 'Amount', 'Created'] as const;

export default function DropdownMenuColumns() {
  const [visible, setVisible] = useState<string[]>(['Customer', 'Status', 'Amount']);
  const toggle = (name: string, on: boolean) => setVisible((v) => (on ? [...v, name] : v.filter((n) => n !== name)));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Icon name="eye" />
          Columns
          <span className="text-muted-foreground tabular-nums">{visible.length}/4</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Show columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {all.map((name) => (
          <DropdownMenuCheckboxItem
            key={name}
            checked={visible.includes(name)}
            onCheckedChange={(on) => toggle(name, on)}
            onSelect={(e) => e.preventDefault()}
          >
            {name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
