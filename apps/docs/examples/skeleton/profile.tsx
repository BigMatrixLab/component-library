'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, Badge, Button, Card, CardContent, CardFooter, Skeleton } from 'ui-kit';

export default function SkeletonProfile() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <Card className="w-full" aria-busy={loading}>
        {loading && (
          <span role="status" className="sr-only">
            Loading profile
          </span>
        )}
        <CardContent className="flex items-center gap-4">
          {loading ? (
            <>
              <Skeleton shape="circle" width={48} />
              <div className="flex-1 space-y-2">
                <Skeleton width="45%" />
                <Skeleton width="70%" height={12} />
              </div>
            </>
          ) : (
            <>
              <Avatar size="lg">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">Amina Rahman</div>
                <div className="text-sm text-muted-foreground">Product designer · Lisbon</div>
              </div>
              <Badge variant="success" dot>Online</Badge>
            </>
          )}
        </CardContent>
        <CardContent className="space-y-2">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton width="92%" />
              <Skeleton width="64%" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Leads the Atlas design system. Previously at Northwind, where she shipped the checkout redesign.
            </p>
          )}
        </CardContent>
        <CardFooter>
          {loading ? <Skeleton width={96} height={32} className="rounded-md" /> : <Button size="sm">Message</Button>}
        </CardFooter>
      </Card>
      <Button variant="ghost" size="sm" onClick={() => setLoading((l) => !l)}>
        {loading ? 'Show loaded content' : 'Show loading state'}
      </Button>
    </div>
  );
}
