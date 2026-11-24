import { Button } from 'ui-kit';

export default function ButtonVariants() {
  return (
    <>
      <Button>Save changes</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="soft">Soft</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="link">Learn more</Button>
    </>
  );
}
