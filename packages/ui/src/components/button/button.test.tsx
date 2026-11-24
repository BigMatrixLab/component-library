import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders a type="button" by default with variant and size classes', () => {
    render(<Button variant="outline" size="sm">Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveProperty('type', 'button');
    expect(btn.className).toBe('ui-btn ui-btn-outline ui-btn-sm');
  });

  it('keeps focusability but swallows clicks while loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn.getAttribute('aria-busy')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(false);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the child element with asChild', () => {
    render(<Button asChild variant="ghost"><a href="/docs">Docs</a></Button>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.className).toBe('ui-btn ui-btn-ghost');
  });
});
