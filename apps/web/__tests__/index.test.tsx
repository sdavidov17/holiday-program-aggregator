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
  });

  const renderWithClient = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('renders the main heading', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Holiday Program Aggregator');
  });

  it('displays loading state when health check is loading', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state when health check fails', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    const errorMessage = 'Network error';
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: { message: errorMessage },
      data: null,
    });

    renderWithClient(<Home />);

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });

  it('displays health check data when successful', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    const mockTimestamp = '2024-01-01T00:00:00.000Z';
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        status: 'ok',
        timestamp: mockTimestamp,
      },
    });

    renderWithClient(<Home />);

    expect(screen.getByText('Status: ok')).toBeInTheDocument();
    expect(screen.getByText(/Time:/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(new Date(mockTimestamp).toLocaleString()))).toBeInTheDocument();
  });

  it('renders the health check card', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    expect(screen.getByText('Health Check →')).toBeInTheDocument();
  });

  // Skip metadata test as it's handled by Next.js and not critical for unit tests
  it.skip('has correct page metadata', () => {
    // Metadata testing is better done in E2E tests where the full Next.js
    // rendering pipeline is available
  });

  it('calls useQuery with correct options', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    expect(mockUseQuery).toHaveBeenCalledWith(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });
  });

  it('renders with correct styles', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center');
    expect(main).toHaveStyle({ background: 'linear-gradient(to bottom, #2e026d, #15162c)' });
  });

  it('shows Sign In link when not authenticated', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    renderWithClient(<Home />);

    const signInLink = screen.getByText('Sign In →');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink.closest('a')).toHaveAttribute('href', '/auth/signin');
  });

  it('shows Profile link when authenticated', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com' },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    renderWithClient(<Home />);

    const profileLink = screen.getByText('Profile →');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
  });
});