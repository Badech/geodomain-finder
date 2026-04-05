/**
 * Tests for Prospect Scoring Service
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTopBuyerScore,
  calculateContactReadinessScore,
  generatePitchAngles,
  determineRecommendedAction,
  assignRanking,
  analyzeProspect,
  getTopBuyers,
  getMostContactable,
  getImmediateActionProspects,
} from '../prospect-scoring';
import { ScoredBusinessLead, CurrentDomainAnalysis } from '../business-matcher';

function createMockLead(overrides: Partial<ScoredBusinessLead> = {}): ScoredBusinessLead {
  return {
    id: 'test-1',
    name: 'Test Business',
    niche: 'car detailing',
    city: 'Richmond',
    state: 'Virginia',
    address: '123 Main St',
    rating: 4.5,
    reviewCount: 100,
    phone: '555-0123',
    email: 'test@example.com',
    website: 'testbusiness.com',
    buyerScore: 70,
    scoreReasons: [],
    ...overrides,
  };
}

function createMockDomainAnalysis(overrides: Partial<CurrentDomainAnalysis> = {}): CurrentDomainAnalysis {
  return {
    domain: 'testbusiness.com',
    weaknesses: [],
    strengths: [],
    overallScore: 50,
    ...overrides,
  };
}

describe('Prospect Scoring Service', () => {
  describe('calculateTopBuyerScore', () => {
    it('should give high score for business with weak domain and strong reviews', () => {
      const lead = createMockLead({
        reviewCount: 200,
        rating: 4.8,
        email: 'test@example.com',
        phone: '555-0123',
      });
      
      const domainAnalysis = createMockDomainAnalysis({
        overallScore: 30, // Very weak domain
      });
      
      const score = calculateTopBuyerScore(lead, domainAnalysis);
      
      expect(score).toBeGreaterThan(80); // Should be high priority
    });
    
    it('should give maximum score for business with no website and excellent reviews', () => {
      const lead = createMockLead({
        website: undefined,
        reviewCount: 250,
        rating: 4.9,
        email: 'test@example.com',
        phone: '555-0123',
      });
      
      const score = calculateTopBuyerScore(lead);
      
      expect(score).toBeGreaterThan(85); // Platinum tier
    });
    
    it('should give lower score for business with strong domain', () => {
      const lead = createMockLead({
        reviewCount: 50,
        rating: 3.5,
      });
      
      const domainAnalysis = createMockDomainAnalysis({
        overallScore: 85, // Strong domain
      });
      
      const score = calculateTopBuyerScore(lead, domainAnalysis);
      
      expect(score).toBeLessThan(50);
    });
  });
  
  describe('calculateContactReadinessScore', () => {
    it('should give high score when email and phone available', () => {
      const lead = createMockLead({
        email: 'test@example.com',
        phone: '555-0123',
        website: 'test.com',
        rating: 4.5,
        reviewCount: 50,
      });
      
      const { score, reasons } = calculateContactReadinessScore(lead);
      
      expect(score).toBeGreaterThanOrEqual(90);
      expect(reasons).toContain('✓ Phone number available');
      expect(reasons).toContain('✓ Email address found');
    });
    
    it('should give low score when no contact info', () => {
      const lead = createMockLead({
        email: undefined,
        phone: undefined,
        website: undefined,
      });
      
      const { score, reasons } = calculateContactReadinessScore(lead);
      
      expect(score).toBeLessThan(40);
      expect(reasons).toContain('✗ No phone number');
      expect(reasons).toContain('✗ No email address');
    });
  });
  
  describe('generatePitchAngles', () => {
    it('should generate geo-SEO pitch for domain without geo keywords', () => {
      const lead = createMockLead();
      const domainAnalysis = createMockDomainAnalysis({
        weaknesses: ['No geographic keywords (city or state)'],
      });
      
      const pitches = generatePitchAngles(lead, domainAnalysis);
      
      expect(pitches.some(p => p.includes('local SEO'))).toBe(true);
    });
    
    it('should generate professional pitch for free subdomain', () => {
      const lead = createMockLead({
        website: 'mysite.wixsite.com',
      });
      
      const pitches = generatePitchAngles(lead);
      
      expect(pitches.some(p => p.includes('free subdomain'))).toBe(true);
    });
    
    it('should limit to 5 pitch angles', () => {
      const lead = createMockLead();
      const domainAnalysis = createMockDomainAnalysis({
        weaknesses: [
          'No geographic keywords (city or state)',
          'Missing service/niche keyword',
          'Too long - hard to remember',
          'Not a .com domain',
          'Contains hyphens or numbers',
        ],
      });
      
      const pitches = generatePitchAngles(lead, domainAnalysis);
      
      expect(pitches.length).toBeLessThanOrEqual(5);
    });
  });
  
  describe('determineRecommendedAction', () => {
    it('should recommend immediate action for high scores', () => {
      const action = determineRecommendedAction(85, 80);
      expect(action).toBe('immediate');
    });
    
    it('should recommend priority for good scores', () => {
      const action = determineRecommendedAction(70, 60);
      expect(action).toBe('priority');
    });
    
    it('should recommend follow-up for moderate scores', () => {
      const action = determineRecommendedAction(55, 50);
      expect(action).toBe('follow-up');
    });
    
    it('should recommend monitor for low scores', () => {
      const action = determineRecommendedAction(30, 40);
      expect(action).toBe('monitor');
    });
  });
  
  describe('assignRanking', () => {
    it('should assign platinum for top scores', () => {
      expect(assignRanking(90)).toBe('platinum');
    });
    
    it('should assign gold for high scores', () => {
      expect(assignRanking(75)).toBe('gold');
    });
    
    it('should assign silver for good scores', () => {
      expect(assignRanking(60)).toBe('silver');
    });
    
    it('should assign bronze for moderate scores', () => {
      expect(assignRanking(45)).toBe('bronze');
    });
    
    it('should assign standard for low scores', () => {
      expect(assignRanking(30)).toBe('standard');
    });
  });
  
  describe('analyzeProspect', () => {
    it('should generate complete prospect analysis', () => {
      const lead = createMockLead({
        reviewCount: 200,
        rating: 4.8,
        email: 'test@example.com',
        phone: '555-0123',
      });
      
      const domainAnalysis = createMockDomainAnalysis({
        overallScore: 30,
        weaknesses: ['No geographic keywords (city or state)'],
      });
      
      const analysis = analyzeProspect(lead, domainAnalysis);
      
      expect(analysis.businessLeadId).toBe(lead.id);
      expect(analysis.topBuyerScore).toBeGreaterThan(0);
      expect(analysis.contactReadinessScore).toBeGreaterThan(0);
      expect(analysis.ranking).toBeDefined();
      expect(analysis.recommendedAction).toBeDefined();
      expect(analysis.pitchAngles.length).toBeGreaterThan(0);
      expect(analysis.topBuyerReasons.length).toBeGreaterThan(0);
    });
  });
  
  describe('getTopBuyers', () => {
    it('should return top prospects sorted by score', () => {
      const leads = [
        createMockLead({ id: '1', reviewCount: 50, rating: 3.5 }),
        createMockLead({ id: '2', reviewCount: 200, rating: 4.8 }),
        createMockLead({ id: '3', reviewCount: 100, rating: 4.5 }),
      ];
      
      const analyses = leads.map(lead => analyzeProspect(lead));
      const topBuyers = getTopBuyers(analyses, 2);
      
      expect(topBuyers.length).toBe(2);
      expect(topBuyers[0].topBuyerScore).toBeGreaterThanOrEqual(topBuyers[1].topBuyerScore);
    });
  });
  
  describe('getMostContactable', () => {
    it('should return most contactable prospects', () => {
      const leads = [
        createMockLead({ id: '1', email: undefined, phone: undefined }),
        createMockLead({ id: '2', email: 'test@example.com', phone: '555-0123' }),
        createMockLead({ id: '3', email: 'test@example.com', phone: undefined }),
      ];
      
      const analyses = leads.map(lead => analyzeProspect(lead));
      const mostContactable = getMostContactable(analyses, 2);
      
      expect(mostContactable.length).toBe(2);
      expect(mostContactable[0].contactReadinessScore).toBeGreaterThanOrEqual(
        mostContactable[1].contactReadinessScore
      );
    });
  });
  
  describe('getImmediateActionProspects', () => {
    it('should return only immediate action prospects', () => {
      const leads = [
        createMockLead({ id: '1', reviewCount: 250, rating: 4.9, email: 'a@test.com', phone: '555-0001' }),
        createMockLead({ id: '2', reviewCount: 20, rating: 3.0, email: undefined, phone: undefined }),
        createMockLead({ id: '3', reviewCount: 180, rating: 4.7, email: 'b@test.com', phone: '555-0002' }),
      ];
      
      const analyses = leads.map(lead => analyzeProspect(lead));
      const immediate = getImmediateActionProspects(analyses);
      
      immediate.forEach(analysis => {
        expect(analysis.recommendedAction).toBe('immediate');
      });
    });
  });
});
