/**
 * OpenCode Z.ai GLM Quota Plugin
 *
 * A comprehensive plugin for checking Z.ai (Zhipu AI) GLM API quota and usage statistics.
 * Supports both OpenCode integration and CLI usage.
 */

// Core exports
export { ZaiQuotaClient, QuotaSummary, QuotaMetric } from './core/ZaiQuotaClient';
export { ZaiConfig, ZaiEndpoint, ZaiConfigOptions } from './core/ZaiConfig';
export {
  ZaiQuotaResponse,
  ZaiQuotaData,
  ZaiQuotaError,
  ZaiAuthenticationError,
  ZaiRateLimitError,
  ZaiNetworkError,
  ZaiConfigError,
  ZaiValidationError,
} from './core/ZaiQuotaResponse';
export { ZaiCache } from './core/ZaiCache';

// Integration exports
export { ZaiQuotaAgent, QuotaCheckResult, QuotaCheckOptions, QuotaThresholds } from './integrations/opencode/ZaiQuotaAgent';

// Utility exports
export { Logger, LogLevel, logger } from './utils/logger';
export {
  formatStatus,
  formatTime,
  formatQuotaSummary,
  formatAlerts,
  colorizeStatus,
  formatMetric,
  QuotaSummaryResult,
  QuotaMetricWithStatus,
} from './utils/formatter';

// Version
export const version = '1.0.0';

/**
 * Main entry point for library usage
 */
export * from './core/ZaiQuotaClient';
export * from './core/ZaiConfig';
export * from './core/ZaiQuotaResponse';
export * from './core/ZaiCache';
export * from './integrations/opencode/ZaiQuotaAgent';
export * from './utils/logger';
export * from './utils/formatter';
