import { render, screen } from '@testing-library/react';
import { Field, FieldError, FieldHint, Label } from './field';
import { Input } from '../input/input';
import { Textarea } from '../textarea/textarea';
import { NativeSelect } from '../native-select/native-select';

describe('Field', () => {
  it('links label, control, hint and error', () => {
    render(
      <Field required>
        <Label>Email</Label>
        <Input />
        <FieldHint>We send receipts here.</FieldHint>
        <FieldError>Enter a valid email.</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText('Email', { exact: false });
    expect(input.getAttribute('required')).not.toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    expect(ids).toHaveLength(2);
    expect(document.getElementById(ids[0]!)?.textContent).toBe('We send receipts here.');
    expect(document.getElementById(ids[1]!)?.textContent).toBe('Enter a valid email.');
  });

  it('drops aria wiring when hint and error are absent or empty', () => {
    render(
      <Field>
        <Label>Name</Label>
        <Input />
        <FieldError>{''}</FieldError>
      </Field>,
    );
    const input = screen.getByLabelText('Name');
    expect(input.getAttribute('aria-describedby')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('follows a control that has its own id and passes disabled down', () => {
    render(
      <Field disabled>
        <Label>Bio</Label>
        <Textarea id="my-bio" />
      </Field>,
    );
    const ta = screen.getByLabelText('Bio');
    expect(ta.id).toBe('my-bio');
    expect((ta as HTMLTextAreaElement).disabled).toBe(true);
  });

  it('works for selects and standalone controls', () => {
    render(
      <>
        <Field invalid>
          <Label>Plan</Label>
          <NativeSelect>
            <option>Team</option>
          </NativeSelect>
        </Field>
        <Input aria-label="Standalone" />
      </>,
    );
    expect(screen.getByLabelText('Plan').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Standalone').getAttribute('aria-describedby')).toBeNull();
  });
});
