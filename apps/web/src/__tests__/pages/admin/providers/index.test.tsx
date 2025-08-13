/**
 * Unit tests for Provider List Admin Page
 * Epic 1, Story 5: Manual Provider Onboarding Tool
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import ProvidersListPage from '~/pages/admin/providers/index';
import { api } from '~/utils/api';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/admin/providers',
    route: '/admin/providers',
    asPath: '/admin/providers',
    query: {},
  }),
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

// Mock AdminLayout
jest.mock('~/components/AdminLayout', () => ({
  AdminLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock tRPC api
jest.mock('~/utils/api', () => ({
  api: {
    provider: {
      getAll: {
        useQuery: jest.fn(),
      },
      toggleVetting: {
        useMutation: jest.fn(),
      },
      togglePublishing: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('ProvidersListPage', () => {
  const mockProviders = [
    {
      id: '1',
      businessName: 'Test Provider 1',
      email: 'provider1@test.com',
      suburb: 'Sydney',
      state: 'NSW',
      isVetted: true,
      isPublished: true,
      programs: [{ id: 'p1' }, { id: 'p2' }],
    },
    {
      id: '2',
      businessName: 'Test Provider 2',
      email: 'provider2@test.com',
      suburb: 'Melbourne',
      state: 'VIC',
      isVetted: false,
      isPublished: false,
      programs: [],
    },
  ];

  const mockRefetch = jest.fn();
  const mockToggleVetting = jest.fn();
  const mockTogglePublishing = jest.fn();
  const mockDeleteProvider = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (api.provider.getAll.useQuery as jest.Mock).mockReturnValue({
      data: mockProviders,
      refetch: mockRefetch,
      isLoading: false,
    });

    (api.provider.toggleVetting.useMutation as jest.Mock).mockReturnValue({
      mutate: mockToggleVetting,
      isPending: false,
    });

    (api.provider.togglePublishing.useMutation as jest.Mock).mockReturnValue({
      mutate: mockTogglePublishing,
      isPending: false,
    });

    (api.provider.delete.useMutation as jest.Mock).mockReturnValue({
      mutate: mockDeleteProvider,
      isPending: false,
    });
  });

  it('should render provider list', () => {
    render(<ProvidersListPage />);
    
    expect(screen.getByText('Manage Providers')).toBeInTheDocument();
    expect(screen.getByText('Test Provider 1')).toBeInTheDocument();
    expect(screen.getByText('Test Provider 2')).toBeInTheDocument();
  });

  it('should display provider details correctly', () => {
    render(<ProvidersListPage />);
    
    expect(screen.getByText('provider1@test.com')).toBeInTheDocument();
    expect(screen.getByText('Sydney, NSW')).toBeInTheDocument();
    expect(screen.getByText('2 programs')).toBeInTheDocument();
    expect(screen.getByText('0 programs')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (api.provider.getAll.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      refetch: mockRefetch,
      isLoading: true,
    });

    render(<ProvidersListPage />);
    expect(screen.getByText('Loading providers...')).toBeInTheDocument();
  });

  it('should handle filter toggles', () => {
    render(<ProvidersListPage />);
    
    const unpublishedCheckbox = screen.getByLabelText(/show unpublished/i);
    const unvettedCheckbox = screen.getByLabelText(/show unvetted/i);
    
    expect(unpublishedCheckbox).toBeChecked();
    expect(unvettedCheckbox).toBeChecked();
    
    fireEvent.click(unpublishedCheckbox);
    expect(unpublishedCheckbox).not.toBeChecked();
    
    fireEvent.click(unvettedCheckbox);
    expect(unvettedCheckbox).not.toBeChecked();
  });

  it('should toggle vetting status when button clicked', () => {
    render(<ProvidersListPage />);
    
    const vettedButton = screen.getAllByText('✓ Vetted')[0];
    fireEvent.click(vettedButton);
    
    expect(mockToggleVetting).toHaveBeenCalledWith({ id: '1' });
  });

  it('should toggle publishing status when button clicked', () => {
    render(<ProvidersListPage />);
    
    const publishedButton = screen.getAllByText('✓ Published')[0];
    fireEvent.click(publishedButton);
    
    expect(mockTogglePublishing).toHaveBeenCalledWith({ id: '1' });
  });

  it('should disable publish button for unvetted providers', () => {
    render(<ProvidersListPage />);
    
    const draftButtons = screen.getAllByText('Draft');
    const unvettedProviderPublishButton = draftButtons[0];
    
    expect(unvettedProviderPublishButton).toBeDisabled();
  });

  it('should handle delete with confirmation', () => {
    window.confirm = jest.fn(() => true);
    
    render(<ProvidersListPage />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Provider 1"?');
    expect(mockDeleteProvider).toHaveBeenCalledWith({ id: '1' });
  });

  it('should not delete when confirmation cancelled', () => {
    window.confirm = jest.fn(() => false);
    
    render(<ProvidersListPage />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteProvider).not.toHaveBeenCalled();
  });

  it('should show success message after operations', async () => {
    const { rerender } = render(<ProvidersListPage />);
    
    // Simulate successful vetting toggle
    (api.provider.toggleVetting.useMutation as jest.Mock).mockReturnValue({
      mutate: (args: any) => {
        const onSuccess = (api.provider.toggleVetting.useMutation as jest.Mock).mock.calls[0][0].onSuccess;
        onSuccess();
      },
      isPending: false,
    });
    
    rerender(<ProvidersListPage />);
    
    const vettedButton = screen.getAllByText('✓ Vetted')[0];
    fireEvent.click(vettedButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vetting status updated successfully')).toBeInTheDocument();
    });
  });

  it('should show empty state when no providers', () => {
    (api.provider.getAll.useQuery as jest.Mock).mockReturnValue({
      data: [],
      refetch: mockRefetch,
      isLoading: false,
    });

    render(<ProvidersListPage />);
    
    expect(screen.getByText(/no providers found/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first provider/i)).toBeInTheDocument();
  });

  it('should have link to add new provider', () => {
    render(<ProvidersListPage />);
    
    const addButton = screen.getByText('Add New Provider');
    expect(addButton).toHaveAttribute('href', '/admin/providers/new');
  });

  it('should have edit links for each provider', () => {
    render(<ProvidersListPage />);
    
    const editLinks = screen.getAllByText('Edit');
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]).toHaveAttribute('href', '/admin/providers/1');
    expect(editLinks[1]).toHaveAttribute('href', '/admin/providers/2');
  });
});