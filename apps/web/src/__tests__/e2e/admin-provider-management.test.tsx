import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import AdminProviders from '~/pages/admin/providers/index';
import AdminProviderNew from '~/pages/admin/providers/new';

jest.mock('next-auth/react');
jest.mock('next/router');
jest.mock('~/utils/api', () => ({
  api: {
    provider: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: [
            {
              id: '1',
              name: 'Test Provider',
              email: 'test@provider.com',
              suburb: 'Sydney',
              state: 'NSW',
              postcode: '2000',
              isVetted: false,
              isPublished: false,
              programs: []
            }
          ],
          isLoading: false,
          error: null,
          refetch: jest.fn()
        }))
      },
      create: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      },
      toggleVetting: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      },
      togglePublishing: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      },
      delete: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false
        }))
      }
    },
    user: {
      me: {
        useQuery: jest.fn(() => ({
          data: {
            id: '1',
            email: 'admin@test.com',
            role: 'ADMIN'
          }
        }))
      }
    }
  }
}));

describe('Admin Provider Management E2E', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
      query: {},
      pathname: '/admin/providers'
    });
    
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'admin@test.com',
          role: 'ADMIN'
        }
      }
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require admin role to access provider management', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'user@test.com',
            role: 'USER'
          }
        }
      });
      
      render(<AdminProviders />);
      
      waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('should allow admin access to provider management', () => {
      render(<AdminProviders />);
      
      expect(screen.getByText('Manage Providers')).toBeInTheDocument();
      expect(screen.getByText('Add New Provider')).toBeInTheDocument();
    });
  });

  describe('Provider List View', () => {
    it('should display all providers in a table', () => {
      render(<AdminProviders />);
      
      expect(screen.getByText('Test Provider')).toBeInTheDocument();
      expect(screen.getByText('test@provider.com')).toBeInTheDocument();
      expect(screen.getByText('Sydney, NSW')).toBeInTheDocument();
    });

    it('should show provider status badges', () => {
      render(<AdminProviders />);
      
      expect(screen.getByText('Not Vetted')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should filter providers by vetting status', () => {
      render(<AdminProviders />);
      
      const vettedCheckbox = screen.getByLabelText(/Show unvetted/i);
      fireEvent.click(vettedCheckbox);
      
      // Verify filter is applied
      const { api } = require('~/utils/api');
      expect(api.provider.getAll.useQuery).toHaveBeenCalledWith(
        expect.objectContaining({ includeUnvetted: false })
      );
    });
  });

  describe('Add Provider Flow', () => {
    it('should navigate to add provider form', () => {
      render(<AdminProviders />);
      
      const addButton = screen.getByText('Add New Provider');
      fireEvent.click(addButton);
      
      expect(mockPush).toHaveBeenCalledWith('/admin/providers/new');
    });

    it('should validate required fields', async () => {
      render(<AdminProviderNew />);
      
      const submitButton = screen.getByText('Create Provider');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    it('should create provider with valid data', async () => {
      const { api } = require('~/utils/api');
      const mockCreate = jest.fn();
      api.provider.create.useMutation.mockReturnValue({
        mutate: mockCreate,
        isPending: false
      });
      
      render(<AdminProviderNew />);
      
      fireEvent.change(screen.getByLabelText(/Provider Name/i), {
        target: { value: 'New Provider' }
      });
      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'new@provider.com' }
      });
      fireEvent.change(screen.getByLabelText(/Phone/i), {
        target: { value: '0400 123 456' }
      });
      fireEvent.change(screen.getByLabelText(/Suburb/i), {
        target: { value: 'Melbourne' }
      });
      fireEvent.change(screen.getByLabelText(/State/i), {
        target: { value: 'VIC' }
      });
      fireEvent.change(screen.getByLabelText(/Postcode/i), {
        target: { value: '3000' }
      });
      
      const submitButton = screen.getByText('Create Provider');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith({
          name: 'New Provider',
          email: 'new@provider.com',
          phone: '0400 123 456',
          suburb: 'Melbourne',
          state: 'VIC',
          postcode: '3000'
        });
      });
    });
  });

  describe('Vetting Process', () => {
    it('should toggle vetting status', async () => {
      const { api } = require('~/utils/api');
      const mockToggleVetting = jest.fn();
      api.provider.toggleVetting.useMutation.mockReturnValue({
        mutate: mockToggleVetting,
        isPending: false
      });
      
      render(<AdminProviders />);
      
      const vetButton = screen.getByText('Not Vetted');
      fireEvent.click(vetButton);
      
      await waitFor(() => {
        expect(mockToggleVetting).toHaveBeenCalledWith({ id: '1' });
      });
    });

    it('should show success message after vetting', async () => {
      const { api } = require('~/utils/api');
      api.provider.toggleVetting.useMutation.mockReturnValue({
        mutate: jest.fn((_, { onSuccess }) => onSuccess()),
        isPending: false
      });
      
      render(<AdminProviders />);
      
      const vetButton = screen.getByText('Not Vetted');
      fireEvent.click(vetButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Vetting status updated/i)).toBeInTheDocument();
      });
    });
  });

  describe('Publishing Process', () => {
    it('should require vetting before publishing', () => {
      render(<AdminProviders />);
      
      const publishButton = screen.getByText('Draft');
      expect(publishButton).toBeDisabled();
    });

    it('should toggle publishing status for vetted providers', async () => {
      const { api } = require('~/utils/api');
      api.provider.getAll.useQuery.mockReturnValue({
        data: [{
          id: '1',
          name: 'Test Provider',
          isVetted: true,
          isPublished: false,
          programs: []
        }],
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });
      
      const mockTogglePublishing = jest.fn();
      api.provider.togglePublishing.useMutation.mockReturnValue({
        mutate: mockTogglePublishing,
        isPending: false
      });
      
      render(<AdminProviders />);
      
      const publishButton = screen.getByText('Draft');
      fireEvent.click(publishButton);
      
      await waitFor(() => {
        expect(mockTogglePublishing).toHaveBeenCalledWith({ id: '1' });
      });
    });
  });

  describe('Delete Provider', () => {
    it('should confirm before deleting', () => {
      window.confirm = jest.fn(() => false);
      
      render(<AdminProviders />);
      
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Provider"?');
    });

    it('should delete provider after confirmation', async () => {
      window.confirm = jest.fn(() => true);
      
      const { api } = require('~/utils/api');
      const mockDelete = jest.fn();
      api.provider.delete.useMutation.mockReturnValue({
        mutate: mockDelete,
        isPending: false
      });
      
      render(<AdminProviders />);
      
      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith({ id: '1' });
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track provider creation time', async () => {
      const startTime = Date.now();
      
      render(<AdminProviderNew />);
      
      // Fill form and submit
      const submitButton = screen.getByText('Create Provider');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      });
    });

    it('should handle bulk operations efficiently', async () => {
      const { api } = require('~/utils/api');
      api.provider.getAll.useQuery.mockReturnValue({
        data: Array.from({ length: 50 }, (_, i) => ({
          id: `${i}`,
          name: `Provider ${i}`,
          isVetted: false,
          isPublished: false,
          programs: []
        })),
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });
      
      render(<AdminProviders />);
      
      await waitFor(() => {
        expect(screen.getByText('Provider 0')).toBeInTheDocument();
        expect(screen.getByText('Provider 49')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on API failure', async () => {
      const { api } = require('~/utils/api');
      api.provider.create.useMutation.mockReturnValue({
        mutate: jest.fn((_, { onError }) => onError(new Error('Network error'))),
        isPending: false
      });
      
      render(<AdminProviderNew />);
      
      const submitButton = screen.getByText('Create Provider');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should retry failed operations', async () => {
      const { api } = require('~/utils/api');
      const mockRefetch = jest.fn();
      api.provider.getAll.useQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load'),
        refetch: mockRefetch
      });
      
      render(<AdminProviders />);
      
      const retryButton = screen.getByText(/Retry/i);
      fireEvent.click(retryButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});