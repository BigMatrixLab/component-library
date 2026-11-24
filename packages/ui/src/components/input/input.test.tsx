import { fireEvent, render, screen } from '@testing-library/react';
import { Input, InputAction, InputGroup, PasswordInput } from './input';

describe('Input', () => {
  it('applies size classes', () => {
    render(<Input size="lg" aria-label="x" />);
    expect(screen.getByLabelText('x').className).toBe('ui-input ui-input-lg');
  });

  it('focuses the input when a non-interactive part of the group is clicked', () => {
    render(
      <InputGroup data-testid="g">
        <span data-testid="addon">https://</span>
        <Input aria-label="site" />
        <InputAction aria-label="clear" />
      </InputGroup>,
    );
    fireEvent.click(screen.getByTestId('addon'));
    expect(document.activeElement).toBe(screen.getByLabelText('site'));
  });

  it('PasswordInput toggles type and aria-pressed', () => {
    render(<PasswordInput aria-label="Password" defaultValue="secret" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(input.type).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(toggle);
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(input.value).toBe('secret');
  });
});
