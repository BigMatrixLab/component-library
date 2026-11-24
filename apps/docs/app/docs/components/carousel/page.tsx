import type { Metadata } from 'next';
import { Code, DocPage, KeyTable, List, P, PropsTable, Section } from '@/components/docs/doc';
import { Example } from '@/components/docs/example';
import CarouselProductImages from '@/examples/carousel/product-images';
import CarouselTestimonials from '@/examples/carousel/testimonials';
import CarouselAutoplay from '@/examples/carousel/autoplay';

export const metadata: Metadata = { title: 'Carousel' };

export default function CarouselPage() {
  return (
    <DocPage href="/docs/components/carousel">
      <Section id="product-images" title="Product images">
        <P>A native scroll-snap track: swipe, trackpad and mouse wheel work the way the platform does, with no drag library. The buttons and dots drive the same scroll position.</P>
        <Example component="carousel" file="carousel/product-images" title="Product images" minHeight={360}>
          <CarouselProductImages />
        </Example>
      </Section>

      <Section id="when" title="When to use">
        <List
          items={[
            'A set of related images or cards where only a few fit at once.',
            'Content that is optional: anything important should also be reachable without the carousel.',
          ]}
        />
        <P>Not for steps in a flow (use a stepper), for tabbed content, or for a single hero that must be seen.</P>
      </Section>

      <Section id="several" title="Several slides per view">
        <P>
          Set <Code>--ui-carousel-per-view</Code> on the root, responsively if you like (<Code>sm:[--ui-carousel-per-view:2]</Code>). Slide width accounts for <Code>--ui-carousel-gap</Code>. Dots count the positions the track can actually rest on.
        </P>
        <Example component="carousel" file="carousel/testimonials" title="Testimonials" align="stretch" minHeight={300}>
          <CarouselTestimonials />
        </Example>
      </Section>

      <Section id="autoplay" title="Autoplay and loop">
        <P>
          <Code>autoplay</Code> advances on a timer. It pauses while the pointer is over the carousel, focus is inside it or the tab is hidden, and never runs under reduced motion. <Code>loop</Code> makes Next on the last position rewind to the first and keeps both buttons enabled.
        </P>
        <Example component="carousel" file="carousel/autoplay" title="Autoplay and loop" minHeight={300}>
          <CarouselAutoplay />
        </Example>
      </Section>

      <Section id="api" title="API">
        <PropsTable
          title="Carousel"
          rows={[
            { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Scroll direction. Vertical needs a height.' },
            { name: 'loop', type: 'boolean', default: 'false', description: 'Rewind from the last position to the first (and back).' },
            { name: 'autoplay', type: 'boolean | number', default: 'false', description: 'true advances every 5 s; a number is the interval in ms.' },
            { name: 'onIndexChange', type: '(index: number) => void', description: 'Called when the first visible position changes, however it changed.' },
            { name: 'aria-label', type: 'string', description: 'Name of the carousel, e.g. “Product photos”.' },
          ]}
        />
        <PropsTable
          title="CarouselContent / CarouselItem"
          rows={[
            { name: 'viewportClassName', type: 'string', description: 'CarouselContent: class for the scrolling viewport (className styles the track).' },
            { name: 'basis', type: 'string', description: 'CarouselItem: width (height when vertical) as a CSS length. Or use className, e.g. basis-2/3.' },
          ]}
        />
        <P>
          <Code>CarouselPrevious</Code> and <Code>CarouselNext</Code> take <Code>Button</Code> props (<Code>variant</Code>, <Code>size</Code>) and sit inside <Code>Carousel</Code> beside the content. <Code>CarouselDots</Code> renders nothing when everything fits.
        </P>
      </Section>

      <Section id="keyboard" title="Keyboard">
        <KeyTable
          rows={[
            ['← / →', 'Previous / next slide while focus is anywhere inside the carousel (↑ / ↓ when vertical).'],
            ['Tab', 'Moves between the track, the buttons and the dots.'],
            ['Enter / Space', 'Activates a button or dot.'],
          ]}
        />
      </Section>

      <Section id="accessibility" title="Accessibility">
        <List
          items={[
            'Follows the WAI-ARIA carousel pattern: role="region" with aria-roledescription="carousel"; each slide is role="group" with aria-roledescription="slide" and a label “n of m”.',
            'At the ends the buttons are aria-disabled (not removed from the tab order, so focus is not lost).',
            'Dots are buttons labelled “Go to slide n”, the current one marked aria-current.',
            'Autoplay pauses on hover, focus and in hidden tabs, and is off under reduced motion.',
            'The track is a focusable scrollable region, so keyboard users can always scroll it.',
          ]}
        />
      </Section>

      <Section id="motion" title="Motion">
        <List
          items={[
            'Previous, next and dots scroll smoothly to the slide; snapping is the browser’s.',
            'The active dot stretches into a pill on the snappy spring.',
            'Reduced motion: jumps instead of gliding; autoplay is disabled.',
          ]}
        />
      </Section>
    </DocPage>
  );
}
