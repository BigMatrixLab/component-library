import { fireEvent, render, screen } from '@testing-library/react';
import { InputOTP } from './input-otp';
import { activeSlotIndex, resolveGroups, sanitizeOTP } from './otp-utils';

describe('otp-utils', () => {
  it('sanitises by pattern and cuts to length', () => {
    expect(sanitizeOTP('12a-34 56789', 'digits', 6)).toBe('123456');
    expect(sanitizeOTP('a1-B2', 'alphanumeric', 6)).toBe('a1B2');
    expect(sanitizeOTP('', 'digits', 6)).toBe('');
  });
  it('finds the active slot', () => {
    expect(activeSlotIndex(null, 2, 6)).toBe(2);
    expect(activeSlotIndex(1, 4, 6)).toBe(1);
    expect(activeSlotIndex(6, 6, 6)).toBe(5);
    expect(activeSlotIndex(3, 2, 6)).toBe(2);
  });
  it('resolves groups', () => {
    expect(resolveGroups(6)).toEqual([6]);
    expect(resolveGroups(6, [3, 3])).toEqual([3, 3]);
    expect(resolveGroups(6, [])).toEqual([6]);
  });
});

describe('InputOTP', () => {
  const input = () => screen.getByLabelText('One-time code') as HTMLInputElement;

  it('renders one slot per character over a single one-time-code input', () => {
    const { container } = render(<InputOTP length={6} groups={[3, 3]} />);
    expect(container.querySelectorAll('.ui-otp-slot')).toHaveLength(6);
    expect(container.querySelectorAll('.ui-otp-separator')).toHaveLength(1);
    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(input().autocomplete).toBe('one-time-code');
    expect(input().inputMode).toBe('numeric');
  });

  it('filters typed characters and reports completion once', () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<InputOTP length={4} onValueChange={onChange} onComplete={onComplete} />);
    fireEvent.change(input(), { target: { value: '12a' } });
    expect(input().value).toBe('12');
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.change(input(), { target: { value: '1234' } });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(onChange).toHaveBeenLastCalledWith('1234');
  });

  it('paste fills every slot with the cleaned text', () => {
    const onComplete = vi.fn();
    const { container } = render(<InputOTP length={6} onComplete={onComplete} />);
    fireEvent.paste(input(), { clipboardData: { getData: () => ' 482-913 ' } });
    expect(input().value).toBe('482913');
    expect(onComplete).toHaveBeenCalledWith('482913');
    expect(Array.from(container.querySelectorAll('.ui-otp-slot')).map((s) => s.textContent).join('')).toBe('482913');
  });

  it('is controlled and marks invalid', () => {
    const { rerender } = render(<InputOTP length={4} value="12" onValueChange={() => {}} invalid />);
    expect(input().value).toBe('12');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    rerender(<InputOTP length={4} value="1234" onValueChange={() => {}} invalid />);
    expect(input().value).toBe('1234');
  });

  it('accepts letters with the alphanumeric pattern', () => {
    render(<InputOTP length={4} pattern="alphanumeric" />);
    fireEvent.change(input(), { target: { value: 'a1-b' } });
    expect(input().value).toBe('a1b');
    expect(input().inputMode).toBe('text');
  });
});
