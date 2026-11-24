'use client';

import { useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Icon,
} from 'ui-kit';

export default function DropdownMenuAccount() {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('system');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Ada Lovelace
          <Icon name="chevron-down" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60">
        <DropdownMenuLabel>ada@atlas.example.com</DropdownMenuLabel>
        <DropdownMenuGroup aria-label="Account">
          <DropdownMenuItem icon={<Icon name="user" />} shortcut="⇧⌘P">
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="credit-card" />} shortcut="⌘B">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Icon name="settings" />} shortcut="⌘,">
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Icon name="users" />}>Invite teammates</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem icon={<Icon name="mail" />}>By email</DropdownMenuItem>
            <DropdownMenuItem icon={<Icon name="link" />}>Copy invite link</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<Icon name="plus" />}>More options…</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={notifications}
          onCheckedChange={setNotifications}
          onSelect={(e) => e.preventDefault()}
        >
          Email notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme} aria-label="Theme">
          <DropdownMenuRadioItem value="light" onSelect={(e) => e.preventDefault()}>
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" onSelect={(e) => e.preventDefault()}>
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" onSelect={(e) => e.preventDefault()}>
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Icon name="log-out" />} variant="destructive">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
