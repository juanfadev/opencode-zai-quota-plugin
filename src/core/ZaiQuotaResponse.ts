import { z } from 'zod';

/**
 * ZaiQuotaData schema for quota API response data
 */
export const ZaiQuotaDataSchema = z.object({
  session_used: z.number(),
  session_total: z.number(),
  session_percent: z.number(),
  mcp_used: z.number(),
  mcp_total: z.number(),
  mcp_percent: z.number(),
  mcp_time_limit_used: z.number(),
  mcp_time_limit_total: z.number(),
  mcp_time_limit_percent: z.number(),
});

/**
 * Complete ZaiQuotaResponse schema
 */
export const ZaiQuotaResponseSchema = z.object({
  code: z.number(),
  msg: z.string(),
  success: z.boolean(),
  data: ZaiQuotaDataSchema,
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type ZaiQuotaData = z.infer<typeof ZaiQuotaDataSchema>;
export type ZaiQuotaResponse = z.infer<typeof ZaiQuotaResponseSchema>;

/**
 * Base ZaiQuotaError class
 */
export class ZaiQuotaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ZaiQuotaError';
    Object.setPrototypeOf(this, ZaiQuotaError.prototype);
  }
}

/**
 * Authentication error - invalid API key or token
 */
export class ZaiAuthenticationError extends ZaiQuotaError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'ZaiAuthenticationError';
    Object.setPrototypeOf(this, ZaiAuthenticationError.prototype);
  }
}

/**
 * Rate limit error - too many requests
 */
export class ZaiRateLimitError extends ZaiQuotaError {
  constructor(message: string, public readonly retryAfter?: number) {
    super(message, 'RATE_LIMIT');
    this.name = 'ZaiRateLimitError';
    Object.setPrototypeOf(this, ZaiRateLimitError.prototype);
  }
}

/**
 * Network error - connection or timeout issues
 */
export class ZaiNetworkError extends ZaiQuotaError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
    this.name = 'ZaiNetworkError';
    Object.setPrototypeOf(this, ZaiNetworkError.prototype);
  }
}

/**
 * Configuration error - invalid settings
 */
export class ZaiConfigError extends ZaiQuotaError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ZaiConfigError';
    Object.setPrototypeOf(this, ZaiConfigError.prototype);
  }
}

/**
 * Validation error - API response validation failed
 */
export class ZaiValidationError extends ZaiQuotaError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ZaiValidationError';
    Object.setPrototypeOf(this, ZaiValidationError.prototype);
  }
}
