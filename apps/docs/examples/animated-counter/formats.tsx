'use client';

import { useState, type ReactNode } from 'react';
import { AnimatedNumber, Button } from 'ui-kit';

const values = [1234.5, 99999.99, 7, 1250000, 0.256, 48210.75];

/** Currency, percent, compact and plain numbers all roll; separators and symbols stay put. */
export default function NumberFormats() {
  const [i, setI] = useState(0);
  const value = values[i % values.length];

  return (
    <div className="grid w-full gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Row label="Currency">
          <AnimatedNumber value={value} format={{ style: 'currency', currency: 'USD' }} />
        </Row>
        <Row label="Euro, German locale">
          <AnimatedNumber value={value} locale="de-DE" format={{ style: 'currency', currency: 'EUR' }} />
        </Row>
        <Row label="Compact">
          <AnimatedNumber value={value} format={{ notation: 'compact', maximumFractionDigits: 1 }} />
        </Row>
        <Row label="Percent">
          <AnimatedNumber value={(value % 1000) / 1000} format={{ style: 'percent', maximumFractionDigits: 1 }} />
        </Row>
        <Row label="With a suffix">
          <AnimatedNumber value={Math.round(value)} suffix=" users" format={{ useGrouping: true }} />
        </Row>
        <Row label="Signed">
          <AnimatedNumber value={value - 5000} format={{ signDisplay: 'always', maximumFractionDigits: 0 }} />
        </Row>
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={() => setI((n) => n + 1)}>
          Next value
        </Button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-medium">{children}</span>
    </div>
  );
}
