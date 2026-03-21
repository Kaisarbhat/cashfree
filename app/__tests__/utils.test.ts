import { describe, it, expect } from 'vitest';
import { formatAadhaar, validPAN, scoreLabel, scoreColor } from '../lib/utils';

describe('formatAadhaar', () => {
  it('formats 12 digit string with spaces', () => {
    expect(formatAadhaar('999941057058')).toBe('9999 4105 7058');
  });
  it('strips non-digits', () => {
    expect(formatAadhaar('9999-4105-7058')).toBe('9999 4105 7058');
  });
  it('caps at 12 digits', () => {
    expect(formatAadhaar('99994105705800000').replace(/\s/g, '')).toBe('999941057058');
  });
  it('handles partial input', () => {
    expect(formatAadhaar('1234')).toBe('1234');
    expect(formatAadhaar('12345678')).toBe('1234 5678');
  });
  it('returns empty string for empty input', () => {
    expect(formatAadhaar('')).toBe('');
  });
});

describe('validPAN', () => {
  it('accepts valid PAN format', () => {
    expect(validPAN('ABCDE1234F')).toBe(true);
    expect(validPAN('ZZZZT9999Z')).toBe(true);
  });
  it('rejects lowercase PAN', () => {
    expect(validPAN('abcde1234f')).toBe(false);
  });
  it('rejects wrong length', () => {
    expect(validPAN('ABCDE123')).toBe(false);
    expect(validPAN('ABCDE12345F')).toBe(false);
  });
  it('rejects all-digit PAN', () => {
    expect(validPAN('1234512345')).toBe(false);
  });
  it('rejects empty string', () => {
    expect(validPAN('')).toBe(false);
  });
  it('rejects PAN with wrong structure', () => {
    expect(validPAN('12345ABCDE')).toBe(false); // digits first
    expect(validPAN('ABCDE1234G')).toBe(true);   // valid — last char is letter
  });
});

describe('scoreLabel', () => {
  it('returns STRONG MATCH for score >= 75', () => {
    expect(scoreLabel(75)).toContain('STRONG MATCH');
    expect(scoreLabel(100)).toContain('STRONG MATCH');
    expect(scoreLabel(90)).toContain('STRONG MATCH');
  });
  it('returns PARTIAL MATCH for score 50–74', () => {
    expect(scoreLabel(50)).toContain('PARTIAL MATCH');
    expect(scoreLabel(74)).toContain('PARTIAL MATCH');
    expect(scoreLabel(60)).toContain('PARTIAL MATCH');
  });
  it('returns NO MATCH for score < 50', () => {
    expect(scoreLabel(0)).toContain('NO MATCH');
    expect(scoreLabel(49)).toContain('NO MATCH');
    expect(scoreLabel(30)).toContain('NO MATCH');
  });
});

describe('scoreColor', () => {
  it('returns ok color for score >= 75', () => {
    expect(scoreColor(75)).toBe('var(--color-ok)');
    expect(scoreColor(100)).toBe('var(--color-ok)');
  });
  it('returns warn color for score 50–74', () => {
    expect(scoreColor(50)).toBe('var(--color-warn)');
    expect(scoreColor(74)).toBe('var(--color-warn)');
  });
  it('returns err color for score < 50', () => {
    expect(scoreColor(0)).toBe('var(--color-err)');
    expect(scoreColor(49)).toBe('var(--color-err)');
  });
});
