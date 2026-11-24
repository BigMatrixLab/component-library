'use client';

import { useEffect, useState } from 'react';
import { AnimatedNumber, Badge, Button, Icon } from 'ui-kit';

const orders = [49, 129.5, 24, 349, 79.99, 199, 18.75, 640];

/** A live revenue ticker: a new order lands every couple of seconds and the digits roll. */
export default function LiveRevenue() {
  const [revenue, setRevenue] = useState(128430.5);
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      setRevenue((r) => Math.round((r + orders[(Math.floor(r) + 3) % orders.length]) * 100) / 100);
    }, 2200);
    return () => clearInterval(timer);
  }, [live]);

  return (
    <div className="grid justify-items-start gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        Revenue today
        <Badge variant={live ? 'success' : 'secondary'} live={live} dot={!live}>
          {live ? 'Live' : 'Paused'}
        </Badge>
      </div>
      <AnimatedNumber
        value={revenue}
        format={{ style: 'currency', currency: 'USD' }}
        className="text-4xl font-medium tracking-tight"
      />
      <p className="text-sm text-muted-foreground">{tick === 0 ? 'Waiting for the next order…' : `${tick} new ${tick === 1 ? 'order' : 'orders'} since you opened this page`}</p>
      <Button size="sm" variant="outline" onClick={() => setLive((v) => !v)}>
        <Icon name={live ? 'loader' : 'refresh-cw'} />
        {live ? 'Pause' : 'Resume'}
      </Button>
    </div>
  );
}
