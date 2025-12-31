# Epic 2: Parent-Facing Search & Discovery
## Story 2.1: Search & Filter Interface

### User Story
**As a** subscribed parent
**I want** a clean interface with search and filter options
**So that** I can easily begin my search for relevant holiday programs

### Business Value
The search interface is the core value proposition for parents. A well-designed, intuitive search experience directly impacts user satisfaction, engagement, and subscription retention.

### Story Details
- **Epic**: #2 - Parent-Facing Search & Discovery
- **GitHub Issue**: #100
- **Priority**: High
- **Story Points**: 8
- **Sprint/Milestone**: Phase 3 - MVP

---

## Acceptance Criteria

1. **Search Bar**
   - [ ] Prominent search bar on main page
   - [ ] Location autocomplete (suburb/postcode)
   - [ ] Clear search button
   - [ ] Recent searches history

2. **Date Filters**
   - [ ] Date range picker for program dates
   - [ ] Pre-set options (school holidays, next week, custom)
   - [ ] Visual calendar component

3. **Activity Filters**
   - [ ] Multi-select for activity types (Sports, Arts, Educational, etc.)
   - [ ] Visual icons for each category
   - [ ] Clear filter counts

4. **Age Filters**
   - [ ] Age range slider or input
   - [ ] Pre-set age groups (5-7, 8-10, 11-13, etc.)
   - [ ] Clear indication of selected age

5. **Responsive Design**
   - [ ] Desktop: sidebar filters + results grid
   - [ ] Tablet: collapsible filter drawer
   - [ ] Mobile: bottom sheet filters

6. **State Management**
   - [ ] Search state preserved in URL
   - [ ] Browser back/forward works
   - [ ] Shareable search URLs

7. **UX Polish**
   - [ ] Loading states while searching
   - [ ] Empty state when no filters selected
   - [ ] Clear "reset filters" option
   - [ ] Filter count badges

---

## BDD Scenarios

