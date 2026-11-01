# I Do Grow — Client Demo Deployment Runbook

## Overview
This runbook documents the deployment procedures for the I Do Grow Client Demo environment on the OVHcloud multi-project VPS (`217.182.252.225`).

## Architecture & Isolation
- **Compose Project:** `ido-grow-demo`
- **Host Location:** `/home/ubuntu/ido-grow-demo`
- **Network:** Isolated Docker bridge network `ido-grow-demo-net`
- **Port Bindings:** Only host port `443` (TLS) is mapped to Caddy. Host port `80` remains owned by CETUD. PostgreSQL and backend ports are never bound to public interfaces.
- **Volumes:**
  - `ido-grow-demo-postgres-data`: PostgreSQL 16 persistent data
  - `ido-grow-demo-compliance-data`: Uploaded compliance documents storage
  - `ido-grow-demo-caddy-data` & `ido-grow-demo-caddy-config`: TLS certificate cache

## Deployment Steps

1. **Clone / Transfer codebase to VPS:**
   ```bash
   cd /home/ubuntu/ido-grow-demo
   ```

2. **Configure Server-side Environment:**
   ```bash
   cp .env.demo.example .env.demo
   # Populate .env.demo with secure passwords and chosen domain
   chmod 600 .env.demo
   ```

3. **Start PostgreSQL and Validate Health:**
   ```bash
   docker compose --env-file .env.demo -f docker-compose.demo.yaml up -d ido-grow-postgres
   ```

4. **Execute Database Migrations:**
   ```bash
   docker compose --env-file .env.demo -f docker-compose.demo.yaml run --rm ido-grow-backend npx prisma migrate deploy --schema prisma/schema.prisma
   ```

5. **Provision Demo Users (One-off):**
   ```bash
   docker compose --env-file .env.demo -f docker-compose.demo.yaml run --rm ido-grow-backend npm run auth:create-demo-users --workspace @ido-grow/backend
   ```

6. **Start Full Stack:**
   ```bash
   docker compose --env-file .env.demo -f docker-compose.demo.yaml up -d
   ```

7. **Verify Service Status:**
   ```bash
   docker compose --env-file .env.demo -f docker-compose.demo.yaml ps
   ```

## Rollback Procedures
If a rollback is required:
```bash
docker compose --env-file .env.demo -f docker-compose.demo.yaml down
```
The temporary HTML page on port 8082 (`opportunity-os-public`) and CETUD on port 80 remain untouched and active throughout.
