import { StructuredLogger } from '~/utils/logger';

describe('StructuredLogger', () => {
  let logger: StructuredLogger;
  let consoleSpy: {
    debug: jest.SpyInstance;
    info: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    logger = new StructuredLogger('test', 'test-service');
    consoleSpy = {
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PII Scrubbing', () => {
    it('should scrub email addresses', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        user: 'john.doe@example.com',
        message: 'Email sent to jane.smith@company.org',
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.user).toBe('[REDACTED_EMAIL]');
      expect(loggedData.data.message).toBe('Email sent to [REDACTED_EMAIL]');
    });

    it('should scrub phone numbers', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        phone: '0412345678',
        alternatePhone: '+61412345678',
        message: 'Call me on 0487654321',
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.phone).toBe('[REDACTED_PHONE]');
      expect(loggedData.data.alternatePhone).toBe('[REDACTED_PHONE]');
      expect(loggedData.data.message).toBe('Call me on [REDACTED_PHONE]');
    });

    it('should scrub credit card numbers', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        card: '4111 1111 1111 1111',
        cardNoSpaces: '4111111111111111',
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.card).toBe('[REDACTED_CC]');
      expect(loggedData.data.cardNoSpaces).toBe('[REDACTED_CC]');
    });

    it('should scrub names in common fields', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        name: 'John Doe',
        firstName: 'Jane',
        lastName: 'Smith',
        'user.fullName': 'Bob Johnson',
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.name).toBe('[REDACTED_NAME]');
      expect(loggedData.data.firstName).toBe('[REDACTED_NAME]');
      expect(loggedData.data.lastName).toBe('[REDACTED_NAME]');
      expect(loggedData.data['user.fullName']).toBe('[REDACTED_NAME]');
    });

    it('should scrub API keys and secrets', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        api_key: 'sk_test_FAKE_KEY_FOR_TESTING',
        apiKey: 'pk_live_FAKE_API_KEY',
        token: 'FAKE_JWT_TOKEN_FOR_TESTING',
        password: 'FAKE_PASSWORD_123',
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.api_key).toBe('[REDACTED]');
      expect(loggedData.data.apiKey).toBe('[REDACTED]');
      expect(loggedData.data.token).toBe('[REDACTED]');
      expect(loggedData.data.password).toBe('[REDACTED]');
    });

    it('should handle nested objects', () => {
      const context = { correlationId: 'test-123' };
      const data = {
        user: {
          email: 'test@example.com',
          profile: {
            phone: '0412345678',
            address: '123 Main Street',
          },
        },
      };

      logger.info('Test message', context, data);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.data.user.email).toBe('[REDACTED_EMAIL]');
      expect(loggedData.data.user.profile.phone).toBe('[REDACTED_PHONE]');
      expect(loggedData.data.user.profile.address).toBe('[REDACTED_ADDRESS]');
    });
  });

  describe('Log Levels', () => {
    it('should log at info level', () => {
      const context = { correlationId: 'test-123' };
      logger.info('Info message', context);

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.level).toBe('info');
      expect(loggedData.message).toBe('Info message');
    });

    it('should log at warn level', () => {
      const context = { correlationId: 'test-123' };
      logger.warn('Warning message', context);

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.warn.mock.calls[0][0]);
      expect(loggedData.level).toBe('warn');
    });

    it('should log at error level with error object', () => {
      const context = { correlationId: 'test-123' };
      const error = new Error('Test error');
      logger.error('Error message', context, error);

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleSpy.error.mock.calls[0][0]);
      expect(loggedData.level).toBe('error');
      expect(loggedData.error).toEqual({
        name: 'Error',
        message: 'Test error',
        stack: error.stack,
      });
    });

    it('should not log debug messages in production', () => {
      const prodLogger = new StructuredLogger('production', 'test-service');
      const context = { correlationId: 'test-123' };
      prodLogger.debug('Debug message', context);

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('Log Structure', () => {
    it('should include all context fields', () => {
      const context = {
        correlationId: 'test-123',
        userId: 'user-456',
        sessionId: 'session-789',
        journey: 'search',
      };
      logger.info('Test message', context);

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(loggedData.context).toMatchObject({
        ...context,
        environment: 'test',
        service: 'test-service',
      });
    });

    it('should include timestamp', () => {
      const context = { correlationId: 'test-123' };
      const before = new Date().toISOString();
      logger.info('Test message', context);
      const after = new Date().toISOString();

      const loggedData = JSON.parse(consoleSpy.info.mock.calls[0][0]);
      expect(new Date(loggedData.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
      expect(new Date(loggedData.timestamp).getTime()).toBeLessThanOrEqual(new Date(after).getTime());
    });
  });
});