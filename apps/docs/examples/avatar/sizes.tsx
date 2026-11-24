import { Avatar, AvatarFallback, AvatarImage } from 'ui-kit';

/** A placeholder portrait: an abstract gradient, so the example needs no network. */
const portrait = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 70% 62%)"/><stop offset="1" stop-color="hsl(${hue + 50} 65% 40%)"/></linearGradient></defs><rect width="80" height="80" fill="url(#g)"/><circle cx="40" cy="32" r="14" fill="white" fill-opacity=".85"/><path d="M12 80c2-18 14-26 28-26s26 8 28 26z" fill="white" fill-opacity=".85"/></svg>`,
  )}`;

export default function AvatarSizes() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-4">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size, i) => (
          <Avatar key={size} size={size}>
            <AvatarImage src={portrait(200 + i * 40)} alt="Amina Rahman" />
            <AvatarFallback>AR</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Avatar key={size} size={size} shape="rounded">
            <AvatarFallback>NV</AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
