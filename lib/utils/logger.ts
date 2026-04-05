/**
 * Structured Logger
 * Phase 9: Production-ready logging with context and levels
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  requestId?: string;
  duration?: number;
}

/**
 * Structured logger for production use
 */
export class Logger {
  private context: Record<string, any>;
  private minLevel: LogLevel;

  constructor(context: Record<string, any> = {}) {
    this.context = context;
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.minLevel);
    return currentIndex >= minIndex;
  }

  private formatLog(level: LogLevel, message: string, data?: Record<string, any>, error?: Error): LogContext {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...data },
      error,
    };
  }

  private output(logContext: LogContext): void {
    if (process.env.NODE_ENV === 'production') {
      // In production, output structured JSON
      console.log(JSON.stringify(logContext));
    } else {
      // In development, output formatted
      const emoji = {
        debug: '🔍',
        info: 'ℹ️',
        warn: '⚠️',
        error: '❌',
      }[logContext.level];

      console.log(`${emoji} [${logContext.level.toUpperCase()}] ${logContext.message}`);
      if (logContext.context && Object.keys(logContext.context).length > 0) {
        console.log('  Context:', logContext.context);
      }
      if (logContext.error) {
        console.error('  Error:', logContext.error);
      }
    }
  }

  debug(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;
    this.output(this.formatLog('debug', message, data));
  }

  info(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;
    this.output(this.formatLog('info', message, data));
  }

  warn(message: string, data?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;
    this.output(this.formatLog('warn', message, data));
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;
    this.output(this.formatLog('error', message, data, error));
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: Record<string, any>): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Log API request
   */
  logRequest(method: string, path: string, body?: any): void {
    this.info('API Request', { method, path, body });
  }

  /**
   * Log API response
   */
  logResponse(method: string, path: string, statusCode: number, duration: number): void {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this[level]('API Response', { method, path, statusCode, duration });
  }

  /**
   * Log search operation
   */
  logSearch(params: Record<string, any>, result: { totalResults: number; executionTime: number }): void {
    this.info('Search Completed', {
      params,
      totalResults: result.totalResults,
      executionTime: result.executionTime,
    });
  }

  /**
   * Log provider operation
   */
  logProvider(provider: string, operation: string, success: boolean, duration: number, error?: Error): void {
    if (!success) {
      this.error(`Provider ${provider} ${operation} failed`, error, { provider, operation, duration });
    } else {
      this.debug(`Provider ${provider} ${operation} succeeded`, { provider, operation, duration });
    }
  }

  /**
   * Log cache operation
   */
  logCache(operation: 'hit' | 'miss' | 'set', key: string, data?: Record<string, any>): void {
    this.debug(`Cache ${operation}`, { key, ...data });
  }

  /**
   * Log performance timing
   */
  logTiming(operation: string, duration: number, threshold?: number): void {
    if (threshold && duration > threshold) {
      this.warn(`Slow operation: ${operation}`, { duration, threshold });
    } else {
      this.debug(`Operation timing: ${operation}`, { duration });
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger({ service: 'geodomain-scout' });

/**
 * Create a logger for a specific module
 */
export function createLogger(module: string): Logger {
  return logger.child({ module });
}

/**
 * Performance timer helper
 */
export class PerformanceTimer {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, customLogger?: Logger) {
    this.operation = operation;
    this.logger = customLogger || logger;
    this.startTime = Date.now();
  }

  /**
   * End timer and log duration
   */
  end(threshold?: number): number {
    const duration = Date.now() - this.startTime;
    this.logger.logTiming(this.operation, duration, threshold);
    return duration;
  }

  /**
   * Get elapsed time without logging
   */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
}

/**
 * Measure async function performance
 */
export async function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  customLogger?: Logger
): Promise<{ result: T; duration: number }> {
  const timer = new PerformanceTimer(operation, customLogger);
  const result = await fn();
  const duration = timer.end();
  return { result, duration };
}
