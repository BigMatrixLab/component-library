import {
  Button,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  type SheetSide,
} from 'ui-kit';

const sides: SheetSide[] = ['right', 'left', 'top', 'bottom'];

export default function SheetSides() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {sides.map((side) => (
        <Sheet key={side}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle className="capitalize">{side} sheet</SheetTitle>
              <SheetDescription>It slides in from the {side} edge and keeps the page in view.</SheetDescription>
            </SheetHeader>
            <SheetBody>
              <p className="text-muted-foreground">Use it for secondary tasks: filters, details, settings.</p>
            </SheetBody>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
