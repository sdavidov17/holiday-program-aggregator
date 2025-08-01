import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

  it('has correct page metadata', () => {
    const mockUseQuery = api.healthz.healthz.useQuery as jest.Mock;
    mockUseQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: null,
    });

    const { container } = renderWithClient(<Home />);

    // Since we're mocking Head, we can verify the title element exists in the mocked component
    const titleElement = container.querySelector('title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Holiday Program Aggregator');
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
});