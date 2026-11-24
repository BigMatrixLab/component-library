import { commandScore } from './command-filter';

describe('commandScore', () => {
  it('matches everything for an empty search', () => {
    expect(commandScore('Billing', '')).toBeGreaterThan(0);
    expect(commandScore('Billing', '   ')).toBeGreaterThan(0);
  });

  it('ranks exact > prefix > word start > substring', () => {
    const exact = commandScore('Settings', 'settings');
    const prefix = commandScore('Settings', 'set');
    const word = commandScore('Account settings', 'set');
    const sub = commandScore('Reset password', 'set');
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(word);
    expect(word).toBeGreaterThan(sub);
    expect(sub).toBeGreaterThan(0);
  });

  it('matches keywords below a label prefix', () => {
    const kw = commandScore('Appearance', 'dark', ['theme', 'dark mode']);
    expect(kw).toBeGreaterThan(0);
    expect(commandScore('Dark launch', 'dark')).toBeGreaterThan(kw);
  });

  it('requires every word of a multi-word search', () => {
    expect(commandScore('Open recent file', 'file open')).toBeGreaterThan(0);
    expect(commandScore('Open recent file', 'file close')).toBe(0);
  });

  it('returns 0 when nothing matches', () => {
    expect(commandScore('Billing', 'zzz')).toBe(0);
  });
});
