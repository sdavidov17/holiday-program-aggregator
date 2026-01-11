import { Filter, Loader2, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { PremiumFeatureGuard } from '~/components/PremiumFeatureGuard';
import ProviderCard from '~/components/ui/ProviderCard';
import { AUSTRALIAN_STATES, useSearchFilters } from '~/hooks/useSearchFilters';
import { api } from '~/utils/api';

// Activity categories with icons
const ACTIVITY_CATEGORIES = [
  { value: 'Sports', label: 'Sports', icon: '⚽' },
  { value: 'Arts', label: 'Arts & Crafts', icon: '🎨' },
  { value: 'Educational', label: 'Educational', icon: '📚' },
  { value: 'Outdoor', label: 'Outdoor', icon: '🌲' },
  { value: 'Technology', label: 'Technology', icon: '💻' },
  { value: 'Music', label: 'Music', icon: '🎵' },
  { value: 'Drama', label: 'Drama', icon: '🎭' },
  { value: 'Dance', label: 'Dance', icon: '💃' },
  { value: 'Cooking', label: 'Cooking', icon: '👨‍🍳' },
  { value: 'Science', label: 'Science', icon: '🔬' },
];

// Age group presets
const AGE_PRESETS = [
  { label: 'All ages', min: undefined, max: undefined },
  { label: '3-5 years', min: 3, max: 5 },
  { label: '6-8 years', min: 6, max: 8 },
  { label: '9-11 years', min: 9, max: 11 },
  { label: '12-14 years', min: 12, max: 14 },
  { label: '15+ years', min: 15, max: 18 },
];

const SearchPage: NextPage = () => {
  const { data: session } = useSession();
  const { filters, setFilters, clearAllFilters, hasActiveFilters, activeFilterCount } =
    useSearchFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.query || '');
  const [locationInput, setLocationInput] = useState(filters.suburb || '');

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    isFetching,
  } = api.provider.search.useQuery(
    {
      query: filters.query,
      suburb: filters.suburb,
      state: filters.state,
      postcode: filters.postcode,
      categories: filters.categories,
      ageMin: filters.ageMin,
      ageMax: filters.ageMax,
      startDate: filters.startDate,
      endDate: filters.endDate,
      limit: 20,
      offset: 0,
    },
    {
      enabled: true,
      staleTime: 30000,
    },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      query: searchInput || undefined,
      suburb: locationInput || undefined,
    });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];
    setFilters({ categories: newCategories.length > 0 ? newCategories : undefined });
  };

  const setAgeRange = (min?: number, max?: number) => {
    setFilters({ ageMin: min, ageMax: max });
  };

  const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? 'p-4' : ''}>
      {/* Location Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Suburb"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onBlur={() => setFilters({ suburb: locationInput || undefined })}
            className="input w-full"
            data-testid="location-filter"
          />
          <select
            value={filters.state || ''}
            onChange={(e) => setFilters({ state: e.target.value || undefined })}
            className="input w-full"
          >
            <option value="">All States</option>
            {AUSTRALIAN_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Postcode"
            value={filters.postcode || ''}
            onChange={(e) => setFilters({ postcode: e.target.value || undefined })}
            className="input w-full"
            maxLength={4}
          />
        </div>
      </div>

      {/* Activity Type Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Activity Type
          {filters.categories?.length ? (
            <span className="badge-primary text-xs">{filters.categories.length}</span>
          ) : null}
        </h3>
        <div className="space-y-2">
          {ACTIVITY_CATEGORIES.map((category) => (
            <label
              key={category.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={filters.categories?.includes(category.value) || false}
                onChange={() => toggleCategory(category.value)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-lg">{category.icon}</span>
              <span className="text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Age Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Age Group</h3>
        <div className="space-y-2">
          {AGE_PRESETS.map((preset) => (
            <label
              key={preset.label}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <input
                type="radio"
                name="ageGroup"
                checked={filters.ageMin === preset.min && filters.ageMax === preset.max}
                onChange={() => setAgeRange(preset.min, preset.max)}
                className="w-4 h-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                data-testid={preset.label === 'All ages' ? undefined : 'age-filter'}
              />
              <span className="text-gray-700">{preset.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Program Dates</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="filter-start-date" className="label text-sm">
              Start Date
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ startDate: e.target.value || undefined })}
              className="input w-full"
            />
          </div>
          <div>
            <label htmlFor="filter-end-date" className="label text-sm">
              End Date
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters({ endDate: e.target.value || undefined })}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="btn btn-ghost w-full text-gray-600 hover:text-gray-900"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </button>
      )}

      {/* Mobile Apply Button */}
      {mobile && (
        <button onClick={() => setMobileFiltersOpen(false)} className="btn btn-primary w-full mt-4">
          Show {searchResults?.totalCount || 0} Results
        </button>
      )}
    </div>
  );

  return (
    <>
      <Head>
        <title>Search Programs - Parent Pilot</title>
        <meta name="description" content="Search for holiday programs for your children" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Parent Pilot
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                {session?.user?.name || 'Profile'}
              </Link>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="input w-full pl-10"
                  data-testid="search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary" data-testid="search-button">
                Search
              </button>
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn btn-secondary lg:hidden flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="badge-primary text-xs">{activeFilterCount}</span>
                )}
              </button>
            </form>
          </div>
        </div>

        <PremiumFeatureGuard>
          <div className="container-custom py-6">
            <div className="flex gap-6">
              {/* Desktop Sidebar Filters */}
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-32">
                  <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="badge-primary text-xs">{activeFilterCount}</span>
                    )}
                  </h2>
                  <FilterSidebar />
                </div>
              </aside>

              {/* Results Area */}
              <div className="flex-1 min-w-0">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    {isLoading ? (
                      'Searching...'
                    ) : (
                      <>
                        {searchResults?.totalCount || 0} program
                        {searchResults?.totalCount !== 1 ? 's' : ''} found
                      </>
                    )}
                  </h1>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filters.query && (
                      <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
                        Search: {filters.query}
                        <button
                          onClick={() => {
                            setSearchInput('');
                            setFilters({ query: undefined });
                          }}
                          className="hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.suburb && (
                      <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
                        {filters.suburb}
                        {filters.state && `, ${filters.state}`}
                        <button
                          onClick={() => {
                            setLocationInput('');
                            setFilters({ suburb: undefined, state: undefined });
                          }}
                          className="hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {filters.categories?.map((cat) => (
                      <span
                        key={cat}
                        className="badge bg-primary-100 text-primary-700 flex items-center gap-1"
                      >
                        {ACTIVITY_CATEGORIES.find((c) => c.value === cat)?.icon} {cat}
                        <button
                          onClick={() => toggleCategory(cat)}
                          className="hover:text-primary-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {(filters.ageMin !== undefined || filters.ageMax !== undefined) && (
                      <span className="badge bg-gray-100 text-gray-700 flex items-center gap-1">
                        Age: {filters.ageMin || 0}-{filters.ageMax || 18}
                        <button
                          onClick={() => setAgeRange(undefined, undefined)}
                          className="hover:text-gray-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {(isLoading || isFetching) && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                  </div>
                )}

                {/* Results Grid */}
                {!isLoading && searchResults?.providers && searchResults.providers.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {searchResults.providers.map((provider) => (
                      <div key={provider.id} data-testid="provider-card">
                        <ProviderCard
                          id={provider.id}
                          name={provider.businessName}
                          description={provider.description}
                          location={`${provider.suburb}, ${provider.state}`}
                          isVetted={provider.isVetted}
                          tags={provider.programs?.map((p) => p.category).slice(0, 3)}
                          imageUrl={provider.logoUrl || undefined}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading &&
                  (!searchResults?.providers || searchResults.providers.length === 0) && (
                    <div
                      className="bg-white rounded-lg border border-gray-200 p-12 text-center"
                      data-testid="no-results-message"
                    >
                      <div className="text-gray-400 mb-4">
                        <Search className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No programs found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters or search for something else.
                      </p>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="btn btn-primary">
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  )}

                {/* Load More */}
                {searchResults?.hasMore && (
                  <div className="text-center mt-6">
                    <button className="btn btn-secondary">Load More</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PremiumFeatureGuard>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50 cursor-default"
              onClick={() => setMobileFiltersOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileFiltersOpen(false)}
              aria-label="Close filters"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-lg">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar mobile />
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default SearchPage;
