import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Generates a secure correlation ID
 */
function generateCorrelationId(): string {
  // Use crypto.randomUUID if available (most modern browsers/Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback to crypto.getRandomValues for older environments
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // This should not be reached in production but provides a clear error
  throw new Error('No secure random number generator available for correlation ID');
}

/**
 * Security headers to apply to all responses
 */
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Content Security Policy directives
 */
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Required for Next.js in dev mode
    "'unsafe-inline'", // Required for Next.js inline scripts
    'https://js.stripe.com', // Stripe
    'https://accounts.google.com', // Google OAuth
  ],
  'style-src': ["'self'", "'unsafe-inline'"], // Required for Tailwind/inline styles
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'"],
  'connect-src': [
    "'self'",
    'https://api.stripe.com', // Stripe API
    'https://accounts.google.com', // Google OAuth
    process.env.NODE_ENV === 'development' ? 'ws://localhost:3000' : '', // Hot reload in dev
  ].filter(Boolean),
  'frame-src': [
    'https://js.stripe.com', // Stripe
    'https://accounts.google.com', // Google OAuth
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

/**
 * Generates CSP header value from directives
 */
function generateCSP(): string {
  return Object.entries(cspDirectives)
    .map(([directive, values]) => {
      if (values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(' ')}`;
    })
    .join('; ');
}

export function middleware(request: NextRequest) {
  // Get or generate correlation ID
  const correlationId = request.headers.get('x-correlation-id') || generateCorrelationId();
  
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  
  // Create response with correlation ID
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add correlation ID to response headers
  response.headers.set('x-correlation-id', correlationId);
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add CSP header
  response.headers.set('Content-Security-Policy', generateCSP());
  
  // Add Strict-Transport-Security for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};