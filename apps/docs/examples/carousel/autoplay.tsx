import { Badge, Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from 'ui-kit';

const announcements = [
  { tag: 'New', title: 'Scheduled reports', body: 'Send any dashboard to your team every Monday at 8 am.' },
  { tag: 'Improved', title: 'Faster search', body: 'Results now appear as you type, across every workspace you belong to.' },
  { tag: 'Security', title: 'Passkeys', body: 'Sign in with Face ID, Touch ID or a security key instead of a password.' },
];

export default function CarouselAutoplay() {
  return (
    <Carousel className="w-full max-w-md" aria-label="What’s new" loop autoplay={4000}>
      <CarouselContent>
        {announcements.map((a) => (
          <CarouselItem key={a.title}>
            <div className="flex h-40 flex-col justify-between rounded-lg border border-border bg-card p-5">
              <div className="space-y-1.5">
                <Badge variant="secondary" size="sm">
                  {a.tag}
                </Badge>
                <h3 className="text-md font-semibold tracking-tight">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}
