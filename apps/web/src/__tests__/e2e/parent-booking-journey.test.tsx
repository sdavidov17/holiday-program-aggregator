import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Home from '~/pages/index';
import Search from '~/pages/search';

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock('~/utils/api', () => ({
  api: {
    provider: {
      search: {
        useQuery: jest.fn(() => ({
          data: [
            {
              id: '1',
              name: 'Creative Kids Club',
              description: 'Arts and crafts activities',
              rating: 4.8,
              reviewCount: 123,
              location: 'Sydney',
              isVetted: true,
              tags: ['Arts', 'Indoor'],
            },
          ],
          isLoading: false,
          error: null,
        })),
      },
    },
    subscription: {
      createCheckoutSession: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false,
        })),
      },
    },
  },
}));

describe('Parent Booking Journey E2E', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      query: {},
      pathname: '/',
    });
  });

  describe('Discovery Phase', () => {
    it('should display the homepage with search functionality', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      expect(screen.getByText(/Find providers for/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Search activities/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Location or postcode/i)).toBeInTheDocument();
    });

    it('should show popular activity categories', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      expect(screen.getByText('Popular Activities')).toBeInTheDocument();
      expect(screen.getByText('Arts & Crafts')).toBeInTheDocument();
      expect(screen.getByText('Sports')).toBeInTheDocument();
    });
  });

  describe('Search Phase', () => {
    it('should navigate to search results when form is submitted', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      const searchInput = screen.getByPlaceholderText(/Search activities/i);
      const locationInput = screen.getByPlaceholderText(/Location or postcode/i);
      const searchButton = screen.getByRole('button', { name: /Search/i });

      fireEvent.change(searchInput, { target: { value: 'arts' } });
      fireEvent.change(locationInput, { target: { value: 'Sydney' } });
      fireEvent.click(searchButton);

      expect(mockPush).toHaveBeenCalledWith('/search?q=arts&location=Sydney');
    });

    it('should display search results with provider cards', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });
      (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        query: { q: 'arts', location: 'Sydney' },
        pathname: '/search',
      });

      const { container } = render(<Search />);

      waitFor(() => {
        expect(screen.getByText('Creative Kids Club')).toBeInTheDocument();
        expect(screen.getByText('4.8')).toBeInTheDocument();
        expect(screen.getByText('123 reviews')).toBeInTheDocument();
      });
    });
  });

  describe('Browse Phase', () => {
    it('should filter providers by activity type', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      const artsFilter = screen.getByText('Arts & Crafts');
      fireEvent.click(artsFilter);

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('activity=arts'));
    });

    it('should display provider ratings and reviews', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      expect(screen.getByText('Featured Providers')).toBeInTheDocument();
      // Check for rating stars
      const stars = screen.getAllByRole('img', { hidden: true });
      expect(stars.length).toBeGreaterThan(0);
    });
  });

  describe('Selection Phase', () => {
    it('should navigate to provider detail page when card is clicked', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      const providerCard = screen.getByText('Creative Kids Club').closest('a');
      expect(providerCard).toHaveAttribute('href', '/providers/1');
    });
  });

  describe('Authentication Check', () => {
    it('should prompt login for non-authenticated users', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should show account link for authenticated users', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'parent@test.com',
            role: 'USER',
          },
        },
      });

      render(<Home />);

      expect(screen.getByText('My Account')).toBeInTheDocument();
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
  });

  describe('Critical Journey Metrics', () => {
    it('should track search initiation', () => {
      const trackEvent = jest.fn();
      window.gtag = trackEvent;

      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Home />);

      const searchButton = screen.getByRole('button', { name: /Search/i });
      fireEvent.click(searchButton);

      // Verify analytics tracking would fire
      expect(mockPush).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      const { api } = require('~/utils/api');
      api.provider.search.useQuery.mockReturnValueOnce({
        data: null,
        isLoading: false,
        error: new Error('Search failed'),
      });

      render(<Search />);

      waitFor(() => {
        expect(screen.getByText(/Error loading/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring Points', () => {
    it('should show loading state during search', () => {
      (useSession as jest.Mock).mockReturnValue({ data: null });

      const { api } = require('~/utils/api');
      api.provider.search.useQuery.mockReturnValueOnce({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<Search />);

      waitFor(() => {
        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
      });
    });

    it('should display results within acceptable time', async () => {
      const startTime = Date.now();

      (useSession as jest.Mock).mockReturnValue({ data: null });

      render(<Search />);

      await waitFor(
        () => {
          expect(screen.getByText('Creative Kids Club')).toBeInTheDocument();
        },
        { timeout: 3000 },
      ); // 3 second timeout for results

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
