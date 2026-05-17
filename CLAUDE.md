# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeetCode Motivation is a full-stack web application that tracks LeetCode progress and awards points redeemable for real-world rewards. Backend is Spring Boot deployed as AWS Lambda; frontend is React hosted on Vercel.

Production domain: `leetstreak.pro`. Frontend: `leetcode-motivation.vercel.app`.

## Development Commands

### Backend

```bash
cd backend

# Run locally with dev profile (requires PostgreSQL on localhost:5432)
./gradlew bootRun --args='--spring.profiles.active=dev'

# Build + produce Lambda ZIP at build/distributions/app-lambda.zip
./gradlew buildZip

# Run all tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.grishin.leetcodemotivation.stats.LeetcodeClientTest"
```

**PostgreSQL** for development — run locally or point at any PostgreSQL instance:
```bash
# Docker (quickest)
docker run -p 5432:5432 -e POSTGRES_DB=leetcode_motivation -e POSTGRES_PASSWORD=postgres postgres:16

# Override connection via env vars if needed
export DB_URL=jdbc:postgresql://localhost:5432/leetcode_motivation
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
```

The dev profile uses `ddl-auto: update`, so Hibernate creates/updates the schema automatically on first run. No manual table creation needed.

### Frontend

```bash
cd web-ui
npm install
npm start        # dev server on port 3000
npm run build
```

Frontend env vars (`.env.local`):
```
REACT_APP_API_HOST=http://localhost:6084
# Optional: REACT_APP_USE_MOCK_API=true
```

### Deploy to AWS

```bash
export JWT_SECRET="your-secret-here-must-be-32-chars-min"
export ALERT_EMAIL="you@example.com"
export DB_URL="jdbc:postgresql://<cloud-sql-public-ip>:5432/<dbname>?ssl=true&sslmode=require"
export DB_USERNAME="your-db-user"
export DB_PASSWORD="your-db-password"
bash infrastructure/deploy.sh
```

After deploy, copy the `ApiUrl` output and set it as `REACT_APP_API_HOST` in your Vercel project environment variables.

## Architecture

### Backend (Spring Boot → AWS Lambda)

**Profiles**: `dev` connects to a local PostgreSQL instance (default: `localhost:5432/leetcode_motivation`). `prod` connects to Google Cloud SQL; credentials come from `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` Lambda env vars.

**Auth**: JWT tokens (stateless, no server-side sessions). Login returns a `token` in the response body. Frontend stores it in `localStorage` and sends it as `Authorization: Bearer <token>`. `JwtAuthFilter` validates the token on every request and sets the Spring Security principal to the user's email.

**Package structure**:
- `user/` — registration, login, `UsersController`, `UserService`, `UserRepository` (Spring Data JPA)
- `stats/` — LeetCode GraphQL integration (`LeetcodeClient`), sync logic (`LeetcodeService`), `Costs` config
- `rewards/` — rewards catalog from YAML (`RewardsProperties`), redemption (`RewardsService`)
- `payment/` — `PaymentService` (stub that only logs; actual payment not implemented)
- `spring/security/` — `SpringSecurityConfiguration` (stateless JWT), `JwtService`, `JwtAuthFilter`, `UserDetailsServiceImpl`
- `LambdaHandler.java` — Lambda entry point; wraps the Spring Boot app via `aws-serverless-java-container`

All REST endpoints are under `/api` context path. CSRF is disabled (JWT handles request forgery protection). CORS is restricted to origins in `app.cors.allowed-origins`.

**Database (Google Cloud SQL — PostgreSQL)**:
- Table: `users` — partition key `username` (String), unique index on `email`
- `SolvedTasks` is an `@Embeddable` stored as columns (`solved_easy`, `solved_medium`, `solved_hard`, `last_sync`) directly in the `users` table
- Dev: `ddl-auto: update` (Hibernate auto-creates/migrates). Prod: `ddl-auto: validate`
- Connection: direct TCP to Cloud SQL public IP with SSL (`sslmode=require`). Add the Lambda NAT IP to Cloud SQL authorized networks.
- HikariCP pool size is capped at 2 in prod to limit concurrent connections from Lambda.

**Point system** (configured in `application.yml`):
- `costs.easy-cost: 100`, `medium-cost: 300`, `hard-cost: 700` — points earned per solved problem
- `payment.point.value: 10` — cents per point when redeeming
- Sync allows skipping problems; skips are validated server-side in `LeetcodeService`

**Rewards catalog** is defined entirely in `application.yml` under `rewards.items`. Images are served from `/api/images/**`.

### AWS Infrastructure (`infrastructure/cloudformation.yml`)

- **Lambda** (`java21` runtime, 512MB, 30s timeout)
  - `ReservedConcurrentExecutions: 3` — hard cap to prevent runaway billing
- **API Gateway HTTP API** — throttled at 10 req/s rate / 20 req/s burst
- **AWS Budgets** — alerts at 80% and 100% of monthly limit (default $1)
- **Budget enforcer Lambda** (Python) — triggered by SNS when 100% threshold is hit; sets the app Lambda's reserved concurrency to **0**, stopping it from responding

To re-enable after a budget shutdown:
```bash
aws lambda put-function-concurrency \
  --function-name leetcode-motivation-app \
  --reserved-concurrent-executions 3
```

### React Frontend

Routes: `/` (home/dashboard), `/login`, `/signup`, `/redeem`.

`axiosConfig.js`: reads JWT from `localStorage` on every request and adds `Authorization: Bearer` header. On 401/403 responses, clears the JWT and redirects to `/login`.

`Login.js`: on success, stores the `token` field in `localStorage` and remaining user data in `sessionStorage`. `App.js` polls `/api/user/me` every 5 minutes to detect session expiry.

`REACT_APP_USE_MOCK_API=true` enables a local mock that bypasses the real API (`services/mockApi.js`).

## Key Notes

- **Cold starts**: Spring Boot on Lambda takes 5–15 seconds on cold start. Warm invocations are ~500ms. Acceptable for a personal low-traffic app.
- `LeetcodeClientTest` makes real HTTP calls to LeetCode's GraphQL API; the `loginWithGoogle` test requires ChromeDriver. These are not unit tests.
- `LambdaHandler` uses `httpApiV2Proxy()` — matches the HTTP API v2 payload format used in CloudFormation.
- The `JWT_SECRET` env var must be set when deploying. The default in `application.yml` is for local dev only.
