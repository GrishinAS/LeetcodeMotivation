# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeetCode Motivation is a full-stack web application that tracks LeetCode progress and awards points redeemable for real-world rewards. Backend is Spring Boot, frontend is React.

Production domain: `leetstreak.pro`. Frontend hosted on Vercel (`leetcode-motivation.vercel.app`).

## Development Commands

### Backend

```bash
cd backend

# Run with dev profile (SQLite, port 6084)
./gradlew bootRun --args='--spring.profiles.active=dev'

# Build
./gradlew build

# Run all tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.grishin.leetcodemotivation.stats.LeetcodeClientTest"
```

### Frontend

```bash
cd web-ui

npm install
npm start        # dev server on port 3000
npm run build
```

Frontend env vars (create `.env.local`):
```
REACT_APP_API_HOST=http://localhost:6084
REACT_APP_ENV=development
# Optional: REACT_APP_USE_MOCK_API=true  (bypasses real API calls)
```

## Architecture

### Spring Boot Backend

**Profiles**: `dev` uses SQLite (`mydb.db`), `prod` uses PostgreSQL (via `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` env vars). Production runs on port 8443 with SSL; dev runs on port 6084 without SSL.

**Package structure**:
- `user/` — registration, login, session (`UsersController`, `UserService`, `UserRepository`, `User` entity)
- `stats/` — LeetCode GraphQL integration (`LeetcodeClient`), sync logic (`LeetcodeService`), `Costs` config
- `rewards/` — rewards catalog (`RewardsProperties` mapped from YAML), redemption (`RewardsService`)
- `payment/` — `PaymentService` (currently a stub that only logs; actual payment not implemented)
- `spring/security/` — Spring Security config, CSRF handler, `UserDetailsServiceImpl`

All REST endpoints are under `/api` context path. CSRF is enforced on state-changing endpoints (except `/user/login` and `/user/signup`). CORS is restricted to origins in `app.cors.allowed-origins`.

**Point system** (configured in `application.yml`):
- `costs.easy-cost: 100`, `medium-cost: 300`, `hard-cost: 700` — points earned per solved problem
- `payment.point.value: 10` — cents per point when redeeming
- Sync allows skipping problems (e.g. unsolved ones counted due to contest) — validated server-side

**Rewards catalog** is defined entirely in `application.yml` under `rewards.items` and served as-is via `/api/rewards`. Images are served from `/api/images/**` (static resources in `resources/static/images/`).

### React Frontend

Routes: `/` (home/dashboard), `/login`, `/signup`, `/redeem`.

`axiosConfig.js` creates the Axios instance. Set `REACT_APP_USE_MOCK_API=true` to use `services/mockApi.js` instead of the real backend. Any non-2xx response clears session storage and redirects to `/login` (with a 100ms delay to allow the error to surface).

Session validity is checked via `GET /api/user/me` on page load and polled every 5 minutes while the user is logged in.

CSRF: The `XSRF-TOKEN` cookie is set by the backend with `SameSite=None`; POST requests must include it in the `X-XSRF-TOKEN` header.

## Key Configuration Notes

- Production CORS origin is set via `CORS_ALLOWED_ORIGINS` env var (defaults to Vercel URL)
- `LeetcodeClientTest` makes real HTTP calls to LeetCode's GraphQL API and the `loginWithGoogle` test requires ChromeDriver — these are not unit tests
- Session timeout is 24h in both profiles; dev cookies are `secure: false`, prod cookies are `secure: true, same-site: none`
