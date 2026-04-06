/**
 * Progressive Search Stream API
 * Streams search results progressively using Server-Sent Events (SSE)
 * Provides real-time updates as domains are checked and businesses are found
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { generateDomainCandidates, scoreBusinessLeads } from '../../../../lib/services/search-orchestrator';
import { initializeProviders } from '../../../../lib/providers/config';

const searchRequestSchema = z.object({
  niche: z.string().min(1, 'Niche is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  modifiers: z.string().optional(),
  comOnly: z.boolean().default(true),
});

type SearchRequest = z.infer<typeof searchRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = searchRequestSchema.parse(body);

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          // Initialize performance monitoring
          const { PerformanceMonitor } = await import('../../../../lib/utils/performance-monitor');
          const perfMonitor = new PerformanceMonitor();
          perfMonitor.startSearch();

          // Initialize providers
          const { domainProvider, leadProvider, emailExtractor } = initializeProviders();

          // Stage 1: Generate domains (instant)
          perfMonitor.startStage('domain-generation');
          sendEvent({
            stage: 'generating',
            status: 'Generating domain ideas...',
            progress: 10,
          });

          const domainCandidates = generateDomainCandidates({
            niche: input.niche,
            city: input.city,
            state: input.state,
            modifiers: input.modifiers?.split(',').map(m => m.trim()),
            maxResults: 20,
          });
          
          // Add required fields for DomainOpportunity type
          const domainsWithIds = domainCandidates.map((candidate, idx) => ({
            id: `domain-${Date.now()}-${idx}`,
            domain: candidate.domain,
            tld: '.com', // Assuming .com for now
            status: 'unknown' as const,
            qualityScore: candidate.qualityScore,
            seoScore: candidate.seoScore,
            resaleScore: candidate.resaleScore,
            naturalnessScore: candidate.naturalnessScore,
            reasons: candidate.reasons,
            searchQueryId: `sq-${Date.now()}`,
            saved: false,
            pattern: candidate.pattern,
          }));
          
          perfMonitor.endStage('domain-generation', { count: domainsWithIds.length });

          sendEvent({
            stage: 'domains-generated',
            status: `Generated ${domainsWithIds.length} domain ideas`,
            progress: 20,
            data: { domains: domainsWithIds },
          });

          // Stage 2: Check availability progressively
          perfMonitor.startStage('domain-availability');
          sendEvent({
            stage: 'checking-availability',
            status: 'Checking domain availability...',
            progress: 30,
          });

          let checkedCount = 0;
          const totalDomains = domainsWithIds.length;
          const checkedDomains: any[] = [];

          // Check domains in batches (Dynadot doesn't allow concurrent requests from same account)
          const batchSize = 5;
          for (let i = 0; i < domainsWithIds.length; i += batchSize) {
            const batch = domainsWithIds.slice(i, i + batchSize);
            
            try {
              // Call checkAvailability ONCE with all domains in the batch (not in parallel)
              const domainNames = batch.map(d => d.domain);
              const availabilityResults = await domainProvider.checkAvailability(domainNames);
              
              // Map results back to domain opportunities
              const batchResults = batch.map((domainOpportunity, index) => {
                const availabilityResult = availabilityResults[index];
                return {
                  ...domainOpportunity,
                  status: availabilityResult.status, // Use the exact status from provider
                };
              });
              
              // Send updates for each checked domain
              batchResults.forEach((result) => {
                checkedCount++;
                checkedDomains.push(result);
                sendEvent({
                  stage: 'domain-checked',
                  progress: 30 + (checkedCount / totalDomains) * 20,
                  data: result,
                });
              });
            } catch (error) {
              console.error(`[Stream] Error checking batch:`, error);
              // Mark all domains in failed batch as error
              batch.forEach((domainOpportunity) => {
                const errorResult = {
                  ...domainOpportunity,
                  status: 'error' as const,
                };
                checkedCount++;
                checkedDomains.push(errorResult);
                sendEvent({
                  stage: 'domain-checked',
                  progress: 30 + (checkedCount / totalDomains) * 20,
                  data: errorResult,
                });
              });
            }
          }

          perfMonitor.endStage('domain-availability', { count: checkedDomains.length });

          sendEvent({
            stage: 'availability-complete',
            status: 'Domain availability checked',
            progress: 50,
          });

          // Stage 3: Search businesses with query expansion
          perfMonitor.startStage('business-search');
          sendEvent({
            stage: 'searching-businesses',
            status: 'Finding local businesses...',
            progress: 55,
          });

          // Use niche normalizer for better coverage
          const { generateSearchQueries } = await import('../../../../lib/utils/niche-normalizer');
          const searchQueries = generateSearchQueries(input.niche, input.city, input.state);
          
          console.log(`[Search] Running ${searchQueries.length} query variants for better coverage`);
          
          // Execute multiple search queries in parallel
          const queryResults = await Promise.allSettled(
            searchQueries.map(query => 
              leadProvider.searchBusinesses({
                niche: query,
                city: input.city,
                state: input.state,
                limit: 30, // Limit per query to avoid overwhelming
              })
            )
          );

          // Merge all results
          const allBusinesses: any[] = [];
          queryResults.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
              console.log(`[Search] Query "${searchQueries[idx]}" found ${result.value.length} businesses`);
              allBusinesses.push(...result.value);
            } else {
              console.error(`[Search] Query "${searchQueries[idx]}" failed:`, result.reason);
            }
          });

          console.log(`[Search] Total raw results: ${allBusinesses.length} businesses`);

          // Deduplicate businesses
          const { deduplicateBusinesses } = await import('../../../../lib/services/business-deduplication');
          const { unique: uniqueBusinesses, duplicatesRemoved } = deduplicateBusinesses(allBusinesses);
          
          console.log(`[Search] After deduplication: ${uniqueBusinesses.length} unique businesses (${duplicatesRemoved} duplicates removed)`);

          // Map to BusinessLead format with id field
          const businessesWithIds = uniqueBusinesses.map(lead => ({
            id: lead.placeId || `generated_${Date.now()}_${Math.random()}`,
            placeId: lead.placeId,
            name: lead.name,
            niche: input.niche,
            city: lead.city,
            state: lead.state,
            phone: lead.phone,
            email: lead.email,
            website: lead.website,
            address: lead.address,
            rating: lead.rating || 0,
            reviewCount: lead.reviewCount || 0,
            currentDomain: lead.website,
            status: 'new' as const,
            tags: [],
            latitude: lead.latitude,
            longitude: lead.longitude,
          }));

          // Score the businesses
          const businesses = scoreBusinessLeads(businessesWithIds);

          perfMonitor.endStage('business-search', { 
            count: businesses.length, 
            queryVariants: searchQueries.length,
            duplicatesRemoved 
          });

          sendEvent({
            stage: 'businesses-found',
            status: `Found ${businesses.length} businesses`,
            progress: 70,
            data: { businesses },
          });

          // Stage 4: Enrich top businesses progressively
          perfMonitor.startStage('business-enrichment');
          if (businesses.length > 0) {
            sendEvent({
              stage: 'enriching',
              status: 'Enriching business contacts...',
              progress: 75,
            });

            // Only enrich top 10 businesses initially for speed
            const topBusinesses = businesses.slice(0, 10);
            let enrichedCount = 0;

            for (const business of topBusinesses) {
              try {
                // Extract email if website exists
                let email = business.email;
                if (!email && business.website) {
                  const emailResult = await emailExtractor.extractPublicEmails(business.website);
                  email = emailResult.email || undefined;
                }

                enrichedCount++;
                
                sendEvent({
                  stage: 'business-enriched',
                  progress: 75 + (enrichedCount / topBusinesses.length) * 15,
                  data: {
                    id: business.id,
                    email,
                  },
                });
              } catch (error) {
                // Continue on error
                console.error(`Failed to enrich business ${business.id}:`, error);
              }
            }

            perfMonitor.endStage('business-enrichment', { count: enrichedCount });

            sendEvent({
              stage: 'enrichment-complete',
              status: 'Contact enrichment complete',
              progress: 90,
            });
          }

          // Log performance summary
          perfMonitor.logSummary();

          // Persist to database in background (don't block completion)
          persistSearchResultsInBackground(input, { domains: checkedDomains, businesses }).catch(error => {
            console.error('[Stream] Background persistence failed:', error);
          });

          // Stage 5: Complete
          sendEvent({
            stage: 'complete',
            status: 'Search complete!',
            progress: 100,
          });

          controller.close();

        } catch (error) {
          console.error('Stream error:', error);
          sendEvent({
            stage: 'error',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
          });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error('Search stream error:', error);
    
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Prevent static optimization
/**
 * Persist search results to database in background
 */
