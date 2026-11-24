import { describe, expect, it } from 'vitest';
import { passwordHasSequence, isCommonPassword, scorePassword, type PasswordRequirement } from './password-score';

describe('scorePassword', () => {
  it('scores an empty password 0 with nothing met', () => {
    const r = scorePassword('');
    expect(r).toMatchObject({ score: 0, level: 'empty', metCount: 0 });
    expect(r.requirements.map((q) => q.met)).toEqual([false, false, false, false]);
  });

  it('gives any non-empty password at least 1', () => {
    expect(scorePassword('a').score).toBe(1);
    expect(scorePassword('abc')).toMatchObject({ score: 1, level: 'weak' });
  });

  it('ticks the default requirements independently', () => {
    const r = scorePassword('abcdefgH');
    expect(r.requirements.map((q) => [q.id, q.met])).toEqual([
      ['length', true],
      ['case', true],
      ['number', false],
      ['symbol', false],
    ]);
    expect(r.metCount).toBe(2);
  });

  it('rates length and variety', () => {
    expect(scorePassword('Tr0ub4dor&3')).toMatchObject({ score: 3, level: 'good', metCount: 4 });
    expect(scorePassword('Xk9#mP2$vL7!qR4w')).toMatchObject({ score: 4, level: 'strong' });
    expect(scorePassword('correct horse battery staple').score).toBe(3);
  });

  it('keeps common passwords and repeated characters weak', () => {
    expect(scorePassword('password').score).toBe(1);
    expect(scorePassword('Password1!').score).toBe(1);
    expect(scorePassword('aaaaaaaaaaaaaaaa').score).toBe(1);
  });

  it('takes a point off for a straight run', () => {
    expect(scorePassword('Abcd1234!xyzQ').score).toBe(3);
  });

  it('only calls a password strong when every requirement is met', () => {
    expect(scorePassword('correcthorsebatterystaple42!')).toMatchObject({ score: 3, metCount: 3 });
  });

  it('accepts custom requirements', () => {
    const rules: PasswordRequirement[] = [{ id: 'len12', label: 'At least 12 characters', test: (p) => p.length >= 12 }];
    expect(scorePassword('Xk9#mP2$vL7!', rules)).toMatchObject({ score: 4, metCount: 1 });
    const short = scorePassword('Xk9#mP2$', rules);
    expect(short.score).toBe(3);
    expect(short.requirements).toEqual([{ id: 'len12', label: 'At least 12 characters', met: false }]);
  });
});

describe('helpers', () => {
  it('passwordHasSequence finds runs of 4 up or down', () => {
    expect(passwordHasSequence('xx4321')).toBe(true);
    expect(passwordHasSequence('wxyz')).toBe(true);
    expect(passwordHasSequence('abc')).toBe(false);
    expect(passwordHasSequence('1357')).toBe(false);
  });

  it('isCommonPassword is case-insensitive', () => {
    expect(isCommonPassword('MyQWERTYkeyboard')).toBe(true);
    expect(isCommonPassword('violet-harbor-71')).toBe(false);
  });
});
