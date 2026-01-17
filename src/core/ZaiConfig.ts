import * as dotenv from 'dotenv';
import { ZaiConfigError } from './ZaiQuotaResponse';

/**
 * Z.ai API endpoints
 */
export enum ZaiEndpoint {
  INTERNATIONAL = 'https://api.z.ai/api/monitor/usage/quota/limit',
  DOMESTIC = 'https://open.bigmodel.cn/api/monitor/usage/quota/limit',
}

/**
 * Configuration options for ZaiQuotaClient
 */
export interface ZaiConfigOptions {
  apiKey?: string;
  endpoint?: ZaiEndpoint | string;
  timeout?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

/**
 * Configuration management class
 */
export class ZaiConfig {
  private apiKey: string;
  private endpoint: string;
  private timeout: number;
  private cacheEnabled: boolean;
  private cacheTTL: number;

  constructor(options: ZaiConfigOptions = {}) {
    // Load environment variables
    dotenv.config();

    // Priority: options parameter > environment variables > defaults
    this.apiKey = options.apiKey || process.env.ZAI_API_KEY || '';
    this.endpoint = options.endpoint || process.env.ZAI_ENDPOINT || ZaiEndpoint.INTERNATIONAL;
    this.timeout = options.timeout || parseInt(process.env.ZAI_TIMEOUT || '10000', 10);
    this.cacheEnabled = options.cacheEnabled ?? (process.env.ZAI_CACHE_ENABLED !== 'false');
    this.cacheTTL = options.cacheTTL || parseInt(process.env.ZAI_CACHE_TTL || '300', 10);

    this.validate();
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    if (!this.apiKey) {
      throw new ZaiConfigError(
        'API key is required. Set ZAI_API_KEY environment variable or pass apiKey option.'
      );
    }

    if (!this.endpoint) {
      throw new ZaiConfigError('Endpoint is required');
    }

    if (this.timeout <= 0) {
      throw new ZaiConfigError('Timeout must be positive');
    }

    if (this.cacheTTL <= 0) {
      throw new ZaiConfigError('Cache TTL must be positive');
    }
  }

  /**
   * Get API key
   */
  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Get API endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Get request timeout in milliseconds
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Check if caching is enabled
   */
  isCacheEnabled(): boolean {
    return this.cacheEnabled;
  }

  /**
   * Get cache TTL in seconds
   */
  getCacheTTL(): number {
    return this.cacheTTL;
  }

  /**
   * Create config from JSON file
   */
  static fromConfigFile(configPath: string): ZaiConfig {
    try {
      const fs = require('fs');
      if (!fs.existsSync(configPath)) {
        throw new ZaiConfigError(`Config file not found: ${configPath}`);
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return new ZaiConfig(config);
    } catch (error) {
      if (error instanceof ZaiConfigError) {
        throw error;
      }
      throw new ZaiConfigError(`Failed to load config file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create config from environment file
   */
  static fromEnvFile(envPath: string): ZaiConfig {
    dotenv.config({ path: envPath });
    return new ZaiConfig();
  }

  /**
   * Convert config to plain object (for serialization, excluding sensitive data)
   */
  toSafeObject(): Record<string, unknown> {
    return {
      endpoint: this.endpoint,
      timeout: this.timeout,
      cacheEnabled: this.cacheEnabled,
      cacheTTL: this.cacheTTL,
      apiKey: this.apiKey ? `${this.apiKey.substring(0, 8)}...` : '',
    };
  }
}
