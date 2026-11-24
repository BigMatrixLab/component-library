import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from 'ui-kit';

const steps = [
  { title: 'Order placed', description: 'Nov 18, 09:42' },
  { title: 'Packed', description: 'Nov 18, 15:10 at the Rotterdam warehouse' },
  { title: 'Out for delivery', description: 'Nov 20, courier is 6 stops away' },
  { title: 'Delivered', description: 'Estimated Nov 20, before 18:00' },
];

export default function StepperVertical() {
  return (
    <Stepper value={3} orientation="vertical" aria-label="Order tracking">
      {steps.map((s, i) => (
        <StepperItem key={s.title} step={i + 1}>
          <StepperTrigger>
            <StepperIndicator />
            <StepperContent>
              <StepperTitle>{s.title}</StepperTitle>
              <StepperDescription>{s.description}</StepperDescription>
            </StepperContent>
          </StepperTrigger>
          {i < steps.length - 1 && <StepperSeparator />}
        </StepperItem>
      ))}
    </Stepper>
  );
}
