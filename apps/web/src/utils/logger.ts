import type { NextApiRequest } from 'next';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown; // Allow additional properties
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

export class StructuredLogger {
  private environment: string;
  private service: string;

  constructor(environment = process.env.NODE_ENV || 'development', service = 'holiday-aggregator') {
    this.environment = environment;
    this.service = service;
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
      // If we can't parse it back, return the original data
      // but log a warning
      console.warn('Failed to parse scrubbed data, returning original');
      return data;
    }
  }

  /**
   * Creates a log entry with proper structure
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext,
    data?: unknown,
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...context,
        environment: this.environment,
        service: this.service,
      } as LogContext,
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
   * Outputs the log entry
   */
  private output(entry: LogEntry): void {
    const json = JSON.stringify(entry);

    // In production, we'd send this to a log aggregation service
    // For now, we'll use console methods based on level
    switch (entry.level) {
      case 'debug':
        if (this.environment === 'development') {
          console.debug(json);
        }
        break;
      case 'info':
        console.info(json);
        break;
      case 'warn':
        console.warn(json);
        break;
      case 'error':
        console.error(json);
        break;
    }
  }

  debug(message: string, context: LogContext, data?: unknown): void {
    const entry = this.createLogEntry('debug', message, context, data);
    this.output(entry);
  }

  info(message: string, context: LogContext, data?: unknown): void {
    const entry = this.createLogEntry('info', message, context, data);
    this.output(entry);
  }

  warn(message: string, context: LogContext, data?: unknown): void {
    const entry = this.createLogEntry('warn', message, context, data);
    this.output(entry);
  }

  error(message: string, context: LogContext, error?: Error, data?: unknown): void {
    const entry = this.createLogEntry('error', message, context, data, error);
    this.output(entry);
  }
}

// Default logger instance
export const logger = new StructuredLogger();

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
