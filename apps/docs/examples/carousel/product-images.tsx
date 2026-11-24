import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, Icon } from 'ui-kit';

const photos = [
  { label: 'Front view', series: 1 },
  { label: 'Side profile', series: 2 },
  { label: 'Sole detail', series: 3 },
  { label: 'On foot', series: 4 },
  { label: 'Box and extras', series: 5 },
];

export default function CarouselProductImages() {
  return (
    <Carousel className="w-full max-w-md" aria-label="Trail runner photos">
      <CarouselContent>
        {photos.map((photo) => (
          <CarouselItem key={photo.label}>
            <div
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-border text-muted-foreground"
              style={{ background: `color-mix(in oklch, var(--ui-series-${photo.series}) 16%, var(--ui-surface))` }}
            >
              <Icon name="image" size={32} />
              <span className="text-sm font-medium text-foreground">{photo.label}</span>
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
