import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui-kit';

export default function AccordionFindInPage() {
  return (
    <Accordion type="multiple" variant="cards" className="w-full max-w-lg">
      <AccordionItem value="keys">
        <AccordionTrigger>Where do I find my API keys?</AccordionTrigger>
        <AccordionContent>Open Settings, then Developers. Keys start with sk_live_ and are shown once.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="webhooks">
        <AccordionTrigger>How do webhooks retry?</AccordionTrigger>
        <AccordionContent>Failed deliveries retry with exponential backoff for 24 hours. The secret rotates every 90 days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
