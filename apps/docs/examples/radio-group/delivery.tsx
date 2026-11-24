import { RadioGroup, RadioGroupItem } from 'ui-kit';

export default function RadioGroupDelivery() {
  return (
    <RadioGroup defaultValue="standard" name="delivery" aria-label="Delivery speed">
      <RadioGroupItem value="standard" label="Standard" description="3–5 business days. Free over $50." />
      <RadioGroupItem value="express" label="Express" description="1–2 business days. $9.00." />
      <RadioGroupItem value="overnight" label="Overnight" description="Tomorrow by 10 am. $24.00." />
      <RadioGroupItem value="pickup" label="Pick up in store" description="Not available for this address." disabled />
    </RadioGroup>
  );
}
