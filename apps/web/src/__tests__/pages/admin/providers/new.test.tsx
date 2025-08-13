/**
 * Unit tests for Create Provider Admin Page
 * Epic 1, Story 5: Manual Provider Onboarding Tool
 */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import NewProviderPage from '~/pages/admin/providers/new';
import { api } from '~/utils/api';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    pathname: '/admin/providers/new',
    route: '/admin/providers/new',
    asPath: '/admin/providers/new',
    query: {},
  }),
}));

// Mock AdminLayout
jest.mock('~/components/AdminLayout', () => ({
  AdminLayout: ({ children, title }: any) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

// Mock tRPC api with a more complete implementation
jest.mock('~/utils/api', () => ({
  api: {
    provider: {
      create: {
        useMutation: jest.fn(),
      },
    },
  },
}));

describe('NewProviderPage', () => {
  const mockCreateProvider = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (api.provider.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateProvider,
      isPending: false,
      error: null,
    });
  });

  it('should render the form with all required fields', () => {
    render(<NewProviderPage />);
    
    expect(screen.getByText('Add New Provider')).toBeInTheDocument();
    
    // Basic Information fields
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    
    // Location fields
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/suburb/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    
    // Status checkboxes
    expect(screen.getByLabelText(/mark as vetted/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publish provider/i)).toBeInTheDocument();
  });


  // Form submission tests moved to integration tests:
  // src/__tests__/integration/provider-form.integration.test.tsx

  it('should handle vetting and publishing checkboxes', () => {
    render(<NewProviderPage />);
    
    const vettedCheckbox = screen.getByLabelText(/mark as vetted/i);
    const publishedCheckbox = screen.getByLabelText(/publish provider/i);
    
    // Initially unchecked
    expect(vettedCheckbox).not.toBeChecked();
    expect(publishedCheckbox).not.toBeChecked();
    expect(publishedCheckbox).toBeDisabled();
    
    // Check vetted
    fireEvent.click(vettedCheckbox);
    expect(vettedCheckbox).toBeChecked();
    expect(publishedCheckbox).not.toBeDisabled();
    
    // Check published
    fireEvent.click(publishedCheckbox);
    expect(publishedCheckbox).toBeChecked();
    
    // Uncheck vetted should NOT automatically uncheck published
    // The component doesn't have this logic - published stays checked but becomes disabled
    fireEvent.click(vettedCheckbox);
    expect(vettedCheckbox).not.toBeChecked();
    expect(publishedCheckbox).toBeChecked(); // Still checked but disabled
    expect(publishedCheckbox).toBeDisabled();
  });

  it('should handle special needs fields', () => {
    render(<NewProviderPage />);
    
    const specialNeedsCheckbox = screen.getByLabelText(/special needs accommodation/i);
    
    // Initially the details field should not be visible
    expect(screen.queryByLabelText(/special needs details/i)).not.toBeInTheDocument();
    
    // Check special needs
    fireEvent.click(specialNeedsCheckbox);
    expect(specialNeedsCheckbox).toBeChecked();
    
    // Details field should now be visible
    const detailsField = screen.getByLabelText(/special needs details/i);
    expect(detailsField).toBeInTheDocument();
    
    // Fill in details
    fireEvent.change(detailsField, {
      target: { value: 'Wheelchair accessible' },
    });
    
    expect(detailsField).toHaveValue('Wheelchair accessible');
  });

  it('should handle age groups input', () => {
    render(<NewProviderPage />);
    
    const ageGroupsField = screen.getByLabelText(/age groups \(comma-separated\)/i);
    
    fireEvent.change(ageGroupsField, {
      target: { value: '5-7, 8-10, 11-13' },
    });
    
    expect(ageGroupsField).toHaveValue('5-7, 8-10, 11-13');
  });

  it('should validate required fields', () => {
    render(<NewProviderPage />);
    
    // Only businessName and contactName have HTML required attribute
    const requiredFields = [
      screen.getByLabelText(/business name/i),
      screen.getByLabelText(/contact name/i),
    ];
    
    requiredFields.forEach(field => {
      expect(field).toHaveAttribute('required');
    });
    
    // Other fields are validated in JavaScript but don't have required attribute
    const otherFields = [
      screen.getByLabelText(/email/i),
      screen.getByLabelText(/phone/i),
      screen.getByLabelText(/address/i),
      screen.getByLabelText(/suburb/i),
      screen.getByLabelText(/postcode/i),
      screen.getByLabelText(/description/i),
    ];
    
    otherFields.forEach(field => {
      expect(field).not.toHaveAttribute('required');
    });
  });

  it('should show loading state during submission', () => {
    (api.provider.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateProvider,
      isPending: true,
      error: null,
    });
    
    render(<NewProviderPage />);
    
    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Creating...');
  });

  it('should display error message on failure', () => {
    const errorMessage = 'Failed to create provider';
    (api.provider.create.useMutation as jest.Mock).mockReturnValue({
      mutate: mockCreateProvider,
      isPending: false,
      error: { message: errorMessage },
    });
    
    render(<NewProviderPage />);
    
    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });


  it('should handle cancel button', () => {
    render(<NewProviderPage />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('should handle all Australian states', () => {
    render(<NewProviderPage />);
    
    const expectedStates = [
      'New South Wales',
      'Victoria',
      'Queensland',
      'Western Australia',
      'South Australia',
      'Tasmania',
      'Australian Capital Territory',
      'Northern Territory',
    ];
    
    expectedStates.forEach(state => {
      expect(screen.getByText(state)).toBeInTheDocument();
    });
  });
});