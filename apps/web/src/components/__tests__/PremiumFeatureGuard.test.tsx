import React from 'react';
import { render, screen } from '@testing-library/react';
import { PremiumFeatureGuard } from '../PremiumFeatureGuard';
import { useSubscriptionStatus } from '~/hooks/useSubscriptionStatus';
import { SubscriptionStatus } from '@prisma/client';

// Mock the useSubscriptionStatus hook
jest.mock('~/hooks/useSubscriptionStatus');

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockedLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

describe('PremiumFeatureGuard', () => {
  const mockUseSubscriptionStatus = useSubscriptionStatus as jest.MockedFunction<typeof useSubscriptionStatus>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    mockUseSubscriptionStatus.mockReturnValue({
      hasActiveSubscription: false,
      isExpired: false,
      isPending: false,
      isCanceled: false,
      expiresAt: null,
      isLoading: true,
      subscription: null,
    });

    render(
      <PremiumFeatureGuard>
        <div>Premium Content</div>
      </PremiumFeatureGuard>
    );

    // Check for loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
  });

  it('should show children when user has active subscription', () => {
    mockUseSubscriptionStatus.mockReturnValue({
      hasActiveSubscription: true,
      isExpired: false,
      isPending: false,
      isCanceled: false,
      expiresAt: new Date('2025-12-31'),
      isLoading: false,
      subscription: {
        status: SubscriptionStatus.ACTIVE,
        expiresAt: new Date('2025-12-31'),
        currentPeriodEnd: new Date('2025-12-31'),
        cancelAtPeriodEnd: false,
      },
    });

    render(
      <PremiumFeatureGuard>
        <div>Premium Content</div>
      </PremiumFeatureGuard>
    );

    expect(screen.getByText('Premium Content')).toBeInTheDocument();
    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
  });

  it('should show default fallback when no active subscription', () => {
    mockUseSubscriptionStatus.mockReturnValue({
      hasActiveSubscription: false,
      isExpired: true,
      isPending: false,
      isCanceled: false,
      expiresAt: new Date('2024-01-01'),
      isLoading: false,
      subscription: {
        status: SubscriptionStatus.EXPIRED,
        expiresAt: new Date('2024-01-01'),
        currentPeriodEnd: new Date('2024-01-01'),
        cancelAtPeriodEnd: false,
      },
    });

    render(
      <PremiumFeatureGuard>
        <div>Premium Content</div>
      </PremiumFeatureGuard>
    );

    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText('This feature requires an active subscription.')).toBeInTheDocument();
    expect(screen.getByText('Subscribe Now')).toBeInTheDocument();
  });

  it('should show custom fallback when provided', () => {
    mockUseSubscriptionStatus.mockReturnValue({
      hasActiveSubscription: false,
      isExpired: false,
      isPending: true,
      isCanceled: false,
      expiresAt: null,
      isLoading: false,
      subscription: {
        status: SubscriptionStatus.PENDING,
        expiresAt: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });

    const CustomFallback = () => <div>Custom Subscription Message</div>;

    render(
      <PremiumFeatureGuard fallback={<CustomFallback />}>
        <div>Premium Content</div>
      </PremiumFeatureGuard>
    );

    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Subscription Message')).toBeInTheDocument();
  });

  it('should handle canceled subscription as inactive', () => {
    mockUseSubscriptionStatus.mockReturnValue({
      hasActiveSubscription: false,
      isExpired: false,
      isPending: false,
      isCanceled: true,
      expiresAt: new Date('2025-01-01'),
      isLoading: false,
      subscription: {
        status: SubscriptionStatus.CANCELED,
        expiresAt: new Date('2025-01-01'),
        currentPeriodEnd: new Date('2025-01-01'),
        cancelAtPeriodEnd: true,
      },
    });

    render(
      <PremiumFeatureGuard>
        <div>Premium Content</div>
      </PremiumFeatureGuard>
    );

    expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
  });
});