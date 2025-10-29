# Supabase Database Setup Guide

**Last Updated**: October 29, 2025 | **Version**: 1.0.4 | **Maintainer**: DBA

This README provides comprehensive instructions for setting up and deploying the Supabase database migrations for the Scout Management System.

## Prerequisites

Before setting up the database, ensure you have:

1. **Supabase CLI installed (either using npm, pnpm or manually installing binaries)**:

   ```bash
   # Via pnpm (recommended)
   pnpm install -g @supabase/supabase-cli
   
   # Or using pnpx (no global install)
   pnpx supabase --help

   # Or manually download and install binaries eventually
   ```

2. **Supabase Project**:
   - Ask for your project crededntials with your DBA team

3. **Git Repository Access**:
   - Clone this repository
   - Ensure you're on the correct branch

## Project Structure

```text
plataforma-scouts/
├── backend/                     # Java Spring Boot backend
├── frontend/                    # React frontend
├── supabase/                    # Database configuration
│   ├── migrations/              # SQL migration files
      └── config.toml
│     └── README.md
└── README.md
```

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

#### Direct Migration Push (Recommended)

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

## Troubleshooting

### Verification Commands

```bash
# Check migration status (local vs remote)
supabase migration list

# Check for schema differences
supabase db diff

# Test database integrity
supabase test db

# Check for unused indexes (performance optimization)
supabase inspect db unused-indexes

# View migration history in database
psql "YOUR_DATABASE_URL" -c "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;"
```

## Support

For issues or questions:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review migration files for comments and explanations
3. Create an issue in the project repository
4. or contact the DBAs/lead team instead ;)
