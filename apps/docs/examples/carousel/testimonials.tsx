import { Avatar, AvatarFallback, Card, CardContent, Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from 'ui-kit';

const quotes = [
  { name: 'Amina Rahman', role: 'Head of finance, Northwind', initials: 'AR', text: 'Month-end close went from five days to two. The audit trail alone paid for the licence.' },
  { name: 'Tomás Herrera', role: 'CTO, Brightlane', initials: 'TH', text: 'We migrated 40 services in a weekend. Rollbacks are one click, which is why we dared.' },
  { name: 'Priya Nair', role: 'Support lead, Fernhill', initials: 'PN', text: 'Our first-response time dropped 38% once the inbox stopped losing context between handoffs.' },
  { name: 'Lena Kowalski', role: 'Operations, Harbor & Co', initials: 'LK', text: 'The reports finally match what the warehouse sees. No more Friday spreadsheet archaeology.' },
  { name: 'Marcus Webb', role: 'Founder, Tidewater', initials: 'MW', text: 'Setup took an afternoon and I have not opened the docs since. That is the best review I can give.' },
];

export default function CarouselTestimonials() {
  return (
    <Carousel className="w-full max-w-3xl [--ui-carousel-per-view:1] sm:[--ui-carousel-per-view:2]" aria-label="Customer testimonials">
      <CarouselContent>
        {quotes.map((q) => (
          <CarouselItem key={q.name}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col justify-between gap-5">
                <p className="text-base">“{q.text}”</p>
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarFallback>{q.initials}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{q.name}</p>
                    <p className="text-muted-foreground">{q.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  );
}
