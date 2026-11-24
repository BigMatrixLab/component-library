import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button, Icon } from 'ui-kit';

const FAQ = [
  {
    q: 'How does the 14-day trial work?',
    a: 'You get every Pro feature for 14 days, no card needed. We email you three days before it ends. If you don’t pick a plan, your workspace moves to Starter and nothing is deleted.',
  },
  {
    q: 'What counts as a seat?',
    a: 'Anyone who can sign in to your workspace. Accountants you invite as read-only guests are free and don’t use a seat.',
  },
  {
    q: 'Can I switch between monthly and yearly billing?',
    a: 'Yes, from Settings → Billing. Moving to yearly applies straight away and we credit what’s left of your month. Moving to monthly starts when your year ends.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yearly plans can be refunded in full within 30 days of payment. Monthly plans aren’t refunded once the month has started, but you can cancel at any time.',
  },
  {
    q: 'Where is my data stored?',
    a: 'In the EU (Frankfurt) by default, encrypted at rest and in transit. Business workspaces can choose the US (Virginia) or the UK (London) instead.',
  },
  {
    q: 'Do you have discounts for non-profits?',
    a: 'Registered non-profits, schools and open-source projects get 50% off any paid plan. Email us from your organisation’s domain to apply.',
  },
];

export default function PricingFaq() {
  return (
    <section aria-labelledby="faq-title" className="@container w-full rounded-xl border border-border bg-background px-5 py-12 @2xl:px-10">
      <div className="grid gap-10 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] @3xl:gap-16">
        <div className="grid content-start gap-3">
          <h2 id="faq-title" className="font-display text-3xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-md text-muted-foreground">Can’t find what you’re looking for? Our team usually replies within two hours on weekdays.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="mailto:support@lumen.dev">
                <Icon name="mail" />
                Email support
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#contact-sales">
                Talk to sales
                <Icon name="arrow-right" />
              </a>
            </Button>
          </div>
        </div>
        <Accordion type="single" collapsible defaultValue="faq-0">
          {FAQ.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger headingLevel={3}>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
