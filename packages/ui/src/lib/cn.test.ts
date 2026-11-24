import { cn } from './cn';

describe('cn', () => {
  it('joins truthy classes and skips falsy ones', () => {
    expect(cn('a', false, null, undefined, '', 'b', 0, 'c')).toBe('a b c');
  });
});
