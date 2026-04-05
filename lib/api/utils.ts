/**
 * API utility functions
 * Common helpers for API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  message: string,
  status = 500,
  code?: string,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    },
    { status }
  );
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse<ApiResponse> {
  const details = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message,
  }));

  return createErrorResponse(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    details
  );
}

/**
 * Handle generic errors
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof Error) {
    return createErrorResponse(error.message, 500, 'INTERNAL_ERROR');
  }

  return createErrorResponse('An unexpected error occurred', 500, 'UNKNOWN_ERROR');
}

/**
 * Wrap an async handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch(handleError);
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T>(request: Request, schema: any): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Get query parameters from URL
 */
export function getQueryParams(request: Request): URLSearchParams {
  const url = new URL(request.url);
  return url.searchParams;
}

/**
 * Log API request
 */
export function logRequest(method: string, path: string, params?: any) {
  console.log(`[API] ${method} ${path}`, params ? JSON.stringify(params) : '');
}

/**
 * Log API response
 */
export function logResponse(method: string, path: string, status: number, duration?: number) {
  const durationText = duration ? ` (${duration}ms)` : '';
  console.log(`[API] ${method} ${path} - ${status}${durationText}`);
}
