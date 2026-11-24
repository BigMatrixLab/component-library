import { act, renderHook } from '@testing-library/react';
import { useControllableState } from './use-controllable-state';

describe('useControllableState', () => {
  it('works uncontrolled', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('stays on the controlled value and only reports changes', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ value: 5, defaultValue: 1, onChange }));
    act(() => result.current[1]((v) => v + 1));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('does not report a change to the same value', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 'a', onChange }));
    act(() => result.current[1]('a'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
