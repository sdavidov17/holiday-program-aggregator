# Epic 4, Story 14: Log Rotation & Retention (Free Tier Addition)

**Story:** *As a developer, I want cost-effective log management, so that we can debug issues without expensive log services.*

## Acceptance Criteria

1. Automated log file rotation (daily)
2. 7-day local retention, 30-day archive
3. Log compression for storage efficiency
4. Search capability for recent logs
5. Automated cleanup of old logs

## Technical Tasks

- [ ] Implement Winston with file rotation
- [ ] Set up log compression scripts
- [ ] Create basic log search API
- [ ] Configure S3/cheap storage for archives
- [ ] Build log cleanup automation

## Dependencies

- Story 4.2: Structured Logging (log format compatibility)

## Estimated Effort

- **Development:** 3 days
- **Testing:** 1 day
- **Documentation:** 0.5 days

## Implementation Notes

### Log Rotation Strategy
1. **Daily Rotation:** New log file each day
2. **Size Limit:** Max 100MB per file
3. **Compression:** gzip after rotation
4. **Naming:** `app-YYYY-MM-DD.log`

### Retention Policy
- **Local Storage:** 7 days uncompressed
- **Archive Storage:** 30 days compressed
- **Audit Logs:** 2 years (separate retention)

### Storage Tiers
1. **Hot (0-7 days):** Local disk, immediate access
2. **Warm (7-30 days):** S3/Backblaze B2, few minutes access
3. **Cold (30+ days):** Deleted (except audit logs)

### Search Implementation
- Simple grep-based search for local logs
- Date range filtering
- Correlation ID lookup
- Error level filtering

## Definition of Done

- [ ] Winston configured with rotation
- [ ] Compression scripts working
- [ ] Log search API functional
- [ ] Archive storage configured
- [ ] Cleanup automation tested
- [ ] Documentation complete
- [ ] Monitoring for log storage usage