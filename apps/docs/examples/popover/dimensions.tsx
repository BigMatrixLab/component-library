import { Button, Icon, Popover, PopoverClose, PopoverContent, PopoverTrigger } from 'ui-kit';

const field =
  'h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring';

const rows = [
  ['Width', '100%'],
  ['Max. width', '640px'],
  ['Height', '48px'],
] as const;

export default function PopoverDimensions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Icon name="settings" />
          Dimensions
        </Button>
      </PopoverTrigger>
      <PopoverContent placement="bottom-start" className="w-72">
        <div className="grid gap-3">
          <p className="font-medium">Layer size</p>
          {rows.map(([label, value]) => (
            <label key={label} className="grid grid-cols-[6rem_1fr] items-center gap-2 text-base">
              {label}
              <input className={field} defaultValue={value} />
            </label>
          ))}
          <PopoverClose asChild>
            <Button size="sm" className="justify-self-end">
              Apply
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
