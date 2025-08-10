import React from 'react';
import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import SearchPage from '../../pages/search';
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/head
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock PremiumFeatureGuard
jest.mock('~/components/PremiumFeatureGuard', () => ({
  PremiumFeatureGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useSubscriptionStatus hook
jest.mock('~/hooks/useSubscriptionStatus', () => ({
  useSubscriptionStatus: () => ({
    hasActiveSubscription: true,
    isLoading: false,
    isInTrial: false,
    needsRenewal: false,
    daysUntilExpiry: 30,
    expiresAt: new Date('2025-12-31'),
    subscription: {
      status: 'ACTIVE',
      expiresAt: new Date('2025-12-31'),
      currentPeriodEnd: new Date('2025-12-31'),
      cancelAtPeriodEnd: false,
    },
  }),
}));

// Mock tRPC API
jest.mock('~/utils/api', () => ({
  api: {
    subscription: {
      getStatus: {
        useQuery: jest.fn(() => ({
          data: {
            status: 'ACTIVE',
            expiresAt: new Date('2025-12-31'),
            currentPeriodEnd: new Date('2025-12-31'),
            cancelAtPeriodEnd: false,
          },
          isLoading: false,
        })),
      },
    },
  },
}));

describe('SearchPage', () => {
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER' as const,
    },
    expires: '2025-12-31',
  };

  beforeEach(() => {
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  it('renders the search page with title', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByText('Program Search')).toBeInTheDocument();
  });

  it('displays welcome message with user name', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByText(/Welcome Test User!/)).toBeInTheDocument();
  });

  it('renders search form fields', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Age Group')).toBeInTheDocument();
    expect(screen.getByLabelText('Activity Type')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search Programs' })).toBeInTheDocument();
  });

  it('shows back to profile link', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    const backLink = screen.getByText('Back to Profile');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/profile');
  });

  it('displays demo interface notice', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByText(/This is a demo search interface/)).toBeInTheDocument();
  });

  it('renders for unauthenticated users', () => {
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <SessionProvider session={null}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByText('Program Search')).toBeInTheDocument();
  });

  it('shows user email when name is not available', () => {
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({
      data: {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: null,
        },
      },
      status: 'authenticated',
    });

    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>
    );

    expect(screen.getByText(/Welcome test@example.com!/)).toBeInTheDocument();
  });
});