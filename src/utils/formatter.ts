import { QuotaMetric } from '../core/ZaiQuotaClient';

/**
 * Format quota status as emoji
 */
export function formatStatus(percentage: number): string {
  if (percentage < 10) return '🔴 Critical';
  if (percentage < 25) return '🟡 Low';
  if (percentage < 50) return '🟠 Moderate';
  return '🟢 Good';
}

/**
 * Format seconds to human-readable time
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return hours + 'h ' + minutes + 'm';
  }
  if (minutes > 0) {
    return minutes + 'm ' + secs + 's';
  }
  return secs + 's';
}

/**
 * Format quota summary to human-readable text
 */
export function formatQuotaSummary(summary: QuotaSummaryResult): string {
  const lines: string[] = [];

  lines.push('📊 Z.ai GLM Quota Status');
  lines.push('='.repeat(40));
  lines.push('');

  // Sessions
  lines.push('🎯 Sessions:');
  lines.push(`  Used: ${summary.sessions.used}/${summary.sessions.total} (${summary.sessions.percentage}% remaining)`);
  lines.push(`  Status: ${summary.sessions.status}`);
  lines.push('');

  // MCP Calls
  lines.push('🤖 MCP Calls:');
  lines.push(`  Used: ${summary.mcp.used}/${summary.mcp.total} (${summary.mcp.percentage}% remaining)`);
  lines.push(`  Status: ${summary.mcp.status}`);
  lines.push('');

  // MCP Time Limit
  lines.push('⏱️  MCP Time Limit:');
  lines.push(
    `  Used: ${formatTime(summary.mcpTimeLimit.used)}/${formatTime(summary.mcpTimeLimit.total)}`
  );
  lines.push(`  (${summary.mcpTimeLimit.percentage}% remaining)`);
  lines.push(`  Status: ${summary.mcpTimeLimit.status}`);
  lines.push('');

  // Overall status
  lines.push(`📈 Overall Status: ${summary.overallStatus}`);
  lines.push(`🕐 Last Updated: ${new Date(summary.timestamp).toLocaleString()}`);

  return lines.join('\n');
}

/**
 * Format quota alerts
 */
export function formatAlerts(alerts: string[]): string {
  if (alerts.length === 0) {
    return '✅ All quotas above threshold';
  }

  const lines: string[] = [chalk.yellow('⚠️  Quota Alerts:')];
  alerts.forEach(alert => lines.push(`  ${alert}`));
  return lines.join('\n');
}

/**
 * Colorize text based on status
 */
export function colorizeStatus(status: string): string {
  if (status.includes('Critical')) return chalk.red(status);
  if (status.includes('Low')) return chalk.yellow(status);
  if (status.includes('Moderate')) return chalk.hex('#FF9500')(status);
  return chalk.green(status);
}

/**
 * Format quota metric with color
 */
export function formatMetric(metric: QuotaMetricWithStatus): string {
  const percentage = metric.percentage.toFixed(1);
  const used = metric.used.toLocaleString();
  const total = metric.total.toLocaleString();
  const status = colorizeStatus(metric.status);

  return `${used}/${total} (${percentage}% - ${status})`;
}

// Import chalk dynamically for color support
import chalk from 'chalk';

/**
 * Quota summary result with status
 */
export interface QuotaSummaryResult {
  sessions: QuotaMetricWithStatus;
  mcp: QuotaMetricWithStatus;
  mcpTimeLimit: QuotaMetricWithStatus;
  overallStatus: string;
  timestamp: string;
}

/**
 * Quota metric with status
 */
export interface QuotaMetricWithStatus extends QuotaMetric {
  status: string;
}
