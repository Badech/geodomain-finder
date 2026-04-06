/**
 * Tests for US Cities Dataset
 */

import { describe, it, expect } from 'vitest';
import {
  US_CITIES_BY_STATE,
  getCitiesForState,
  getAllCities,
  searchCities,
  searchCitiesStartsWith,
  getCityCount,
  getTotalCityCount,
  cityExistsInState,
  getStatesWithCity,
} from '../usCities';

describe('US Cities Dataset', () => {
  describe('Dataset Structure', () => {
    it('should have all 50 states', () => {
      const states = Object.keys(US_CITIES_BY_STATE);
      expect(states).toHaveLength(50);
    });

    it('should have cities for each state', () => {
      Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
        expect(cities).toBeInstanceOf(Array);
        expect(cities.length).toBeGreaterThan(0);
      });
    });

    it('should have no duplicate cities within a state', () => {
      Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
        const uniqueCities = new Set(cities);
        expect(uniqueCities.size).toBe(cities.length);
      });
    });

    it('should have cities sorted alphabetically within each state', () => {
      Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
        const sorted = [...cities].sort();
        expect(cities).toEqual(sorted);
      });
    });

    it('should have proper capitalization', () => {
      const sampleCities = US_CITIES_BY_STATE['Virginia'];
      expect(sampleCities).toContain('Richmond');
      expect(sampleCities).toContain('Virginia Beach');
      expect(sampleCities).not.toContain('richmond'); // lowercase
      expect(sampleCities).not.toContain('RICHMOND'); // all caps
    });
  });

  describe('getCitiesForState', () => {
    it('should return cities for valid state name', () => {
      const cities = getCitiesForState('Virginia');
      expect(cities).toBeInstanceOf(Array);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities).toContain('Richmond');
    });

    it('should return cities for valid state code', () => {
      const cities = getCitiesForState('VA');
      expect(cities).toBeInstanceOf(Array);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities).toContain('Richmond');
    });

    it('should return empty array for invalid state', () => {
      const cities = getCitiesForState('Invalid State');
      expect(cities).toEqual([]);
    });

    it('should return same results for state name and code', () => {
      const byName = getCitiesForState('California');
      const byCode = getCitiesForState('CA');
      expect(byName).toEqual(byCode);
    });
  });

  describe('getAllCities', () => {
    it('should return all cities across all states', () => {
      const allCities = getAllCities();
      expect(allCities).toBeInstanceOf(Array);
      expect(allCities.length).toBeGreaterThan(29000); // ~29,650 cities
    });

    it('should return sorted cities', () => {
      const allCities = getAllCities();
      const sorted = [...allCities].sort();
      expect(allCities).toEqual(sorted);
    });

    it('should have no duplicates', () => {
      const allCities = getAllCities();
      const uniqueCities = new Set(allCities);
      expect(uniqueCities.size).toBe(allCities.length);
    });
  });

  describe('searchCities', () => {
    it('should find cities by partial match (case-insensitive)', () => {
      const results = searchCities('spring', 'Virginia');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(city => {
        expect(city.toLowerCase()).toContain('spring');
      });
    });

    it('should return empty array for empty query', () => {
      const results = searchCities('', 'Virginia');
      expect(results).toEqual([]);
    });

    it('should handle case-insensitive search', () => {
      const upper = searchCities('RICHMOND', 'Virginia');
      const lower = searchCities('richmond', 'Virginia');
      const mixed = searchCities('RichMond', 'Virginia');
      
      expect(upper).toEqual(lower);
      expect(lower).toEqual(mixed);
    });

    it('should search across all states when no state specified', () => {
      const results = searchCities('Springfield');
      expect(results.length).toBeGreaterThan(1); // Multiple Springfields exist
    });

    it('should trim whitespace from query', () => {
      const results1 = searchCities('  Richmond  ', 'Virginia');
      const results2 = searchCities('Richmond', 'Virginia');
      expect(results1).toEqual(results2);
    });
  });

  describe('searchCitiesStartsWith', () => {
    it('should prioritize starts-with matches', () => {
      const results = searchCitiesStartsWith('San', 'California');
      expect(results.length).toBeGreaterThan(0);
      
      // First results should start with "San"
      const firstFive = results.slice(0, 5);
      firstFive.forEach(city => {
        expect(city.toLowerCase().startsWith('san')).toBe(true);
      });
    });

    it('should include contains matches after starts-with', () => {
      const results = searchCitiesStartsWith('field', 'Illinois');
      expect(results.length).toBeGreaterThan(0);
      
      // Should have both "Field*" (starts) and "*field*" (contains)
      const hasStartsWith = results.some(city => city.toLowerCase().startsWith('field'));
      const hasContains = results.some(city => 
        city.toLowerCase().includes('field') && !city.toLowerCase().startsWith('field')
      );
      
      expect(hasStartsWith || hasContains).toBe(true);
    });
  });

  describe('getCityCount', () => {
    it('should return correct count for state name', () => {
      const count = getCityCount('Delaware');
      expect(count).toBe(58); // Smallest state
    });

    it('should return correct count for state code', () => {
      const count = getCityCount('DE');
      expect(count).toBe(58);
    });

    it('should return 0 for invalid state', () => {
      const count = getCityCount('Invalid');
      expect(count).toBe(0);
    });
  });

  describe('getTotalCityCount', () => {
    it('should return total count of all cities', () => {
      const total = getTotalCityCount();
      expect(total).toBeGreaterThan(29000);
      expect(total).toBeLessThan(30000);
    });
  });

  describe('cityExistsInState', () => {
    it('should return true for existing city', () => {
      expect(cityExistsInState('Richmond', 'Virginia')).toBe(true);
      expect(cityExistsInState('Richmond', 'VA')).toBe(true);
    });

    it('should return false for non-existing city', () => {
      expect(cityExistsInState('Fake City', 'Virginia')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(cityExistsInState('richmond', 'Virginia')).toBe(true);
      expect(cityExistsInState('RICHMOND', 'Virginia')).toBe(true);
    });

    it('should return false for city in wrong state', () => {
      expect(cityExistsInState('Los Angeles', 'Virginia')).toBe(false);
    });
  });

  describe('getStatesWithCity', () => {
    it('should find all states with a given city name', () => {
      const states = getStatesWithCity('Springfield');
      expect(states.length).toBeGreaterThan(1); // Multiple states have Springfield
      expect(states).toBeInstanceOf(Array);
    });

    it('should return sorted array', () => {
      const states = getStatesWithCity('Springfield');
      const sorted = [...states].sort();
      expect(states).toEqual(sorted);
    });

    it('should be case-insensitive', () => {
      const upper = getStatesWithCity('SPRINGFIELD');
      const lower = getStatesWithCity('springfield');
      expect(upper).toEqual(lower);
    });

    it('should return empty array for non-existent city', () => {
      const states = getStatesWithCity('NonExistentCityName123');
      expect(states).toEqual([]);
    });
  });

  describe('Data Quality', () => {
    it('should not contain obviously malformed entries', () => {
      Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
        cities.forEach(city => {
          // Should not be empty
          expect(city.trim()).not.toBe('');
          
          // Should not have excessive whitespace
          expect(city).toBe(city.trim());
          
          // Should not be all numbers
          expect(/^\d+$/.test(city)).toBe(false);
          
          // Should have reasonable length
          expect(city.length).toBeGreaterThan(0);
          expect(city.length).toBeLessThan(100);
        });
      });
    });

    it('should not contain townships or CDPs', () => {
      Object.entries(US_CITIES_BY_STATE).forEach(([state, cities]) => {
        cities.forEach(city => {
          expect(city).not.toMatch(/township$/i);
          expect(city).not.toMatch(/CDP$/i);
          expect(city).not.toMatch(/census-designated place/i);
          expect(city).not.toMatch(/unincorporated/i);
        });
      });
    });

    it('should have expected large states with many cities', () => {
      expect(getCityCount('Pennsylvania')).toBeGreaterThan(1500);
      expect(getCityCount('Texas')).toBeGreaterThan(1400);
      expect(getCityCount('California')).toBeGreaterThan(1200);
    });

    it('should have expected small states with fewer cities', () => {
      expect(getCityCount('Delaware')).toBeLessThan(100);
      expect(getCityCount('Rhode Island')).toBeLessThan(100);
      expect(getCityCount('Hawaii')).toBeLessThan(100);
    });
  });
});