### Feature: Search and Filter Interface
```gherkin
Feature: Search and Filter Interface
  As a subscribed parent
  I want to search and filter holiday programs
  So that I can find relevant programs for my children

  Background:
    Given I am logged in as a subscribed user
    And I am on the search page
    And there are programs in the database

  # Location Search Scenarios
  Scenario: Search by suburb
    Given I am on the search page
    When I type "Bondi" in the location search
    Then I should see autocomplete suggestions including "Bondi, NSW"
    When I select "Bondi, NSW"
    Then the search should filter to programs in Bondi area
    And the URL should update with location parameter

  Scenario: Search by postcode
    Given I am on the search page
    When I type "2026" in the location search
    Then I should see suggestions for suburbs with postcode 2026
    When I select a suburb
    Then programs near that location should be displayed

  Scenario: Clear location search
    Given I have searched for "Bondi, NSW"
    When I click the clear button on the location field
    Then the location filter should be removed
    And all programs should be displayed again

  # Date Filter Scenarios
  Scenario: Filter by date range
    Given I am on the search page
    When I click on the date filter
    And I select start date "2025-01-15"
    And I select end date "2025-01-25"
    Then only programs running between those dates should show
    And the date filter should display "Jan 15 - Jan 25"

  Scenario: Use school holiday preset
    Given I am on the search page
    When I click on the date filter
    And I select "April School Holidays" preset
    Then the date range should auto-fill with April holiday dates
    And programs during that period should be displayed

  Scenario: Filter by specific day
    Given I want to find a one-day program
    When I select the same date for start and end
    Then programs available on that specific day should show

  # Activity Type Filter Scenarios
  Scenario: Filter by single activity type
    Given I am on the search page
    When I select "Sports" from activity filters
    Then only programs categorized as Sports should display
    And the Sports filter should show as active
    And I should see the result count update

  Scenario: Filter by multiple activity types
    Given I am on the search page
    When I select "Sports" from activity filters
    And I select "Arts" from activity filters
    Then programs in either Sports OR Arts should display
    And both filters should show as active
    And the filter count should show "2"

  Scenario: Clear activity filters
    Given I have "Sports" and "Arts" filters active
    When I click "Clear" on the activity filter section
    Then all activity filters should be deselected
    And all programs should be displayed

  # Age Filter Scenarios
  Scenario: Filter by age group
    Given I am on the search page
    When I select the "8-10 years" age group
    Then only programs suitable for 8-10 year olds should display
    And programs with overlapping age ranges should be included

  Scenario: Filter by custom age range
    Given I am on the search page
    When I set minimum age to 6
    And I set maximum age to 9
    Then programs accepting children aged 6-9 should display
    And programs outside this range should be hidden

  Scenario: Age filter with edge cases
    Given a program accepts ages 5-12
    When I filter for age 5
    Then that program should be displayed
    When I filter for age 13
    Then that program should NOT be displayed

  # Combined Filter Scenarios
  Scenario: Apply multiple filter types
    Given I am on the search page
    When I search for location "Sydney"
    And I select "Sports" activity type
    And I select "8-10 years" age group
    And I set dates to next week
    Then only programs matching ALL criteria should display
    And the URL should reflect all filter parameters

  Scenario: Filters produce no results
    Given I have applied multiple restrictive filters
    And no programs match the criteria
    Then I should see an empty state message
    And the message should suggest broadening my search
    And I should see a "Reset filters" button

  Scenario: Reset all filters
    Given I have multiple filters applied
    When I click "Reset all filters"
    Then all filters should be cleared
    And all programs should be displayed
    And the URL should be clean

  # State Persistence Scenarios
  Scenario: Search state in URL
    Given I have applied filters for "Bondi" and "Sports"
    When I copy the URL and open in a new tab
    Then the same filters should be applied
    And the same results should be displayed

  Scenario: Browser navigation with filters
    Given I searched for "Bondi"
    And then I searched for "Manly"
    When I click the browser back button
    Then the "Bondi" search should be restored
    And Bondi results should be displayed

  Scenario: Preserve filters during session
    Given I have filters applied on the search page
    When I navigate to a program detail page
    And I click the browser back button
    Then my filters should still be applied

  # Responsive Design Scenarios
  Scenario: Mobile filter drawer
    Given I am on a mobile device
    When I tap the "Filters" button
    Then a bottom sheet should slide up
    And I should see all filter options
    When I apply filters and tap "Show results"
    Then the drawer should close
    And filtered results should display

  Scenario: Desktop sidebar filters
    Given I am on a desktop browser
    Then I should see filters in a left sidebar
    And results should display in a grid on the right
    And filters should update results in real-time

  # Loading States Scenarios
  Scenario: Loading state during search
    Given I am on the search page
    When I apply a filter
    Then I should see a loading indicator
    And the previous results should dim or hide
    When results are loaded
    Then the loading indicator should disappear
    And new results should animate in

  Scenario Outline: Activity type icons
    Given I am viewing the activity filter
    Then the "<activity>" option should display the "<icon>" icon

    Examples:
      | activity    | icon        |
      | Sports      | ball        |
      | Arts        | palette     |
      | Educational | book        |
      | Outdoor     | tree        |
      | Technology  | computer    |
      | Music       | music-note  |
```

---

## Test Strategy

### Unit Tests
- [ ] **Filter Components**
  - LocationSearch autocomplete logic
  - DateRangePicker date validation
  - ActivityFilter selection logic
  - AgeFilter range validation
- [ ] **URL State Management**
  - Query parameter serialization
  - Filter state hydration from URL
  - History state updates

### Integration Tests
- [ ] **API Endpoints**
  - `GET /api/trpc/provider.search` with filters
  - Filter combination handling
  - Empty result handling
- [ ] **State Management**
  - Filter changes trigger API calls
  - Results update correctly
  - Loading states appear/disappear

### E2E Tests
- [ ] **User Journeys**
  - Complete search flow from home to results
  - Filter application and clearing
  - URL sharing and restoration
  - Mobile filter drawer interaction

### Performance Requirements
- Page load: < 2 seconds
- Filter response: < 500ms
- Search API: < 200ms (p95)

### Accessibility Requirements
- [ ] Keyboard navigation for all filters
- [ ] Screen reader announcements for results
- [ ] WCAG 2.1 AA compliance
- [ ] Focus management in modals

