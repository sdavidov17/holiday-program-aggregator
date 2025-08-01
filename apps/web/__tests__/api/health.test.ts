import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import liveHandler from '~/pages/api/health/live';
import readyHandler from '~/pages/api/health/ready';

// Mock the database module
jest.mock('~/server/db', () => ({
  db: {
    $queryRaw: jest.fn(),
  },
}));

import { db } from '~/server/db';

describe('/api/health/live', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with ok status', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await liveHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData).toMatchObject({
      status: 'ok',
      service: 'holiday-aggregator',
      version: expect.any(String),
      uptime: expect.any(Number),
      timestamp: expect.any(String),
    });
  });

  it('should include cache prevention headers', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await liveHandler(req, res);

    expect(res._getHeaders()).toMatchObject({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0',
    });
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await liveHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toMatchObject({
      'allow': ['GET'],
    });
  });
});

describe('/api/health/ready', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when database is healthy', async () => {
    // Mock successful database query
    (db.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await readyHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData).toMatchObject({
      status: 'ready',
      timestamp: expect.any(String),
      totalDuration: expect.any(Number),
      checks: {
        database: {
          status: 'healthy',
          duration: expect.any(Number),
        },
      },
    });
  });

  it('should return 503 when database is unhealthy', async () => {
    // Mock database error
    (db.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await readyHandler(req, res);

    expect(res._getStatusCode()).toBe(503);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData).toMatchObject({
      status: 'not_ready',
      checks: {
        database: {
          status: 'unhealthy',
          duration: expect.any(Number),
          error: 'Connection refused',
        },
      },
    });
  });

  it('should include cache prevention headers', async () => {
    (db.$queryRaw as jest.Mock).mockResolvedValueOnce([{ '?column?': 1 }]);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await readyHandler(req, res);

    expect(res._getHeaders()).toMatchObject({
      'cache-control': 'no-cache, no-store, must-revalidate',
      'pragma': 'no-cache',
      'expires': '0',
    });
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await readyHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it('should handle timeout gracefully', async () => {
    // Mock a database query that takes too long
    (db.$queryRaw as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 10000))
    );

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await readyHandler(req, res);

    expect(res._getStatusCode()).toBe(503);
    const jsonData = JSON.parse(res._getData());
    expect(jsonData.status).toBe('not_ready');
    expect(jsonData.totalDuration).toBeLessThan(6000); // Should timeout before 6 seconds
  }, 10000);
});