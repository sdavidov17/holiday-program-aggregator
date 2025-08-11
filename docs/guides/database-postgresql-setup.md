# PostgreSQL Database Setup

## Overview

This project now uses PostgreSQL exclusively for all environments (development, staging, production) to ensure consistency and eliminate schema synchronization issues.

## Why PostgreSQL?

- **Consistency**: Same database engine across all environments
- **PostGIS Support**: Native geospatial queries for location-based features
- **Advanced Features**: Full-text search, JSON operations, and better performance
- **No Schema Conflicts**: Eliminates field name mismatches between environments

## Local Development Setup

### Option 1: Docker (Recommended)

1. **Install Docker Desktop**
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Start PostgreSQL**
   ```bash
   # Start the database
   ./scripts/docker-db.sh start
   
   # Or using docker-compose directly
   docker-compose up -d postgres
   ```

3. **Database is ready!**
   - Connection URL: `postgresql://postgres:postgres@localhost:5432/holiday_aggregator`
   - Port: `5432`
   - Database: `holiday_aggregator`
   - Username: `postgres`
   - Password: `postgres`

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql@16 postgis
   brew services start postgresql@16
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql-16 postgresql-16-postgis-3
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   createdb holiday_aggregator
   psql holiday_aggregator -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

3. **Update .env**
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/holiday_aggregator"
   ```

### Option 3: Cloud PostgreSQL (Free Tiers)

#### Supabase (500MB Free)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update your `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

#### Neon (3GB Free)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a database
3. Copy the connection string
4. Update your `.env`:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
   ```

## Docker Commands

The project includes a helpful script for managing the PostgreSQL Docker container:

```bash
# Start database
./scripts/docker-db.sh start

# Stop database
./scripts/docker-db.sh stop

# View logs
./scripts/docker-db.sh logs

# Open PostgreSQL shell
./scripts/docker-db.sh shell

# Reset database (WARNING: destroys all data)
./scripts/docker-db.sh reset

# Backup database
./scripts/docker-db.sh backup

# Restore from backup
./scripts/docker-db.sh restore backup_file.sql

# Start pgAdmin (Database UI)
./scripts/docker-db.sh pgadmin
# Access at http://localhost:5050
```

## Database Migrations

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# Create and apply migrations (production)
pnpm db:migrate

# Open Prisma Studio (Database GUI)
pnpm db:studio

# Seed database with test data
pnpm db:seed
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/holiday_aggregator?schema=public"

# Enable PostGIS extensions
ENABLE_POSTGIS="true"

# For Docker environment
DOCKER_ENV="true"  # Optional, helps with connection detection
```

## Troubleshooting

### Connection Refused Error
- Ensure PostgreSQL is running: `docker-compose ps`
- Check if port 5432 is available: `lsof -i :5432`
- Verify DATABASE_URL in `.env` file

### Permission Denied
- Ensure correct username/password in DATABASE_URL
- For Docker: default is `postgres:postgres`

### Database Does Not Exist
```bash
# Create database manually
docker-compose exec postgres createdb -U postgres holiday_aggregator
```

### Port Already in Use
```bash
# Find process using port 5432
lsof -i :5432

# Stop local PostgreSQL if running
brew services stop postgresql@16  # macOS
sudo systemctl stop postgresql    # Linux
```

## PostGIS Features

The database includes PostGIS extensions for geospatial queries:

```sql
-- Example: Find providers within 10km radius
SELECT * FROM "Provider"
WHERE ST_DWithin(
  location::geography,
  ST_MakePoint(longitude, latitude)::geography,
  10000  -- meters
);
```

## Production Deployment

For production, use a managed PostgreSQL service:

- **Vercel Postgres**: Integrated with Vercel deployments
- **Supabase**: Full PostgreSQL with generous free tier
- **Neon**: Serverless PostgreSQL with autoscaling
- **Railway**: Simple deployment with good free tier
- **AWS RDS**: Enterprise-grade with PostGIS support
- **Google Cloud SQL**: Fully managed PostgreSQL

Update your production environment variables accordingly:
```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

## Benefits Over SQLite

1. **No Schema Conflicts**: Single schema for all environments
2. **Better Performance**: Concurrent connections, better indexing
3. **PostGIS Support**: Native geospatial queries
4. **Full-Text Search**: Built-in text search capabilities
5. **JSON Support**: Native JSONB type for flexible data
6. **Production Ready**: Same database in dev and production