---

## Technical Design

### Approach
React components with URL-based state management using `nuqs` or custom hooks. TanStack Query for API caching and optimistic updates.

### Components/Modules
- **Frontend:**
  - [ ] `SearchPage` - Main page component
  - [ ] `LocationSearch` - Autocomplete input
  - [ ] `DateRangePicker` - Date selection
  - [ ] `ActivityFilter` - Multi-select with icons
  - [ ] `AgeFilter` - Range slider/presets
  - [ ] `FilterDrawer` - Mobile bottom sheet
  - [ ] `SearchResults` - Results grid
  - [ ] `EmptyState` - No results message
  - [ ] `FilterBadges` - Active filter display

- **Backend:**
  - [ ] Extend `provider.search` with filters
  - [ ] Add program search endpoint
  - [ ] Location autocomplete API

### State Management
```typescript
interface SearchFilters {
  location?: {
    suburb: string;
    state: string;
    lat?: number;
    lng?: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  activities?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
}

// URL params: ?location=bondi-nsw&activities=sports,arts&age=8-10&dates=2025-01-15,2025-01-25
```

### Dependencies
- Epic 1 completed (authentication, providers)
- UI/UX designs approved
- Location data service (Google Places or similar)

---

## UI/UX Design

### Mockups
- [ ] Desktop view: [Figma Link TBD]
- [ ] Mobile view: [Figma Link TBD]
- [ ] Tablet view: [Figma Link TBD]

### Wireframe Layout
```
┌─────────────────────────────────────────────────────────┐
│  Logo    [     Search Location...     🔍]    [Profile]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐  ┌───────────────────────────────────┐  │
│ │  FILTERS    │  │  Showing 24 programs              │  │
│ │             │  │  ┌─────────┐ ┌─────────┐          │  │
│ │ 📍 Location │  │  │ Program │ │ Program │          │  │
│ │ [Bondi, NSW]│  │  │  Card   │ │  Card   │          │  │
│ │             │  │  └─────────┘ └─────────┘          │  │
│ │ 📅 Dates    │  │  ┌─────────┐ ┌─────────┐          │  │
│ │ [Jan 15-25] │  │  │ Program │ │ Program │          │  │
│ │             │  │  │  Card   │ │  Card   │          │  │
│ │ 🏃 Activity │  │  └─────────┘ └─────────┘          │  │
│ │ ☑ Sports    │  │                                   │  │
│ │ ☐ Arts      │  │  [Load More...]                   │  │
│ │ ☐ Music     │  │                                   │  │
│ │             │  │                                   │  │
│ │ 👶 Age      │  │                                   │  │
│ │ [8] - [10]  │  │                                   │  │
│ │             │  │                                   │  │
│ │ [Reset All] │  │                                   │  │
│ └─────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Definition of Ready Checklist
- [x] User story format complete
- [x] Acceptance criteria defined
- [x] BDD scenarios reviewed
- [x] Test strategy defined
- [ ] UI/UX designs complete
- [x] Technical approach approved
- [x] Dependencies identified
- [x] Story estimated

## Definition of Done Checklist
- [ ] All acceptance criteria met
- [ ] All BDD scenarios pass
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Performance benchmarks met
- [ ] Accessibility tested
- [ ] Deployed to staging
- [ ] Product Owner sign-off

---

## Development Tasks
- [ ] Create SearchPage layout component
- [ ] Implement LocationSearch with autocomplete
- [ ] Build DateRangePicker component
- [ ] Build ActivityFilter multi-select
- [ ] Build AgeFilter range component
- [ ] Implement URL state management
- [ ] Create mobile FilterDrawer
- [ ] Extend API with search filters
- [ ] Build SearchResults grid
- [ ] Add loading and empty states
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests
- [ ] Accessibility audit

---

## Related Documents
- [Epic 2 Overview](./epic-2-search-discovery.md)
- [API Reference](../api/api-reference.md)
- [Data Models](../architecture/data-models.md)
- [Story 2.2: Display Search Results](./epic-2-story-2-display-search-results.md)
