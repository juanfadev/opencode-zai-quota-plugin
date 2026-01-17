import { ZaiQuotaClient, QuotaMetric, QuotaSummary as ClientQuotaSummary, ZaiConfig } from '../../core/ZaiQuotaClient';
import { logger } from '../../utils/logger';
import { formatTime, formatStatus } from '../../utils/formatter';

/**
 * Options for quota check
 */
export interface QuotaCheckOptions {
  forceRefresh?: boolean;
}

/**
 * Quota thresholds for alerts
 */
export interface QuotaThresholds {
  sessions?: number;
  mcp?: number;
  mcpTimeLimit?: number;
}

/**
 * Quota metric with status
 */
export interface QuotaMetricWithStatus extends QuotaMetric {
  status: string;
}

/**
 * Quota check result with status
 */
export interface QuotaCheckResult {
  sessions: QuotaMetricWithStatus;
  mcp: QuotaMetricWithStatus;
  mcpTimeLimit: QuotaMetricWithStatus;
  overallStatus: string;
  timestamp: string;
}

/**
 * OpenCode Agent for Z.ai quota checking
 */
export class ZaiQuotaAgent {
  private client: ZaiQuotaClient;

  constructor(apiKey?: string, endpoint?: string) {
    const config = new ZaiConfig({
      apiKey,
      endpoint,
    });

    this.client = new ZaiQuotaClient({
      config,
    });
  }

  /**
   * Main method for OpenCode to invoke
   */
  async checkQuota(options: QuotaCheckOptions = {}): Promise<QuotaCheckResult> {
    logger.info('Checking Z.ai GLM quota...');

    try {
      if (options.forceRefresh) {
        this.client.clearCache();
      }

      const summary = await this.client.getQuotaSummary();
      const result = this.formatResult(summary);

      logger.info('Quota check completed successfully');
      return result;
    } catch (error) {
      logger.error('Quota check failed', error);
      throw error;
    }
  }

  /**
   * Get formatted quota information as string
   */
  async getFormattedQuota(): Promise<string> {
    const result = await this.checkQuota();
    return this.formatOutput(result);
  }

  /**
   * Check if quota is below threshold
   */
  async isQuotaLow(thresholdPercent: number = 20): Promise<boolean> {
    const result = await this.checkQuota();
    return (
      result.sessions.percentage < thresholdPercent ||
      result.mcp.percentage < thresholdPercent ||
      result.mcpTimeLimit.percentage < thresholdPercent
    );
  }

  /**
   * Get quota alerts if any thresholds are breached
   */
  async getQuotaAlerts(thresholds: QuotaThresholds = {}): Promise<string[]> {
    const result = await this.checkQuota();
    const alerts: string[] = [];

    const sessionThreshold = thresholds.sessions || 20;
    const mcpThreshold = thresholds.mcp || 20;
    const timeLimitThreshold = thresholds.mcpTimeLimit || 20;

    if (result.sessions.percentage < sessionThreshold) {
      alerts.push(
        `⚠️  Session quota low: ${result.sessions.percentage}% remaining (${result.sessions.remaining}/${result.sessions.total})`
      );
    }

    if (result.mcp.percentage < mcpThreshold) {
      alerts.push(
        `⚠️  MCP quota low: ${result.mcp.percentage}% remaining (${result.mcp.remaining}/${result.mcp.total})`
      );
    }

    if (result.mcpTimeLimit.percentage < timeLimitThreshold) {
      alerts.push(
        `⚠️  MCP time limit low: ${result.mcpTimeLimit.percentage}% remaining`
      );
    }

    return alerts;
  }

  /**
   * Format quota summary to result with status
   */
  private formatResult(summary: ClientQuotaSummary): QuotaCheckResult {
    return {
      sessions: {
        ...summary.sessions,
        status: formatStatus(summary.sessions.percentage),
      },
      mcp: {
        ...summary.mcp,
        status: formatStatus(summary.mcp.percentage),
      },
      mcpTimeLimit: {
        ...summary.mcpTimeLimit,
        status: formatStatus(summary.mcpTimeLimit.percentage),
      },
      overallStatus: this.getOverallStatus(summary),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format output to human-readable string
   */
  private formatOutput(result: QuotaCheckResult): string {
    const lines: string[] = [];

    lines.push('📊 Z.ai GLM Quota Status');
    lines.push('='.repeat(40));
    lines.push('');

    // Sessions
    lines.push('🎯 Sessions:');
    lines.push(`  Used: ${result.sessions.used}/${result.sessions.total} (${result.sessions.percentage}% remaining)`);
    lines.push(`  Status: ${result.sessions.status}`);
    lines.push('');

    // MCP Calls
    lines.push('🤖 MCP Calls:');
    lines.push(`  Used: ${result.mcp.used}/${result.mcp.total} (${result.mcp.percentage}% remaining)`);
    lines.push(`  Status: ${result.mcp.status}`);
    lines.push('');

    // MCP Time Limit
    lines.push('⏱️  MCP Time Limit:');
    lines.push(`  Used: ${formatTime(result.mcpTimeLimit.used)}/${formatTime(result.mcpTimeLimit.total)}`);
    lines.push(`  (${result.mcpTimeLimit.percentage}% remaining)`);
    lines.push(`  Status: ${result.mcpTimeLimit.status}`);
    lines.push('');

    // Overall status
    lines.push(`📈 Overall Status: ${result.overallStatus}`);
    lines.push(`🕐 Last Updated: ${new Date(result.timestamp).toLocaleString()}`);

    return lines.join('\n');
  }

  /**
   * Get overall status based on all metrics
   */
  private getOverallStatus(summary: ClientQuotaSummary): string {
    const minPercentage = Math.min(
      summary.sessions.percentage,
      summary.mcp.percentage,
      summary.mcpTimeLimit.percentage
    );
    return formatStatus(minPercentage);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.client.clearCache();
  }
}
