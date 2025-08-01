import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '~/middleware';

// Mock NextResponse.next to return a proper response
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      next: jest.fn((init?: any) => {
        const response = new Response(null, { status: 200 });
        // Apply request headers if provided
        if (init?.request?.headers) {
          init.request.headers.forEach((value: string, key: string) => {
            response.headers.set(key, value);
          });
        }
        return response;
      }),
    },
  };
});

describe('Middleware', () => {
  describe('Correlation ID', () => {
    it('should add correlation ID to request and response', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const correlationId = response.headers.get('x-correlation-id');
      expect(correlationId).toBeTruthy();
      expect(correlationId).toMatch(/^\d+-[a-z0-9]{9}$/);
    });

    it('should preserve existing correlation ID', () => {
      const existingId = 'existing-correlation-id';
      const request = new NextRequest(new Request('http://localhost:3000/', {
        headers: {
          'x-correlation-id': existingId,
        },
      }));
      
      const response = middleware(request);
      expect(response.headers.get('x-correlation-id')).toBe(existingId);
    });
  });

  describe('Security Headers', () => {
    it('should add X-Frame-Options header', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should add X-Content-Type-Options header', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should add X-XSS-Protection header', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should add Referrer-Policy header', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should add Permissions-Policy header', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
    });

    it('should not add HSTS header in development', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBeNull();

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('should add HSTS header in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });
  });

  describe('Content Security Policy', () => {
    it('should add CSP header with all directives', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toBeTruthy();

      // Check for key directives
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
      expect(csp).toContain("img-src 'self' data: https: blob:");
      expect(csp).toContain("font-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain('upgrade-insecure-requests');
    });

    it('should include Stripe sources in CSP', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://js.stripe.com');
      expect(csp).toContain('https://api.stripe.com');
    });

    it('should include Google OAuth sources in CSP', () => {
      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://accounts.google.com');
    });

    it('should include WebSocket in development', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
      });

      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('ws://localhost:3000');

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });

    it('should not include WebSocket in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true,
      });

      const request = new NextRequest(new Request('http://localhost:3000/'));
      const response = middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).not.toContain('ws://localhost:3000');

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true,
      });
    });
  });
});