# Building Blocks

## Architectural Patterns

### Repository Pattern
We use the Repository Pattern to abstract database access and centralize business logic.
- **BaseRepository**: Provides common CRUD operations (`findById`, `findMany`, `create`, `update`, `delete`) and automatic audit logging.
- **Specific Repositories** (e.g., `ProviderRepository`): Extend `BaseRepository` to include domain-specific logic and complex queries.
- **Usage**: API routers (tRPC) should **always** use repositories instead of accessing `ctx.db` directly. This ensures consistent application of business rules and audit logging.

### Audit Logging
All critical system actions are logged to the database for security and compliance.
- **AuditLogger**: A utility class (`src/utils/auditLogger.ts`) that persists events to the `AuditLog` table.
- **Automatic Logging**: `BaseRepository` automatically logs `DATA_CREATE`, `DATA_UPDATE`, and `DATA_DELETE` events.
- **Manual Logging**: Use `auditLogger.logEvent()` for specific business events (e.g., `AUTH_LOGIN_FAILED`).
- **Persistence**: Logs are stored in the PostgreSQL database and can be queried for compliance reporting.

## Tech Stack Decisions
- **Database**: PostgreSQL with Prisma ORM.
- **API**: tRPC for end-to-end type safety.
- **Validation**: Zod for input validation.
