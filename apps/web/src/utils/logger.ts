import type { NextApiRequest } from 'next';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log level priority for filtering
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogContext {
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
  traceId?: string;
  spanId?: string;
  service?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// PII patterns to scrub from logs
const PII_PATTERNS: Array<{
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
}> = [
  // Email addresses
  {
    pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    replacement: '[REDACTED_EMAIL]',
  },
  // Phone numbers (Australian format)
  { pattern: /(\+?61|0)[2-9]\d{8}/g, replacement: '[REDACTED_PHONE]' },
  // Credit card numbers
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[REDACTED_CC]' },
  // Australian Tax File Numbers
  { pattern: /\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/g, replacement: '[REDACTED_TFN]' },
  // Names in common fields (updated to handle JSON structure)
  {
    pattern: /"((?:[\w.]+\.)?(?:name|firstName|lastName|fullName))"\s*:\s*"[^"]+"/gi,
    replacement: (_match: string, field: string) => `"${field}":"[REDACTED_NAME]"`,
  },
  // Addresses
  {
    pattern: /\d+\s+[\w\s]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Court|Ct|Lane|Ln)/gi,
    replacement: '[REDACTED_ADDRESS]',
  },
  // API keys and tokens (updated to handle JSON structure)
  {
    pattern: /"(api[_-]?key|apiKey|token|secret|password)"\s*:\s*"[^"]+"/gi,
    replacement: (_match: string, field: string) => `"${field}":"[REDACTED]"`,
  },
];

export interface LoggerOptions {
  environment?: string;
  service?: string;
  minLevel?: LogLevel;
  format?: 'json' | 'pretty';
  defaultContext?: Partial<LogContext>;
}

export class StructuredLogger {
  private environment: string;
  private service: string;
  private minLevel: LogLevel;
  private format: 'json' | 'pretty';
  private defaultContext: Partial<LogContext>;

  constructor(options: LoggerOptions = {}) {
    this.environment = options.environment || process.env.NODE_ENV || 'development';
    this.service = options.service || 'holiday-aggregator';
    this.minLevel = options.minLevel || (process.env.LOG_LEVEL as LogLevel) || 'info';
    this.format = options.format || (process.env.LOG_FORMAT as 'json' | 'pretty') || 'json';
    this.defaultContext = options.defaultContext || {};
  }

  /**
   * Creates a child logger with additional default context
   */
  child(serviceName: string, additionalContext?: Partial<LogContext>): StructuredLogger {
    return new StructuredLogger({
      environment: this.environment,
      service: serviceName,
      minLevel: this.minLevel,
      format: this.format,
      defaultContext: {
        ...this.defaultContext,
        ...additionalContext,
        parentService: this.service,
      },
    });
  }

  /**
   * Checks if a log level should be output based on minimum level
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  /**
   * Scrubs PII from any data object
   */
  private scrubPII(data: unknown): unknown {
    if (!data) return data;

    const jsonString = JSON.stringify(data);
    let scrubbed = jsonString;

    for (const { pattern, replacement } of PII_PATTERNS) {
      if (typeof replacement === 'string') {
        scrubbed = scrubbed.replace(pattern, replacement);
      } else {
        scrubbed = scrubbed.replace(pattern, replacement);
      }
    }

    try {
      return JSON.parse(scrubbed);
    } catch {
      return data;
    }
  }

  /**
   * Creates a log entry with proper structure
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context: Partial<LogContext>,
    data?: unknown,
    error?: Error,
  ): LogEntry {
    const fullContext: LogContext = {
      ...this.defaultContext,
      ...context,
      correlationId: context.correlationId || generateCorrelationId(),
      environment: this.environment,
      service: this.service,
    };

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: fullContext,
    };

    if (data) {
      entry.data = this.scrubPII(data) as Record<string, unknown>;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack:
          this.environment === 'development' || this.environment === 'test'
            ? error.stack
            : undefined,
      };
    }

    return entry;
  }

  /**
   * Formats log entry for pretty printing (development)
   */
  private formatPretty(entry: LogEntry): string {
    const levelColors: Record<LogLevel, string> = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m', // green
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} [${entry.context.service}] ${entry.message}`;

    if (entry.context.correlationId) {
      output += ` (${entry.context.correlationId.substring(0, 8)})`;
    }

    if (entry.data) {
      output += `\n  Data: ${JSON.stringify(entry.data, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n  ${entry.error.stack}`;
      }
    }

    return output;
  }

  /**
   * Outputs the log entry
   */
  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const output = this.format === 'pretty' ? this.formatPretty(entry) : JSON.stringify(entry);

    switch (entry.level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  debug(message: string, context: Partial<LogContext> = {}, data?: unknown): void {
    const entry = this.createLogEntry('debug', message, context, data);
    this.output(entry);
  }

  info(message: string, context: Partial<LogContext> = {}, data?: unknown): void {
    const entry = this.createLogEntry('info', message, context, data);
    this.output(entry);
  }

  warn(message: string, context: Partial<LogContext> = {}, data?: unknown): void {
    const entry = this.createLogEntry('warn', message, context, data);
    this.output(entry);
  }

  error(message: string, context: Partial<LogContext> = {}, error?: Error, data?: unknown): void {
    const entry = this.createLogEntry('error', message, context, data, error);
    this.output(entry);
  }

  /**
   * Log a security event (always logged regardless of level)
   */
  security(
    event: string,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry('warn', `[SECURITY] ${event}`, context, {
      ...data,
      securityEvent: true,
      eventType: event,
    });
    // Security events always output regardless of log level
    const output = this.format === 'pretty' ? this.formatPretty(entry) : JSON.stringify(entry);
    console.warn(output);
  }

  /**
   * Log an audit event (always logged regardless of level)
   */
  audit(
    action: string,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>,
  ): void {
    const entry = this.createLogEntry('info', `[AUDIT] ${action}`, context, {
      ...data,
      auditEvent: true,
      action,
    });
    // Audit events always output regardless of log level
    const output = this.format === 'pretty' ? this.formatPretty(entry) : JSON.stringify(entry);
    console.info(output);
  }
}

// Default logger instance
export const logger = new StructuredLogger();

/**
 * Creates a child logger for a specific service/module
 */
export function createLogger(serviceName: string, defaultContext?: Partial<LogContext>): StructuredLogger {
  return logger.child(serviceName, defaultContext);
}

/**
 * Extracts or generates a correlation ID from a request
 */
export function getCorrelationId(req: NextApiRequest): string {
  const correlationId = req.headers['x-correlation-id'] as string;
  return correlationId || generateCorrelationId();
}

/**
 * Generates a new correlation ID
 */
export function generateCorrelationId(): string {
  // Use crypto API for secure correlation IDs
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Server-side Node.js fallback
  if (typeof window === 'undefined') {
    const { randomBytes } = require('node:crypto');
    return randomBytes(16).toString('hex');
  }

  // Browser fallback using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('No secure random number generator available');
}
