# Proxmox Deployment Guide (Starter)

## Topology
- VM/CT 1: Postgres (or Supabase managed)
- VM/CT 2: Backend (FastAPI)
- VM/CT 3: Frontend (Nuxt SSR or static behind Nginx)

## Environment
Backend:
- `DATABASE_URL=postgresql+asyncpg://USER:PASS@DB_HOST:5432/DBNAME`
- For Supabase: use the provided connection string (SSL), and forward JWT to Postgres for RLS.

## Reverse Proxy (TLS)
Use Caddy or Nginx:
- `/api` -> backend:8000
- `/` -> frontend:3000 (SSR) or static files

## Database Migrations
Apply in order:
1. `db/migrations/0001_core_schema.sql`
2. `db/migrations/0002_supabase_objects.sql`
3. `db/migrations/0003_row_filters.sql`
4. `db/migrations/0004_seed_demo.sql`

Example:
```bash
psql "$DATABASE_URL" -f db/migrations/0001_core_schema.sql
psql "$DATABASE_URL" -f db/migrations/0002_supabase_objects.sql
psql "$DATABASE_URL" -f db/migrations/0003_row_filters.sql
psql "$DATABASE_URL" -f db/migrations/0004_seed_demo.sql
