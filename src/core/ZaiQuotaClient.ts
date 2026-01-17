import axios, { AxiosError } from 'axios';
import { ZaiConfig } from './ZaiConfig';
import {
  ZaiQuotaResponse,
  ZaiQuotaResponseSchema,
  ZaiQuotaError,
  ZaiAuthenticationError,
  ZaiRateLimitError,
  ZaiNetworkError,
} from './ZaiQuotaResponse';
import { ZaiCache } from './ZaiCache';
import { logger } from '../utils/logger';

export { ZaiConfig, ZaiEndpoint, ZaiConfigOptions } from './ZaiConfig';
export {
  ZaiQuotaError,
  ZaiAuthenticationError,
  ZaiRateLimitError,
  ZaiNetworkError,
  ZaiConfigError,
} from './ZaiQuotaResponse';

/**
 * Options for creating a QuotaClient
 */
export interface QuotaClientOptions {
  config?: ZaiConfig;
  cache?: ZaiCache<ZaiQuotaResponse>;
}

/**
 * Main client for fetching Z.ai quota information
 */
export class ZaiQuotaClient {
  private config: ZaiConfig;
  private cache: ZaiCache<ZaiQuotaResponse> | null;

  constructor(options: QuotaClientOptions = {}) {
    this.config = options.config || new ZaiConfig();
    this.cache = this.config.isCacheEnabled()
      ? options.cache || new ZaiCache(this.config.getCacheTTL())
      : null;

    logger.debug('ZaiQuotaClient initialized', {
      endpoint: this.config.getEndpoint(),
      cacheEnabled: this.config.isCacheEnabled(),
      timeout: this.config.getTimeout(),
    });
  }

  /**
   * Fetch quota from API (with cache support)
   */
  async fetchQuota(): Promise<ZaiQuotaResponse> {
    // Check cache first
    if (this.cache) {
      const cached = this.cache.get('quota');
      if (cached) {
        logger.debug('Returning cached quota data');
        return cached;
      }
    }

    logger.info('Fetching quota from API...');

    try {
      const response = await axios.get<unknown>(this.config.getEndpoint(), {
        headers: {
          Authorization: `Bearer ${this.config.getApiKey()}`,
          Accept: 'application/json',
        },
        timeout: this.config.getTimeout(),
      });

      logger.debug('API response received', {
        status: response.status,
        data: response.data,
      });

      // Validate response structure
      const parsedResponse = ZaiQuotaResponseSchema.parse(response.data);

      // Check for API-level errors
      if (!parsedResponse.success) {
        if (parsedResponse.code === 1001 || parsedResponse.code === 1002) {
          throw new ZaiAuthenticationError(parsedResponse.msg || 'Authentication failed');
        }
        throw new ZaiQuotaError(
          parsedResponse.msg || 'API returned error',
          parsedResponse.code.toString()
        );
      }

      // Cache successful response
      if (this.cache) {
        this.cache.set('quota', parsedResponse);
        logger.debug('Quota data cached');
      }

      logger.info('Quota fetched successfully');
      return parsedResponse;
    } catch (error) {
      if (error instanceof ZaiQuotaError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          logger.error('API response error', {
            status: axiosError.response.status,
            data: axiosError.response.data,
          });

          if (axiosError.response.status === 401) {
            throw new ZaiAuthenticationError('Invalid API key');
          }
          if (axiosError.response.status === 429) {
            const retryAfter = axiosError.response.headers['retry-after'];
            throw new ZaiRateLimitError(
              'Rate limit exceeded',
              retryAfter ? parseInt(retryAfter, 10) : undefined
            );
          }
          throw new ZaiNetworkError(
            `HTTP ${axiosError.response.status}: ${axiosError.message}`
          );
        }
        if (axiosError.request) {
          logger.error('No response from server', {
            message: axiosError.message,
            code: axiosError.code,
          });
          throw new ZaiNetworkError('No response from server');
        }
        logger.error('Request error', { message: axiosError.message });
        throw new ZaiNetworkError(axiosError.message);
      }

      logger.error('Unknown error', error);
      throw new ZaiQuotaError(
        error instanceof Error ? error.message : 'Unknown error',
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  /**
   * Get quota summary with calculated metrics
   */
  async getQuotaSummary(): Promise<QuotaSummary> {
    const response = await this.fetchQuota();
    const data = response.data;

    return {
      sessions: {
        used: data.session_used,
        total: data.session_total,
        remaining: data.session_total - data.session_used,
        percentage: data.session_percent,
      },
      mcp: {
        used: data.mcp_used,
        total: data.mcp_total,
        remaining: data.mcp_total - data.mcp_used,
        percentage: data.mcp_percent,
      },
      mcpTimeLimit: {
        used: data.mcp_time_limit_used,
        total: data.mcp_time_limit_total,
        remaining: data.mcp_time_limit_total - data.mcp_time_limit_used,
        percentage: data.mcp_time_limit_percent,
      },
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
      logger.debug('Cache cleared');
    }
  }

  /**
   * Get config object (read-only)
   */
  getConfig(): ZaiConfig {
    return this.config;
  }
}

/**
 * Quota summary with calculated metrics
 */
export interface QuotaSummary {
  sessions: QuotaMetric;
  mcp: QuotaMetric;
  mcpTimeLimit: QuotaMetric;
}

/**
 * Individual quota metric
 */
export interface QuotaMetric {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
}
