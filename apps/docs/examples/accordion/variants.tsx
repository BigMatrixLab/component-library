import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, type AccordionVariant } from 'ui-kit';

const variants: AccordionVariant[] = ['default', 'cards', 'flush'];

export default function AccordionVariants() {
  return (
    <div className="grid w-full max-w-lg gap-8">
      {variants.map((variant) => (
        <div key={variant}>
          <p className="mb-2 text-sm font-medium capitalize text-muted-foreground">{variant}</p>
          <Accordion type="multiple" variant={variant} defaultValue={['shipping']}>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>Orders over $50 ship free and arrive in 3 to 5 business days.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns</AccordionTrigger>
              <AccordionContent>Send anything back within 30 days, unused and in its box.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="warranty" disabled>
              <AccordionTrigger>Warranty (coming soon)</AccordionTrigger>
              <AccordionContent>Two years on every device.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
