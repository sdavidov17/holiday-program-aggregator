import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  correlationId: string;
  userId?: string;
  sessionId?: string;
  journey?: string;
  startTime: number;
}

// Create AsyncLocalStorage instance for request context
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Runs a function with the given request context
 */
export function withRequestContext<T>(
  context: RequestContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return requestContextStorage.run(context, fn);
}

/**
 * Gets the current request context
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Gets the current correlation ID from context
 */
export function getCurrentCorrelationId(): string | undefined {
  const context = getRequestContext();
  return context?.correlationId;
}

/**
 * Updates the current request context with additional data
 */
export function updateRequestContext(updates: Partial<RequestContext>): void {
  const currentContext = getRequestContext();
  if (currentContext) {
    Object.assign(currentContext, updates);
  }
}