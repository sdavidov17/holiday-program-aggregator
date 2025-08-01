import { type NextApiRequest, type NextApiResponse } from 'next';
import { db } from '~/server/db';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  duration: number;
  error?: string;
}

interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    // We'll add more checks as we integrate services
    // stripe: HealthCheckResult;
    // email: HealthCheckResult;
  };
  totalDuration: number;
}

// Timeout wrapper for health checks
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${name} health check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]);
}

// Database health check
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Simple query to verify database connectivity
    await db.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReadinessResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const startTime = Date.now();
  const timeout = 5000; // 5 second timeout for all checks

  try {
    // Run health checks with timeout
    const dbCheck = await withTimeout(checkDatabase(), timeout, 'database');

    // Determine overall readiness
    const isReady = dbCheck.status === 'healthy';

    const response: ReadinessResponse = {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck,
      },
      totalDuration: Date.now() - startTime,
    };

    // Set cache headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Return 503 if not ready, 200 if ready
    res.status(isReady ? 200 : 503).json(response);
  } catch (error) {
    // If we can't even run the health checks, service is not ready
    const response: ReadinessResponse = {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'unhealthy',
          duration: Date.now() - startTime,
          error: 'Health check failed to execute',
        },
      },
      totalDuration: Date.now() - startTime,
    };

    res.status(503).json(response);
  }
}