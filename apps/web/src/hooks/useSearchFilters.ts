import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

export interface SearchFilters {
  query?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  categories?: string[];
  ageMin?: number;
  ageMax?: number;
  startDate?: string;
  endDate?: string;
}

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'SA', label: 'South Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
] as const;

export { AUSTRALIAN_STATES };

export function useSearchFilters() {
  const router = useRouter();

  // Parse filters from URL query params
  const filters: SearchFilters = useMemo(() => {
    const { query, suburb, state, postcode, categories, ageMin, ageMax, startDate, endDate } =
      router.query;

    return {
      query: typeof query === 'string' ? query : undefined,
      suburb: typeof suburb === 'string' ? suburb : undefined,
      state: typeof state === 'string' ? state : undefined,
      postcode: typeof postcode === 'string' ? postcode : undefined,
      categories: typeof categories === 'string' ? categories.split(',') : undefined,
      ageMin: typeof ageMin === 'string' ? parseInt(ageMin, 10) : undefined,
      ageMax: typeof ageMax === 'string' ? parseInt(ageMax, 10) : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
    };
  }, [router.query]);

  // Update URL with new filters
  const setFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const merged = { ...filters, ...newFilters };

      // Build query params, excluding undefined/empty values
      const queryParams: Record<string, string> = {};

      if (merged.query) queryParams.query = merged.query;
      if (merged.suburb) queryParams.suburb = merged.suburb;
      if (merged.state) queryParams.state = merged.state;
      if (merged.postcode) queryParams.postcode = merged.postcode;
      if (merged.categories?.length) queryParams.categories = merged.categories.join(',');
      if (merged.ageMin !== undefined) queryParams.ageMin = String(merged.ageMin);
      if (merged.ageMax !== undefined) queryParams.ageMax = String(merged.ageMax);
      if (merged.startDate) queryParams.startDate = merged.startDate;
      if (merged.endDate) queryParams.endDate = merged.endDate;

      router.push({ pathname: '/search', query: queryParams }, undefined, { shallow: true });
    },
    [filters, router],
  );

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: keyof SearchFilters) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    },
    [filters, setFilters],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    router.push('/search', undefined, { shallow: true });
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.query ||
      filters.suburb ||
      filters.state ||
      filters.postcode ||
      filters.categories?.length ||
      filters.ageMin !== undefined ||
      filters.ageMax !== undefined ||
      filters.startDate ||
      filters.endDate
    );
  }, [filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.suburb || filters.state || filters.postcode) count++;
    if (filters.categories?.length) count++;
    if (filters.ageMin !== undefined || filters.ageMax !== undefined) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}
