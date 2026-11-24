'use client';

import { useState } from 'react';
import { Button, ExpandingSearch, Icon } from 'ui-kit';

const pages = ['Button', 'Dialog', 'Dropdown menu', 'Date picker', 'Data table', 'Input', 'Tabs', 'Toast', 'Tooltip'];

export default function ExpandingSearchDocsSearch() {
  const [query, setQuery] = useState('');
  const matches = pages.filter((p) => p.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex min-h-64 w-full max-w-md items-start justify-between gap-4">
      <span className="pt-2 text-sm font-medium">Components</span>
      <ExpandingSearch
        shortcut
        placeholder="Search components"
        label="Search components"
        width={260}
        value={query}
        onValueChange={setQuery}
        results={
          <ul className="flex flex-col" aria-label="Results">
            {matches.length ? (
              matches.map((name) => (
                <li key={name}>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setQuery('')}>
                    <Icon name="file" />
                    {name}
                  </Button>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-muted-foreground">No components match “{query}”.</li>
            )}
          </ul>
        }
      />
    </div>
  );
}
