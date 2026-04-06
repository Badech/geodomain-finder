/**
 * Tests for State Codes
 */

import { describe, it, expect } from 'vitest';
import {
  STATE_CODES,
  STATE_NAMES,
  getStateCode,
  getStateName,
} from '../stateCodes';

describe('State Codes', () => {
  describe('STATE_CODES', () => {
    it('should have all 50 states', () => {
      expect(Object.keys(STATE_CODES)).toHaveLength(50);
    });

    it('should map state names to 2-letter codes', () => {
      expect(STATE_CODES['Virginia']).toBe('VA');
      expect(STATE_CODES['California']).toBe('CA');
      expect(STATE_CODES['Texas']).toBe('TX');
    });

    it('should have all codes in uppercase', () => {
      Object.values(STATE_CODES).forEach(code => {
        expect(code).toBe(code.toUpperCase());
        expect(code).toHaveLength(2);
      });
    });
  });

  describe('STATE_NAMES', () => {
    it('should have all 50 states', () => {
      expect(Object.keys(STATE_NAMES)).toHaveLength(50);
    });

    it('should map codes to state names', () => {
      expect(STATE_NAMES['VA']).toBe('Virginia');
      expect(STATE_NAMES['CA']).toBe('California');
      expect(STATE_NAMES['TX']).toBe('Texas');
    });

    it('should be inverse of STATE_CODES', () => {
      Object.entries(STATE_CODES).forEach(([name, code]) => {
        expect(STATE_NAMES[code]).toBe(name);
      });
    });
  });

  describe('getStateCode', () => {
    it('should return code for valid state name', () => {
      expect(getStateCode('Virginia')).toBe('VA');
      expect(getStateCode('California')).toBe('CA');
    });

    it('should return undefined for invalid state', () => {
      expect(getStateCode('Invalid State')).toBeUndefined();
    });
  });

  describe('getStateName', () => {
    it('should return name for valid state code', () => {
      expect(getStateName('VA')).toBe('Virginia');
      expect(getStateName('CA')).toBe('California');
    });

    it('should return undefined for invalid code', () => {
      expect(getStateName('XX')).toBeUndefined();
    });
  });
});
