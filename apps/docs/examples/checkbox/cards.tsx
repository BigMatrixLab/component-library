import { Checkbox } from 'ui-kit';

const addons = [
  { id: 'support', label: 'Priority support', description: 'Replies within 2 hours, every day of the week.', price: '$29/mo' },
  { id: 'seats', label: 'Extra seats', description: 'Add 5 more teammates to your workspace.', price: '$40/mo' },
  { id: 'audit', label: 'Audit log', description: 'Keep a searchable history for 12 months.', price: '$15/mo' },
];

export default function CheckboxCards() {
  return (
    <div className="grid w-full max-w-md gap-3" role="group" aria-label="Add-ons">
      {addons.map((addon, i) => (
        <Checkbox
          key={addon.id}
          variant="card"
          name="addons"
          value={addon.id}
          defaultChecked={i === 0}
          label={
            <span className="flex items-baseline justify-between gap-4">
              {addon.label}
              <span className="font-normal tabular-nums text-muted-foreground">{addon.price}</span>
            </span>
          }
          description={addon.description}
        />
      ))}
    </div>
  );
}
