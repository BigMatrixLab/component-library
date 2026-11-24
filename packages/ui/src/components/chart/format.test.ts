import { createAxisFormatter, createValueFormatter } from './format';

describe('createValueFormatter', () => {
  it('formats presets', () => {
    expect(createValueFormatter('number', 'en-US')(1234.567)).toBe('1,234.57');
    expect(createValueFormatter('currency', 'en-US')(18420)).toBe('$18,420');
    expect(createValueFormatter('percent', 'en-US')(42.25)).toBe('42.3%');
    expect(createValueFormatter('compact', 'en-US')(12500)).toBe('12.5K');
  });
  it('accepts Intl options and custom functions', () => {
    expect(createValueFormatter({ style: 'percent' }, 'en-US')(0.42)).toBe('42%');
    expect(createValueFormatter({ style: 'currency', currency: 'EUR', locale: 'de-DE' })(5)).toContain('5');
    expect(createValueFormatter((v) => `${v} GB`)(8)).toBe('8 GB');
  });
});

describe('createAxisFormatter', () => {
  it('shortens big numbers for ticks', () => {
    expect(createAxisFormatter('number', 'en-US')(20000)).toBe('20K');
    expect(createAxisFormatter('currency', 'en-US')(20000)).toBe('$20K');
    expect(createAxisFormatter('percent', 'en-US')(50)).toBe('50%');
  });
});
