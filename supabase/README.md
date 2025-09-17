# Supabase Database Setup Guide

This README provides comprehensive instructions for setting up and deploying the Supabase database migrations for the Scout Management System.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Migration Files](#migration-files)
- [Setup Instructions](#setup-instructions)
  - [Local Development](#local-development)
  - [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Schema Overview](#database-schema-overview)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

This directory contains the complete database schema and optimization migrations for the Scout Management System. The database is built on PostgreSQL with Supabase's Row Level Security (RLS) and includes comprehensive optimizations for performance, security, and monitoring.

### Key Features
- Multi-tenant architecture with tenant isolation
- Row Level Security (RLS) policies
- Role-based access control (RBAC)
- Comprehensive data validation
- Performance monitoring and analytics
- Audit logging and security functions

## Prerequisites

Before setting up the database, ensure you have:

1. **Supabase CLI installed**:
   ```bash
   # Via npm (recommended)
   npm install -g @supabase/supabase-cli
   
   # Or using npx (no global install)
   npx supabase --help
   ```

2. **Supabase Project**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Note your project reference ID from dashboard URL: `https://supabase.com/dashboard/project/<project-id>`
   - Save your database password

3. **Git Repository Access**:
   - Clone this repository
   - Ensure you're on the correct branch

## Project Structure

```
plataforma-scouts/
├── backend/                     # Java Spring Boot backend
├── frontend/                    # React frontend
├── supabase/                    # Database configuration
│   ├── migrations/              # SQL migration files
│   │   ├── 20250917085318_create_tables.sql
│   │   ├── 20250917112830_setup_rls_policies.sql
│   │   ├── 20250917120000_optimize_rls_policies.sql
│   │   ├── 20250917121000_add_rbac.sql
│   │   ├── 20250917122000_add_data_validation.sql
│   │   ├── 20250917123000_add_security_functions.sql
│   │   ├── 20250917124000_add_monitoring.sql
│   │   └── 20250917125000_add_api_views.sql
│   ├── config.toml             # Supabase configuration
│   ├── .env.example            # Environment variables template
│   └── README.md               # This file
└── README.md
```

└── README.md

## Migration Files

### Migration Sequence

| Order | File | Description |
|-------|------|-------------|
| 1 | `20250917085318_create_tables.sql` | Base tables and relationships |
| 2 | `20250917112830_setup_rls_policies.sql` | Basic RLS policies |
| 3 | `20250917120000_optimize_rls_policies.sql` | Performance optimizations |
| 4 | `20250917121000_add_rbac.sql` | Role-based access control |
| 5 | `20250917122000_add_data_validation.sql` | Data validation and constraints |
| 6 | `20250917123000_add_security_functions.sql` | Security and audit functions |
| 7 | `20250917124000_add_monitoring.sql` | Performance monitoring |
| 8 | `20250917125000_add_api_views.sql` | Optimized API views |

### Tables Created
- `tenants` - Multi-tenant organization management
- `users` - User accounts and authentication
- `members` - Scout member profiles
- `sections` - Scout sections/groups
- `events` - Event management
- `transactions` - Financial transaction tracking

## Setup Instructions

### Local Development

1. **Navigate to project directory**:
   ```bash
   cd plataforma-scouts/supabase
   ```

2. **Initialize Supabase (if not already done)**:
   ```bash
   supabase init
   ```

3. **Start local Supabase**:
   ```bash
   supabase start
   ```

4. **Apply migrations locally**:
   ```bash
   supabase db reset
   ```

5. **Verify setup**:

   ```bash
   supabase migration list
   ```

6. **Optional: Start with existing schema**:

   ```bash
   # If you need to pull existing schema from remote
   supabase db pull --project-ref <project-id>
   ```

### Production Deployment (already made on staging env)

#### Method 1: Direct Migration Push (Recommended)

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```

2. **Link to your production project**:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Push all migrations**:
   ```bash
   supabase db push
   ```

4. **Push configuration**:
   ```bash
   supabase config push
   ```

#### Method 2: Manual SQL Import

If you prefer to import SQL files manually:

1. **Export all migrations to single file**:
   ```bash
   cat migrations/*.sql > complete_schema.sql
   ```

2. **Connect to your Supabase database using psql**:
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Import the schema**:
   ```sql
   \i complete_schema.sql
   ```

#### Method 3: CI/CD Deployment (nice to have)

Create `.github/workflows/deploy-db.yml`:

```yaml
name: Deploy Database Migrations

on:
  push:
    branches: [main]
    paths: ['supabase/migrations/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
      
    steps:
      - uses: actions/checkout@v4
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
          
      - name: Deploy to Production
        run: |
          cd supabase
          supabase link --project-ref $SUPABASE_PROJECT_ID
          supabase db push
```

## Environment Configuration

### 1. Create Environment Files

Create the following environment files:

**`.env.local` (for local development)**:
```bash
# Copy from .env.example
cp .env.example .env.local
```

**`.env.production` (for production)**:
```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

### 2. Backend Integration (Spring Boot)

Update `backend/src/main/resources/application.properties`:

```properties
# Supabase Configuration
supabase.url=${SUPABASE_URL:https://your-project-ref.supabase.co}
supabase.key=${SUPABASE_ANON_KEY}

# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=postgres
spring.datasource.password=${SUPABASE_DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### 3. Frontend Integration (React/Vite)

Update `frontend/.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema Overview

### Core Tables

#### Tenants Table
- Multi-tenant organization support
- Isolates data between different scout organizations

#### Users Table  
- Authentication and user management
- Linked to Supabase Auth
- Role-based permissions (admin, leader, treasurer, member)

#### Members Table
- Scout member profiles and information
- Personal data, emergency contacts
- Section assignments and badges

#### Sections Table
- Scout groups/sections management
- Age-based groupings (Castores, Lobatos, Rangers, etc.)

#### Events Table
- Event planning and management
- Attendance tracking
- Cost and logistics management

#### Transactions Table
- Financial transaction tracking
- Payment records and accounting
- Automated reconciliation

### Security Features

#### Row Level Security (RLS)
- Tenant-based data isolation
- Role-based access restrictions
- Automated policy enforcement

#### Data Validation
- Email format validation
- Phone number constraints
- Age and date validations
- Required field enforcement

#### Audit Logging
- All data changes tracked
- User activity monitoring
- Security event logging

## Troubleshooting

### Verification Commands

```bash
# Check migration status (local vs remote)
supabase migration list

# Verify database connection
supabase db ping

# Check for schema differences
supabase db diff

# Generate diff with migra for cleaner output (experimental)
supabase db diff --use-migra

# Test database integrity
supabase test db

# Check for unused indexes (performance optimization)
supabase inspect db unused-indexes

# View migration history in database
psql "YOUR_DATABASE_URL" -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;"
```

## Best Practices

### Development Workflow

1. **Always test locally first**:
   ```bash
   supabase db reset  # Test migrations locally
   ```

2. **Use version control**:
   - Commit migrations before pushing to production
   - Never modify existing migration files

3. **Environment separation**:
   - Use different Supabase projects for dev/staging/prod
   - Maintain separate environment files

4. **Backup before deployment**:

   ```bash
   # Backup production before major changes
   supabase db dump --db-url "YOUR_CONNECTION_STRING" -f backup_$(date +%Y%m%d_%H%M%S).sql
   
   # For complete backup including roles and data
   supabase db dump --db-url "YOUR_CONNECTION_STRING" -f roles.sql --role-only
   supabase db dump --db-url "YOUR_CONNECTION_STRING" -f schema.sql
   supabase db dump --db-url "YOUR_CONNECTION_STRING" -f data.sql --use-copy --data-only
   ```

5. **Migration workflow**:

   ```bash
   # Create new migration
   supabase migration new descriptive_name
   
   # Generate migration from schema changes
   supabase db diff -f migration_name
   
   # Apply single migration
   supabase migration up
   ```

### Security Considerations

1. **Environment Variables**:
   - Never commit secrets to version control
   - Use secure secret management in production

2. **Database Access**:
   - Limit service role key usage
   - Use least-privilege principles
   - Regular audit of user permissions

3. **Monitoring**:
   - Set up alerts for failed migrations
   - Monitor RLS policy performance
   - Track unusual access patterns

## Support

For issues or questions:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review migration files for comments and explanations
3. Create an issue in the project repository
4. or contact the lead team instead, lol

## Additional Resources

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations Best Practices](https://supabase.com/docs/guides/getting-started/local-development#database-migrations)

---

**Last Updated**: September 17, 2025  
**Version**: 1.0.0  
**Maintainer**: Scout Platform Technical Lead Team
