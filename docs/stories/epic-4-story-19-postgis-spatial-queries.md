# EPIC 4: Technical Excellence / Observability

## STORY 4.19: Implement PostGIS Spatial Queries

### Story Description
As a user searching for holiday programs, I need to find providers within a specific radius of my location, so that I can discover nearby options using geographic search capabilities.

### Milestone
**Phase 3: User Experience** - Due: September 30, 2025

### Acceptance Criteria
- [ ] PostGIS extension enabled in database
- [ ] Provider table has geographic location columns
- [ ] Spatial indexes created for performance
- [ ] Repository methods support radius search
- [ ] API endpoints accept lat/lng parameters
- [ ] Results sorted by distance
- [ ] Distance included in search results
- [ ] Fallback to suburb/state search if no coordinates

### Technical Details

#### Database Schema Changes
```sql
-- Add PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location column to Provider table
ALTER TABLE "Provider" 
ADD COLUMN location geography(POINT, 4326);

-- Create spatial index
CREATE INDEX idx_provider_location 
ON "Provider" USING GIST(location);

-- Update existing providers with geocoded locations
UPDATE "Provider" 
SET location = ST_MakePoint(longitude, latitude)::geography
WHERE longitude IS NOT NULL AND latitude IS NOT NULL;
```

#### Repository Implementation
```typescript
// provider.repository.ts
async findByLocation(params: ProviderSearchParams): Promise<ProviderWithDistance[]> {
  if (params.latitude && params.longitude && params.radius) {
    const query = Prisma.sql`
      SELECT 
        *,
        ST_Distance(
          location,
          ST_MakePoint(${params.longitude}, ${params.latitude})::geography
        ) / 1000 as distance_km
      FROM "Provider"
      WHERE ST_DWithin(
        location,
        ST_MakePoint(${params.longitude}, ${params.latitude})::geography,
        ${params.radius * 1000}
      )
      AND "isPublished" = true
      AND "isVetted" = true
      ORDER BY distance_km ASC
      LIMIT ${params.limit || 50}
    `;
    
    return this.prisma.$queryRaw(query);
  }
  
  // Fallback to suburb/state search
  return this.findBySuburbState(params);
}
```

### BDD Scenarios

#### Scenario 1: Search Within Radius
```gherkin
Given I am at coordinates -33.8688, 151.2093 (Sydney)
When I search for providers within 10km radius
Then I should see providers sorted by distance
And each result should show distance in kilometers
And no results should be beyond 10km
```

#### Scenario 2: Boundary Search
```gherkin
Given providers at various distances from search point
When I search with a 5km radius
Then providers at 4.9km should be included
And providers at 5.1km should be excluded
And results should be accurately filtered
```

#### Scenario 3: Performance with Large Dataset
```gherkin
Given 10,000 providers in the database
When I perform a spatial search
Then results should return within 100ms
And the spatial index should be utilized
And query plan should show index scan
```

#### Scenario 4: Fallback Search
```gherkin
Given a search request without coordinates
When I search with suburb "Bondi" and state "NSW"
Then providers should be filtered by suburb/state
And results should still be relevant
And no spatial calculations should occur
```

### Implementation Tasks
1. [ ] Enable PostGIS extension in database
2. [ ] Add migration for location column
3. [ ] Create spatial indexes
4. [ ] Implement geocoding service for addresses
5. [ ] Update repository with spatial queries
6. [ ] Add distance calculation to results
7. [ ] Update API to accept coordinates
8. [ ] Add tests for spatial queries
9. [ ] Performance test with large dataset
10. [ ] Document PostGIS setup for deployment

### Performance Considerations
- Spatial indexes are critical for performance
- Consider bounding box pre-filtering for large searches
- Cache frequently searched areas
- Limit result set size to prevent memory issues
- Monitor query performance in production

### Dependencies
- PostGIS extension availability in production
- Geocoding service for address conversion
- Database migration strategy
- Coordinate data for existing providers

### Estimated Effort
- **Size**: M (Medium)
- **Points**: 5
- **Duration**: 3-4 days

### Definition of Ready
- [x] PostGIS available in development
- [x] Geocoding service identified
- [x] Performance requirements defined
- [x] Test data with coordinates available

### Definition of Done
- [ ] PostGIS enabled and configured
- [ ] Spatial queries implemented
- [ ] Performance benchmarks met
- [ ] Tests passing with 80% coverage
- [ ] Documentation updated
- [ ] Deployment guide includes PostGIS setup
- [ ] Monitoring for spatial query performance

### Notes
- PostGIS is already mentioned in tech stack documentation
- Consider using Australia-specific coordinate system (GDA2020)
- May need to batch geocode existing provider addresses
- Ensure GDPR compliance when storing location data
- Consider privacy implications of precise location searches

### Related Issues
- GitHub Issue: TBD
- Related to: PR #148, PR #149
- Part of: Epic 4 - Technical Excellence
- Milestone: Phase 2 - Core Admin (Aug 31, 2025)