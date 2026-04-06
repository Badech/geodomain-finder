/**
 * Business deduplication service
 * Removes duplicate businesses based on multiple criteria
 */

import { BusinessLeadSeed } from '../providers/types';

export interface DeduplicationResult {
  unique: BusinessLeadSeed[];
  duplicatesRemoved: number;
  deduplicationStats: {
    byPlaceId: number;
    byWebsite: number;
    byPhone: number;
    byNameAndAddress: number;
  };
}

/**
 * Deduplicate businesses using multiple strategies
 * Priority: placeId > website > phone > name+address
 */
export function deduplicateBusinesses(businesses: BusinessLeadSeed[]): DeduplicationResult {
  const stats = {
    byPlaceId: 0,
    byWebsite: 0,
    byPhone: 0,
    byNameAndAddress: 0,
  };

  const seen = {
    placeIds: new Set<string>(),
    websites: new Set<string>(),
    phones: new Set<string>(),
    nameAddresses: new Set<string>(),
  };

  const unique: BusinessLeadSeed[] = [];

  for (const business of businesses) {
    let isDuplicate = false;

    // Check placeId (highest priority)
    if (business.placeId) {
      if (seen.placeIds.has(business.placeId)) {
        stats.byPlaceId++;
        isDuplicate = true;
      } else {
        seen.placeIds.add(business.placeId);
      }
    }

    // Check website domain
    if (!isDuplicate && business.website) {
      const normalizedDomain = normalizeDomain(business.website);
      if (seen.websites.has(normalizedDomain)) {
        stats.byWebsite++;
        isDuplicate = true;
      } else {
        seen.websites.add(normalizedDomain);
      }
    }

    // Check phone number
    if (!isDuplicate && business.phone) {
      const normalizedPhone = normalizePhone(business.phone);
      if (seen.phones.has(normalizedPhone)) {
        stats.byPhone++;
        isDuplicate = true;
      } else {
        seen.phones.add(normalizedPhone);
      }
    }

    // Check name + address combination (fallback)
    if (!isDuplicate) {
      const nameAddress = normalizeNameAddress(business.name, business.address);
      if (seen.nameAddresses.has(nameAddress)) {
        stats.byNameAndAddress++;
        isDuplicate = true;
      } else {
        seen.nameAddresses.add(nameAddress);
      }
    }

    if (!isDuplicate) {
      unique.push(business);
    }
  }

  const duplicatesRemoved = businesses.length - unique.length;

  console.log(`[Deduplication] Removed ${duplicatesRemoved} duplicates from ${businesses.length} businesses`);
  console.log(`[Deduplication] Stats:`, stats);

  return {
    unique,
    duplicatesRemoved,
    deduplicationStats: stats,
  };
}

/**
 * Normalize domain for comparison
 */
function normalizeDomain(url: string): string {
  try {
    const cleaned = url.toLowerCase().trim();
    const withProtocol = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    const urlObj = new URL(withProtocol);
    // Remove www and return just the hostname
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Fallback for malformed URLs
    return url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .trim();
  }
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

/**
 * Normalize name and address for comparison
 */
function normalizeNameAddress(name: string, address: string): string {
  // Convert to lowercase, remove special chars, collapse whitespace
  const normalizePart = (str: string) => 
    str.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  return `${normalizePart(name)}|${normalizePart(address)}`;
}

/**
 * Merge duplicate businesses, keeping the best data from each
 */
export function mergeDuplicateBusinesses(businesses: BusinessLeadSeed[]): BusinessLeadSeed[] {
  // Group by normalized identifier
  const groups = new Map<string, BusinessLeadSeed[]>();

  for (const business of businesses) {
    const key = business.placeId || normalizeDomain(business.website || '') || normalizePhone(business.phone || '');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(business);
  }

  // Merge each group
  const merged: BusinessLeadSeed[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
    } else {
      // Merge multiple entries, preferring non-null values
      const best = group.reduce((acc, curr) => ({
        ...acc,
        placeId: acc.placeId || curr.placeId,
        name: acc.name || curr.name,
        address: acc.address || curr.address,
        city: acc.city || curr.city,
        state: acc.state || curr.state,
        phone: acc.phone || curr.phone,
        email: acc.email || curr.email,
        website: acc.website || curr.website,
        rating: Math.max(acc.rating || 0, curr.rating || 0) || undefined,
        reviewCount: Math.max(acc.reviewCount || 0, curr.reviewCount || 0) || undefined,
        latitude: acc.latitude || curr.latitude,
        longitude: acc.longitude || curr.longitude,
      }));
      
      merged.push(best);
    }
  }

  return merged;
}
