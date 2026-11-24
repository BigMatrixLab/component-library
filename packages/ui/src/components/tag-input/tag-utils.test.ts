import { addTags, sameTag, splitTags } from './tag-utils';

describe('tag-input helpers', () => {
  it('splits on commas and newlines and trims', () => {
    expect(splitTags('ada@x.com, grace@x.com\nlinus@x.com,,  ')).toEqual(['ada@x.com', 'grace@x.com', 'linus@x.com']);
  });

  it('splits on custom delimiters', () => {
    expect(splitTags('a; b;c', [';'])).toEqual(['a', 'b', 'c']);
  });

  it('compares tags case-insensitively by default', () => {
    expect(sameTag('React', 'react')).toBe(true);
    expect(sameTag('React', 'react', true)).toBe(false);
  });

  it('adds new tags and rejects duplicates', () => {
    const r = addTags(['react'], ['React', 'vue', ' ']);
    expect(r.tags).toEqual(['react', 'vue']);
    expect(r.added).toEqual(['vue']);
    expect(r.rejected).toEqual([{ tag: 'React', reason: 'duplicate' }]);
  });

  it('allows duplicates when asked', () => {
    expect(addTags(['a'], ['a'], { allowDuplicates: true }).tags).toEqual(['a', 'a']);
  });

  it('stops at maxTags', () => {
    const r = addTags(['a', 'b'], ['c', 'd'], { maxTags: 3 });
    expect(r.tags).toEqual(['a', 'b', 'c']);
    expect(r.rejected).toEqual([{ tag: 'd', reason: 'max' }]);
  });

  it('rejects with validate, keeping a message', () => {
    const validate = (t: string) => (t.includes('@') ? true : 'Not an email address');
    const r = addTags([], ['ada@x.com', 'nope'], { validate });
    expect(r.tags).toEqual(['ada@x.com']);
    expect(r.rejected).toEqual([{ tag: 'nope', reason: 'invalid', message: 'Not an email address' }]);
    expect(addTags([], ['x'], { validate: () => false }).rejected[0]!.reason).toBe('invalid');
  });
});
