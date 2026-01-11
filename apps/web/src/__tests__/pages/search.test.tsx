import { fireEvent, render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import type React from 'react';
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

// Mock next/router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    push: mockPush,
  }),
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
    provider: {
      search: {
        useQuery: jest.fn(() => ({
          data: {
            providers: [],
            totalCount: 0,
            hasMore: false,
            limit: 20,
            offset: 0,
          },
          isLoading: false,
          isFetching: false,
        })),
      },
    },
  },
}));

// Mock ProviderCard component
jest.mock('~/components/ui/ProviderCard', () => ({
  __esModule: true,
  default: ({ name }: { name: string }) => <div data-testid="provider-card">{name}</div>,
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
    jest.clearAllMocks();
    const { useSession } = require('next-auth/react');
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  it('renders the search page with header', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('Parent Pilot')).toBeInTheDocument();
  });

  it('renders search input field', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search programs...')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('renders filter sidebar on desktop', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Activity Type')).toBeInTheDocument();
    expect(screen.getByText('Age Group')).toBeInTheDocument();
    expect(screen.getByText('Program Dates')).toBeInTheDocument();
  });

  it('renders activity categories as checkboxes', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('Sports')).toBeInTheDocument();
    expect(screen.getByText('Arts & Crafts')).toBeInTheDocument();
    expect(screen.getByText('Educational')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders age group radio buttons', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('All ages')).toBeInTheDocument();
    expect(screen.getByText('3-5 years')).toBeInTheDocument();
    expect(screen.getByText('6-8 years')).toBeInTheDocument();
  });

  it('shows no results message when no providers found', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByTestId('no-results-message')).toBeInTheDocument();
    expect(screen.getByText('No programs found')).toBeInTheDocument();
  });

  it('displays provider cards when results are returned', () => {
    const { api } = require('~/utils/api');
    (api.provider.search.useQuery as jest.Mock).mockReturnValue({
      data: {
        providers: [
          {
            id: 'provider-1',
            businessName: 'Test Provider',
            description: 'Test description',
            suburb: 'Sydney',
            state: 'NSW',
            isVetted: true,
            logoUrl: null,
            programs: [{ category: 'Sports' }],
          },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      },
      isLoading: false,
      isFetching: false,
    });

    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getAllByTestId('provider-card').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Provider')).toBeInTheDocument();
  });

  it('shows result count', () => {
    const { api } = require('~/utils/api');
    (api.provider.search.useQuery as jest.Mock).mockReturnValue({
      data: {
        providers: [
          {
            id: 'provider-1',
            businessName: 'Test Provider',
            description: 'Test description',
            suburb: 'Sydney',
            state: 'NSW',
            isVetted: true,
            logoUrl: null,
            programs: [],
          },
        ],
        totalCount: 1,
        hasMore: false,
        limit: 20,
        offset: 0,
      },
      isLoading: false,
      isFetching: false,
    });

    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('1 program found')).toBeInTheDocument();
  });

  it('handles search form submission', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'soccer' } });

    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    expect(mockPush).toHaveBeenCalledWith(
      { pathname: '/search', query: { query: 'soccer' } },
      undefined,
      { shallow: true },
    );
  });

  it('shows loading state', () => {
    const { api } = require('~/utils/api');
    (api.provider.search.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
    });

    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('Searching...')).toBeInTheDocument();
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
      </SessionProvider>,
    );

    expect(screen.getByText('Parent Pilot')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows user name in header when authenticated', () => {
    render(
      <SessionProvider session={mockSession}>
        <SearchPage />
      </SessionProvider>,
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