async function persistSearchResultsInBackground(
  input: SearchRequest,
  result: { domains: any[]; businesses: any[] }
) {
  try {
    const { db } = await import('../../../../lib/db');
    
    console.log('[Stream] Persisting search results to database...');

    // Save businesses to database
    if (result.businesses && result.businesses.length > 0) {
      const businessData = result.businesses.map(business => ({
        placeId: business.placeId || business.id,
        name: business.name,
        niche: input.niche,
        city: business.city,
        state: business.state,
        phone: business.phone || null,
        email: business.email || null,
        website: business.website || null,
        address: business.address,
        rating: business.rating || 0,
        reviewCount: business.reviewCount || 0,
        currentDomain: business.website || null,
        buyerScore: business.buyerScore || 0,
        status: business.status || 'new',
        tags: business.tags || [],
        latitude: business.latitude || null,
        longitude: business.longitude || null,
      }));

      // Use upsert to avoid duplicates
      for (const business of businessData) {
        await db.businessLead.upsert({
          where: { placeId: business.placeId },
          update: business,
          create: business,
        });
      }

      console.log(`[Stream] Persisted ${businessData.length} businesses to database`);
    }

    // Note: Domains are typically not persisted to database in this app
    // They're generated on-demand and cached in memory
    
  } catch (error) {
    console.error('[Stream] Error persisting search results:', error);
    // Don't throw - this is background operation
  }
}

export const dynamic = 'force-dynamic';
