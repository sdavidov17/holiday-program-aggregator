import { createMocks } from 'node-mocks-http';
import handler from '../subscription-lifecycle';
import { processSubscriptionLifecycle } from '~/services/subscription-lifecycle';
import { env } from '~/env.mjs';

jest.mock('~/services/subscription-lifecycle');
jest.mock('~/env.mjs', () => ({
  env: {
    CRON_SECRET: 'test-secret'
  }
}));

describe('/api/cron/subscription-lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Method not allowed' });
  });

  it('should require authorization header', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
  });

  it('should reject invalid authorization', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Unauthorized' });
  });

  it('should process lifecycle when authorized', async () => {
    const mockResult = {
      reminders: 5,
      expired: 2,
      errors: [],
    };

    (processSubscriptionLifecycle as jest.Mock).mockResolvedValue(mockResult);

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      processed: mockResult,
    });
    expect(processSubscriptionLifecycle).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    (processSubscriptionLifecycle as jest.Mock).mockRejectedValue(
      new Error('Processing failed')
    );

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-secret',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: 'Processing failed',
    });
  });
});