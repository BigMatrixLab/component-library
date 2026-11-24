import { fireEvent, render, screen } from '@testing-library/react';
import { NativeSelect } from './native-select';

describe('NativeSelect', () => {
  it('renders a styled select in a wrapper with size class and forwards onChange', () => {
    const onChange = vi.fn();
    render(
      <NativeSelect size="sm" aria-label="Period" onChange={onChange}>
        <option value="m">Monthly</option>
        <option value="y">Yearly</option>
      </NativeSelect>,
    );
    const select = screen.getByLabelText('Period') as HTMLSelectElement;
    expect(select.className).toBe('ui-select');
    expect(select.parentElement?.className).toBe('ui-select-wrap ui-select-wrap-sm');
    fireEvent.change(select, { target: { value: 'y' } });
    expect(onChange).toHaveBeenCalled();
    expect(select.value).toBe('y');
  });
});
