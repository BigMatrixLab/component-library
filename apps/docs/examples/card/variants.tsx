import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui-kit';

export default function CardVariants() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>A 1px border and no shadow.</CardDescription>
        </CardHeader>
      </Card>
      <Card variant="muted">
        <CardHeader>
          <CardTitle>Muted</CardTitle>
          <CardDescription>A quiet well for secondary content.</CardDescription>
        </CardHeader>
      </Card>
      {/* Concentric: the inner radius is the outer radius minus the 8px gap */}
      <Card className="gap-0 p-2 sm:col-span-2">
        <Card variant="inset">
          <CardHeader>
            <CardTitle>Inset</CardTitle>
            <CardDescription>Nested in a card with an 8px gap; its corners follow the outer ones.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Inner radius = outer radius − gap.</CardContent>
        </Card>
      </Card>
    </div>
  );
}
