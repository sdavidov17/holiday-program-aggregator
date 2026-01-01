/**
 * Email Service Test Suite
 * Tests for sending renewal reminders and expiration notices via Resend
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';

describe('Email Service', () => {
  // Mock functions
  let mockResendSend: jest.Mock;
  let mockRender: jest.Mock;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('When Resend is configured', () => {
    let sendRenewalReminder: typeof import('../email').sendRenewalReminder;
    let sendExpirationNotice: typeof import('../email').sendExpirationNotice;

    beforeEach(async () => {
      jest.resetModules();

      // Create fresh mocks
      mockResendSend = jest.fn();
      mockRender = jest.fn().mockResolvedValue('<html>Rendered Email</html>');

      // Mock Resend
      jest.doMock('resend', () => ({
        Resend: jest.fn().mockImplementation(() => ({
          emails: {
            send: mockResendSend,
          },
        })),
      }));

      // Mock @react-email/render
      jest.doMock('@react-email/render', () => ({
        render: mockRender,
      }));

      // Mock email templates
      jest.doMock('../../../emails/subscription-renewal-reminder', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue({ type: 'RenewalReminderEmail' }),
      }));

      jest.doMock('../../../emails/subscription-expiration-notice', () => ({
        __esModule: true,
        default: jest.fn().mockReturnValue({ type: 'ExpirationNoticeEmail' }),
      }));

      // Mock env with Resend API key
      jest.doMock('~/env.mjs', () => ({
        env: {
          RESEND_API_KEY: 're_test_api_key',
        },
      }));

      const emailModule = await import('../email');
      sendRenewalReminder = emailModule.sendRenewalReminder;
      sendExpirationNotice = emailModule.sendExpirationNotice;
    });

    describe('sendRenewalReminder', () => {
      const testData = {
        userName: 'Test User',
        expirationDate: '2025-01-15',
        renewalUrl: 'https://example.com/renew',
      };

      it('should render the email template with provided data', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await sendRenewalReminder('test@example.com', testData);

        expect(mockRender).toHaveBeenCalledWith({ type: 'RenewalReminderEmail' });
      });

      it('should send email with correct parameters', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await sendRenewalReminder('test@example.com', testData);

        expect(mockResendSend).toHaveBeenCalledWith({
          from: 'Holiday Programs <noreply@holidayprograms.com.au>',
          to: 'test@example.com',
          subject: 'Your subscription expires in 7 days',
          html: '<html>Rendered Email</html>',
        });
      });

      it('should throw error when email send fails', async () => {
        mockResendSend.mockResolvedValue({
          error: { message: 'Invalid recipient' },
        });

        await expect(sendRenewalReminder('invalid@example.com', testData)).rejects.toThrow(
          'Failed to send renewal reminder: Invalid recipient',
        );
      });

      it('should complete successfully when email sends without error', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await expect(sendRenewalReminder('test@example.com', testData)).resolves.toBeUndefined();
      });
    });

    describe('sendExpirationNotice', () => {
      const testData = {
        userName: 'Test User',
        expiredDate: '2025-01-08',
        renewalUrl: 'https://example.com/renew',
      };

      it('should render the email template with provided data', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await sendExpirationNotice('test@example.com', testData);

        expect(mockRender).toHaveBeenCalledWith({ type: 'ExpirationNoticeEmail' });
      });

      it('should send email with correct parameters', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await sendExpirationNotice('test@example.com', testData);

        expect(mockResendSend).toHaveBeenCalledWith({
          from: 'Holiday Programs <noreply@holidayprograms.com.au>',
          to: 'test@example.com',
          subject: 'Your subscription has expired',
          html: '<html>Rendered Email</html>',
        });
      });

      it('should throw error when email send fails', async () => {
        mockResendSend.mockResolvedValue({
          error: { message: 'Rate limit exceeded' },
        });

        await expect(sendExpirationNotice('test@example.com', testData)).rejects.toThrow(
          'Failed to send expiration notice: Rate limit exceeded',
        );
      });

      it('should complete successfully when email sends without error', async () => {
        mockResendSend.mockResolvedValue({ error: null });

        await expect(sendExpirationNotice('test@example.com', testData)).resolves.toBeUndefined();
      });
    });
  });

  describe('When Resend is NOT configured', () => {
    let sendRenewalReminder: typeof import('../email').sendRenewalReminder;
    let sendExpirationNotice: typeof import('../email').sendExpirationNotice;

    beforeEach(async () => {
      jest.resetModules();

      // Mock env without Resend API key
      jest.doMock('~/env.mjs', () => ({
        env: {
          RESEND_API_KEY: undefined,
        },
      }));

      // Mock Resend (won't be instantiated)
      jest.doMock('resend', () => ({
        Resend: jest.fn(),
      }));

      // Mock other dependencies
      jest.doMock('@react-email/render', () => ({
        render: jest.fn(),
      }));

      jest.doMock('../../../emails/subscription-renewal-reminder', () => ({
        __esModule: true,
        default: jest.fn(),
      }));

      jest.doMock('../../../emails/subscription-expiration-notice', () => ({
        __esModule: true,
        default: jest.fn(),
      }));

      const emailModule = await import('../email');
      sendRenewalReminder = emailModule.sendRenewalReminder;
      sendExpirationNotice = emailModule.sendExpirationNotice;

      // Re-spy after module reset
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    describe('sendRenewalReminder', () => {
      it('should log warning and return early without sending', async () => {
        const testData = {
          userName: 'Test User',
          expirationDate: '2025-01-15',
          renewalUrl: 'https://example.com/renew',
        };

        await sendRenewalReminder('test@example.com', testData);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Resend not configured, skipping email send',
        );
      });

      it('should not throw error when Resend is not configured', async () => {
        const testData = {
          userName: 'Test User',
          expirationDate: '2025-01-15',
          renewalUrl: 'https://example.com/renew',
        };

        await expect(sendRenewalReminder('test@example.com', testData)).resolves.toBeUndefined();
      });
    });

    describe('sendExpirationNotice', () => {
      it('should log warning and return early without sending', async () => {
        const testData = {
          userName: 'Test User',
          expiredDate: '2025-01-08',
          renewalUrl: 'https://example.com/renew',
        };

        await sendExpirationNotice('test@example.com', testData);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Resend not configured, skipping email send',
        );
      });

      it('should not throw error when Resend is not configured', async () => {
        const testData = {
          userName: 'Test User',
          expiredDate: '2025-01-08',
          renewalUrl: 'https://example.com/renew',
        };

        await expect(sendExpirationNotice('test@example.com', testData)).resolves.toBeUndefined();
      });
    });
  });
});
