import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from 'ui-kit';

const faq = [
  ['Can I change plans later?', 'Yes. Upgrades apply immediately and downgrades start at the next billing date. We prorate the difference.'],
  ['How does the 14-day trial work?', 'You get every Pro feature for 14 days with no card. We email you three days before it ends.'],
  ['Do you offer refunds?', 'Annual plans can be refunded in full within 30 days. Monthly plans are not refunded after the period has started.'],
  ['Where is my data stored?', 'In the EU (Frankfurt) by default. You can pick the US (Virginia) when you create a workspace.'],
];

export default function AccordionFaq() {
  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="w-full max-w-lg">
      {faq.map(([question, answer], i) => (
        <AccordionItem key={question} value={`item-${i}`}>
          <AccordionTrigger>{question}</AccordionTrigger>
          <AccordionContent>{answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
