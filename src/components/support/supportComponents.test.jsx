import { describe, expect, it } from 'vitest';
import { formatSupportDate, mapSupportCategoryToFormCategory } from './supportUtils.js';

describe('support utils', () => {
  it('formats firestore timestamp-like values and invalid values safely', () => {
    expect(formatSupportDate({ seconds: 1700000000 })).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(formatSupportDate('not-a-date')).toBe('Unknown');
    expect(formatSupportDate(null)).toBe('Unknown');
  });

  it('maps support category cards to form categories', () => {
    expect(mapSupportCategoryToFormCategory('bugs')).toBe('bug_report');
    expect(mapSupportCategoryToFormCategory('account')).toBe('account_recovery');
    expect(mapSupportCategoryToFormCategory('gameplay')).toBe('gameplay_support');
    expect(mapSupportCategoryToFormCategory('general')).toBe('other');
  });
});
