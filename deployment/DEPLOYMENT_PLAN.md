# LyriFind deployment plan
Target: React/Vite frontend on Netlify, Express/Node API on Render, MongoDB Atlas database.
## Configuration
Frontend: VITE_API_BASE_URL. Backend: MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN, NODE_ENV=production. Store secrets only in host environment settings; never commit .env. Use HTTPS, least-privilege DB credentials, restricted CORS, request validation, security headers and rate limiting on authentication routes.
## Sequence
1. Provision Atlas database/user and restrict network access.
2. Deploy backend from backend directory; configure env vars and verify /api/health (add a simple HTTP 200 health route if absent).
3. Deploy frontend build to Netlify with VITE_API_BASE_URL set to backend URL.
4. Set backend CORS allowlist to the exact frontend origin and redeploy.
5. Smoke-test registration, login, search, favorites and admin CRUD; inspect logs.
## Rollback
Keep the previous known-good release. If smoke tests fail or 5xx errors rise materially, redeploy previous frontend/backend releases and revert the faulty commit. For schema changes, take a backup first and use backward-compatible migrations. Record incident time, routes, errors, rollback and follow-up.
## Monitoring
Track p50/p95 API latency, 5xx rate, request volume, CPU, memory/RSS, restarts, DB connection failures and auth rate-limit events. Set alert thresholds from a staging baseline.
