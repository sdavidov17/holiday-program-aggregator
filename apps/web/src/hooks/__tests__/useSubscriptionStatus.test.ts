import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { SubscriptionStatus } from '~/server/db';
import { api } from '~/utils/api';
import { useSubscriptionStatus } from '../useSubscriptionStatus';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('~/utils/api', () => ({
  api: {
    subscription: {
      getStatus: {
        useQuery: jest.fn(),
      },
    },
  },
}));

describe('useSubscriptionStatus', () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
  const mockUseQuery = api.subscription.getStatus.useQuery as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct status for active subscription', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    const mockSubscription = {
      status: SubscriptionStatus.ACTIVE,
      expiresAt: new Date('2025-12-31'),
      currentPeriodEnd: new Date('2025-12-31'),
      cancelAtPeriodEnd: false,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.hasActiveSubscription).toBe(true);
    expect(result.current.isInTrial).toBe(false);
    expect(result.current.needsRenewal).toBe(false);
    expect(result.current.daysUntilExpiry).toBeGreaterThan(0);
    expect(result.current.expiresAt).toEqual(new Date('2025-12-31'));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.subscription).toEqual(mockSubscription);
  });

  it('should return correct status for expired subscription', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    const mockSubscription = {
      status: SubscriptionStatus.CANCELED,
      expiresAt: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-01-01'),
      cancelAtPeriodEnd: false,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.hasActiveSubscription).toBe(false);
    expect(result.current.isInTrial).toBe(false);
    expect(result.current.needsRenewal).toBe(true);
    expect(result.current.daysUntilExpiry).toBeLessThan(0);
  });

  it('should return correct status for pending subscription', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    const mockSubscription = {
      status: SubscriptionStatus.PENDING,
      expiresAt: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.hasActiveSubscription).toBe(false);
    expect(result.current.isInTrial).toBe(false);
    expect(result.current.needsRenewal).toBe(true);
    expect(result.current.daysUntilExpiry).toBeNull();
  });

  it('should return correct status for canceled subscription', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    const mockSubscription = {
      status: SubscriptionStatus.CANCELED,
      expiresAt: new Date('2024-01-01'),
      currentPeriodEnd: new Date('2024-01-01'),
      cancelAtPeriodEnd: true,
    };

    mockUseQuery.mockReturnValue({
      data: mockSubscription,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.hasActiveSubscription).toBe(false);
    expect(result.current.isInTrial).toBe(false);
    expect(result.current.needsRenewal).toBe(true);
    expect(result.current.daysUntilExpiry).toBeLessThan(0);
  });

  it('should not fetch when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    const mockUseQueryImpl = jest.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    mockUseQuery.mockImplementation(mockUseQueryImpl);

    renderHook(() => useSubscriptionStatus());

    // Verify that useQuery was called with enabled: false
    expect(mockUseQueryImpl).toHaveBeenCalledWith(undefined, { enabled: false });
  });

  it('should handle loading state', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
      isFetching: true,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasActiveSubscription).toBe(false);
    expect(result.current.subscription).toBeUndefined();
  });

  it('should handle no subscription data', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'USER' as const },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useSubscriptionStatus());

    expect(result.current.hasActiveSubscription).toBe(false);
    expect(result.current.isInTrial).toBe(false);
    expect(result.current.needsRenewal).toBe(false);
    expect(result.current.daysUntilExpiry).toBeNull();
    expect(result.current.expiresAt).toBeUndefined();
    expect(result.current.subscription).toBeNull();
  });
});
