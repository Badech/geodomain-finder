import { describe, it, expect } from 'vitest';
import { 
  createSuccessResponse,
  createErrorResponse,
  handleZodError 
} from '../../../lib/api/utils';
import { z } from 'zod';

describe('API Utils', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', async () => {
      const response = createSuccessResponse({ test: 'data' });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual({ test: 'data' });
    });

    it('should accept custom status code', async () => {
      const response = createSuccessResponse({ test: 'data' }, 201);

      expect(response.status).toBe(201);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', async () => {
      const response = createErrorResponse('Test error', 400);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error?.message).toBe('Test error');
    });

    it('should include error code and details', async () => {
      const response = createErrorResponse('Test error', 400, 'TEST_ERROR', { detail: 'value' });
      const json = await response.json();

      expect(json.error?.code).toBe('TEST_ERROR');
      expect(json.error?.details).toEqual({ detail: 'value' });
    });
  });

  describe('handleZodError', () => {
    it('should format Zod validation errors', async () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      try {
        schema.parse({ name: 123, age: 'invalid' });
      } catch (error) {
        const response = handleZodError(error as z.ZodError);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error?.code).toBe('VALIDATION_ERROR');
        expect(json.error?.details).toBeInstanceOf(Array);
        expect(json.error?.details.length).toBeGreaterThan(0);
      }
    });
  });
});
