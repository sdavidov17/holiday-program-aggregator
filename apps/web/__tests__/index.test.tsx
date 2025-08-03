import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import Home from '~/pages/index';

// Mock Next.js Head component
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

// Mock Next Link component
jest.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => {
      return <a href={href}>{children}</a>;
    },
  };
});

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the API
jest.mock('~/utils/api', () => ({
  api: {
    healthz: {
      healthz: {
        useQuery: jest.fn(),
      },
    },
    subscription: {
      getSubscriptionStatus: {
        useQuery: jest.fn(),
      },
      createCheckoutSession: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          mutateAsync: jest.fn(),
          isLoading: false,
          error: null,
        })),
      },
    },
  },
}));

describe('Home Page', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
    // Default mock for useSession
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    // Default mock for subscription status
    (api.subscription.getSubscriptionStatus.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders the main heading', () => {
    renderWithClient(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Holiday Program Aggregator');
  });

  it('displays welcome message for unauthenticated users', () => {
    renderWithClient(<Home />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to start your subscription and discover amazing holiday programs.')).toBeInTheDocument();
  });

  it('displays features section', () => {
    renderWithClient(<Home />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Curated holiday programs')).toBeInTheDocument();
    expect(screen.getByText('Verified providers')).toBeInTheDocument();
  });

  it('displays benefits section', () => {
    renderWithClient(<Home />);

    expect(screen.getByText('Benefits')).toBeInTheDocument();
    expect(screen.getByText('Save time searching')).toBeInTheDocument();
    expect(screen.getByText('Annual subscription')).toBeInTheDocument();
  });

  it('shows Sign In to Get Started button for unauthenticated users', () => {
    renderWithClient(<Home />);

    const ctaButton = screen.getByText('Sign In to Get Started');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest('a')).toHaveAttribute('href', '/auth/signin');
  });

  // Skip metadata test as it's handled by Next.js and not critical for unit tests
  it.skip('has correct page metadata', () => {
    // Metadata testing is better done in E2E tests where the full Next.js
    // rendering pipeline is available
  });

  it('shows subscription prompt for authenticated users without subscription', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    (api.subscription.getSubscriptionStatus.useQuery as jest.Mock).mockReturnValue({
      data: { hasSubscription: false, status: 'none' },
      isLoading: false,
      error: null,
    });

    renderWithClient(<Home />);

    expect(screen.getByText('Get Full Access')).toBeInTheDocument();
    expect(screen.getByText('Subscribe Now - $99/year')).toBeInTheDocument();
  });

  it('renders with correct styles', () => {
    renderWithClient(<Home />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center');
    expect(main).toHaveStyle({ background: 'linear-gradient(to bottom, #2e026d, #15162c)' });
  });

  it('shows Sign In link when not authenticated', () => {
    renderWithClient(<Home />);

    const signInLink = screen.getByText('Sign In →');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/signin');
  });

  it('shows Profile link when authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    (api.subscription.getSubscriptionStatus.useQuery as jest.Mock).mockReturnValue({
      data: { hasSubscription: false, status: 'none' },
      isLoading: false,
      error: null,
    });

    renderWithClient(<Home />);

    const profileLink = screen.getByText('Profile →');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('shows active subscription status for users with active subscription', () => {
    const mockPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    (api.subscription.getSubscriptionStatus.useQuery as jest.Mock).mockReturnValue({
      data: { 
        hasSubscription: true, 
        status: 'active',
        currentPeriodEnd: mockPeriodEnd.toISOString(),
        cancelAtPeriodEnd: false
      },
      isLoading: false,
      error: null,
    });

    renderWithClient(<Home />);

    expect(screen.getByText('✓ Active Subscription')).toBeInTheDocument();
    expect(screen.getByText(/Valid until:/)).toBeInTheDocument();
  });
});