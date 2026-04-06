/**
 * Performance monitoring utility
 * Tracks timing for search pipeline stages
 */

export interface PerformanceMetrics {
  stage: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private searchStartTime: number = 0;

  /**
   * Start tracking a search operation
   */
  startSearch(): void {
    this.searchStartTime = Date.now();
    this.timers.clear();
    this.metrics = [];
    console.log('[Performance] Search started');
  }

  /**
   * Start timing a specific stage
   */
  startStage(stageName: string): void {
    this.timers.set(stageName, Date.now());
  }

  /**
   * End timing a stage and record metrics
   */
  endStage(stageName: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(stageName);
    
    if (!startTime) {
      console.warn(`[Performance] No start time found for stage: ${stageName}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    
    this.metrics.push({
      stage: stageName,
      duration,
      timestamp: startTime,
      metadata,
    });

    console.log(`[Performance] ${stageName}: ${duration}ms`, metadata || '');
    
    this.timers.delete(stageName);
    return duration;
  }

  /**
   * Get total search duration
   */
  getTotalDuration(): number {
    if (!this.searchStartTime) return 0;
    return Date.now() - this.searchStartTime;
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get summary report
   */
  getSummary(): {
    totalDuration: number;
    stages: {
      name: string;
      duration: number;
      percentage: number;
    }[];
  } {
    const totalDuration = this.getTotalDuration();
    
    const stages = this.metrics.map(metric => ({
      name: metric.stage,
      duration: metric.duration,
      percentage: totalDuration > 0 ? (metric.duration / totalDuration) * 100 : 0,
    }));

    return {
      totalDuration,
      stages,
    };
  }

  /**
   * Log final summary
   */
  logSummary(): void {
    const summary = this.getSummary();
    
    console.log('\n' + '='.repeat(60));
    console.log('[Performance] SEARCH SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Duration: ${summary.totalDuration}ms`);
    console.log('\nStage Breakdown:');
    
    summary.stages.forEach(stage => {
      console.log(`  ${stage.name.padEnd(30)} ${stage.duration.toString().padStart(6)}ms (${stage.percentage.toFixed(1)}%)`);
    });
    
    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Search-specific performance tracker
 */
export interface SearchPerformanceReport {
  totalDuration: number;
  domainGeneration: number;
  domainAvailabilityCheck: number;
  businessSearch: number;
  businessEnrichment: number;
  matching: number;
  domainsGenerated: number;
  domainsChecked: number;
  businessesFound: number;
  businessesEnriched: number;
  cacheHits?: number;
  queryVariants?: number;
  duplicatesRemoved?: number;
}

export function createSearchPerformanceReport(monitor: PerformanceMonitor): SearchPerformanceReport {
  const metrics = monitor.getMetrics();
  
  const getMetric = (stage: string) => 
    metrics.find(m => m.stage === stage)?.duration || 0;
  
  const getMetadata = (stage: string, key: string) =>
    metrics.find(m => m.stage === stage)?.metadata?.[key];

  return {
    totalDuration: monitor.getTotalDuration(),
    domainGeneration: getMetric('domain-generation'),
    domainAvailabilityCheck: getMetric('domain-availability'),
    businessSearch: getMetric('business-search'),
    businessEnrichment: getMetric('business-enrichment'),
    matching: getMetric('matching'),
    domainsGenerated: getMetadata('domain-generation', 'count') || 0,
    domainsChecked: getMetadata('domain-availability', 'count') || 0,
    businessesFound: getMetadata('business-search', 'count') || 0,
    businessesEnriched: getMetadata('business-enrichment', 'count') || 0,
    cacheHits: getMetadata('domain-availability', 'cacheHits'),
    queryVariants: getMetadata('business-search', 'queryVariants'),
    duplicatesRemoved: getMetadata('business-search', 'duplicatesRemoved'),
  };
}
