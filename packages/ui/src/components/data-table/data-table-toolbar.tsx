'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useDebouncedCallback } from '../../hooks/use-debounced-callback';
import { Icon } from '../../icons/icon';
import { Button } from '../button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '../dropdown-menu';
import { Input, InputAction, InputGroup, InputIcon } from '../input';

export interface DataTableSearchProps {
  /** Committed (debounced) query. */
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  label: string;
  debounce: number;
}

/** Search field: typing is instant, the query is committed after `debounce` ms. */
export function DataTableSearch({ value, onValueChange, placeholder, label, debounce }: DataTableSearchProps) {
  const [draft, setDraft] = useState(value);
  const [commit, cancel] = useDebouncedCallback(onValueChange, debounce);

  // A committed change from outside (a "clear filters" button, controlled state) replaces the draft
  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <InputGroup size="sm" className="ui-data-table-search">
      <InputIcon>
        <Icon name="search" />
      </InputIcon>
      <Input
        type="search"
        value={draft}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        onChange={(e) => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && draft !== '') {
            e.preventDefault();
            cancel();
            setDraft('');
            onValueChange('');
          }
        }}
      />
      <InputAction
        aria-label="Clear search"
        hidden={draft === ''}
        onClick={() => {
          cancel();
          setDraft('');
          onValueChange('');
        }}
      >
        <Icon name="x" />
      </InputAction>
    </InputGroup>
  );
}

export interface DataTableColumnsMenuProps {
  columns: Array<{ id: string; label: string; visible: boolean; disabled: boolean }>;
  onVisibleChange: (id: string, visible: boolean) => void;
}

/** "Columns" dropdown with one checkbox item per hideable column. */
export function DataTableColumnsMenu({ columns, onVisibleChange }: DataTableColumnsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon name="settings" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent placement="bottom-end">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.visible}
            disabled={column.disabled}
            onCheckedChange={(checked) => onVisibleChange(column.id, checked)}
            onSelect={(event) => event.preventDefault()}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface DataTableToolbarProps {
  children: ReactNode;
}

export function DataTableToolbar({ children }: DataTableToolbarProps) {
  return <div className="ui-data-table-toolbar">{children}</div>;
}
