# Epic 1: Foundation, Provider Management & Subscriptions
## Story 1.7: Automated Data Refresh & Review

*As an admin, I want the system to periodically re-crawl existing providers and highlight potential changes, so I can efficiently keep the data up to date.*

### Acceptance Criteria
1. The crawling agent runs automatically on a schedule.
2. If the agent detects a potential change, it flags the provider in the admin dashboard.
3. The admin dashboard has a queue for reviewing flagged providers.

### Development Tasks
- [ ] Create a new scheduled serverless function (cron job) that runs periodically (e.g., daily).
- [ ] The function should query the database for all existing providers.
- [ ] For each provider, the function will re-run the crawling logic from Story 1.6 on the provider's stored URL.
- [ ] Add a `needsReview` boolean field to the `Provider` model in the Prisma schema, defaulting to `false`.
- [ ] Implement a data comparison logic that checks for significant differences between the newly crawled data and the data currently stored in the database.
- [ ] If a significant change is detected, update the provider's `needsReview` flag to `true`.
- [ ] Create a new view or section in the admin dashboard titled "Review Queue".
- [ ] This view should display a list of all providers where the `needsReview` flag is `true`.
- [ ] The view should allow an admin to see the proposed changes and either accept them or dismiss the flag.
