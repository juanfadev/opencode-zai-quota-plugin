/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(prefix: string = 'ZaiQuota') {
    this.prefix = prefix;
    this.level = this.parseLevel(process.env.LOG_LEVEL);
  }

  /**
   * Parse log level from string
   */
  private parseLevel(level?: string): LogLevel {
    const levelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
    };

    return levelMap[(level || 'info').toLowerCase()] || LogLevel.INFO;
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Check if a level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  /**
   * Format log message
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.prefix}] ${message}`;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage('DEBUG', message);
      if (data !== undefined) {
        console.debug(formatted, data);
      } else {
        console.debug(formatted);
      }
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage('INFO', message);
      if (data !== undefined) {
        console.info(formatted, data);
      } else {
        console.info(formatted);
      }
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage('WARN', message);
      if (data !== undefined) {
        console.warn(formatted, data);
      } else {
        console.warn(formatted);
      }
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage('ERROR', message);
      if (error !== undefined) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  }

  /**
   * Create a child logger with a different prefix
   */
  child(prefix: string): Logger {
    const child = new Logger(prefix);
    child.setLevel(this.level);
    return child;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger('ZaiQuota');
