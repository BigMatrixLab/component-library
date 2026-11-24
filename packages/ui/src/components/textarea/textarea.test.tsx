import { fireEvent, render, screen } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('counts characters against maxLength and flags near / limit', () => {
    render(<Textarea aria-label="Bio" showCount maxLength={10} defaultValue="abc" />);
    const area = screen.getByLabelText('Bio');
    const counter = screen.getByText('3 / 10');
    expect(counter.getAttribute('data-state')).toBeNull();
    fireEvent.change(area, { target: { value: '123456789' } });
    expect(screen.getByText('9 / 10').getAttribute('data-state')).toBe('near');
    fireEvent.change(area, { target: { value: '1234567890' } });
    expect(screen.getByText('10 / 10').getAttribute('data-state')).toBe('limit');
    expect(area.getAttribute('aria-describedby')).toBe(counter.id);
  });

  it('sets rows variables and auto-grow marker', () => {
    render(<Textarea aria-label="Notes" rows={4} maxRows={9} />);
    const area = screen.getByLabelText('Notes');
    expect(area.getAttribute('data-autogrow')).toBe('true');
    expect(area.style.getPropertyValue('--ui-textarea-rows')).toBe('4');
    expect(area.style.getPropertyValue('--ui-textarea-max')).toContain('9');
  });
});
