import { Avatar, AvatarFallback } from 'ui-kit';

const PEOPLE = [
  { name: 'Amina Rahman', initials: 'AR', status: 'online' },
  { name: 'Jonas Weber', initials: 'JW', status: 'away' },
  { name: 'Mei Tanaka', initials: 'MT', status: 'busy' },
  { name: 'Carlos Díaz', initials: 'CD', status: 'offline' },
] as const;

export default function AvatarStatus() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-6">
      {PEOPLE.map((p) => (
        <li key={p.name} className="flex items-center gap-3">
          <Avatar status={p.status}>
            <AvatarFallback>{p.initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm leading-tight">
            <div className="font-medium">{p.name}</div>
            <div className="text-muted-foreground capitalize">{p.status}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
