# Week 5 Performance Evaluation — LyriFind
## Method
A deterministic synthetic dataset of 5,000 song records was created. Each operation ran 500 measured iterations after 100 warm-up calls. Node performance hooks recorded average, p50, p95 and throughput. Process heap/RSS and CPU time were sampled. This is a local in-process microbenchmark, not HTTP load or deployed hosting measurement.
## Environment
- Node: v22.16.0
- Platform: linux x64
- CPU: INTEL(R) XEON(R) PLATINUM 8573C; logical CPUs: 3
## Results
| Operation | Iterations | Average ms | p50 ms | p95 ms | Ops/sec |
|---|---:|---:|---:|---:|---:|
| Search title/artist/album | 500 | 0.904 | 0.726 | 2.126 | 1106.8 |\n| Filter by language | 500 | 0.197 | 0.119 | 0.504 | 5074.4 |\n| Validate one record | 500 | 0 | 0 | 0 | 2255727.3 |\n
## Resource observations
Heap before: 6.56 MB; heap after: 6.69 MB; RSS after: 34 MB. CPU user: 553.06 ms; system: 3.22 ms.
## Test evidence
The included Node test suite was executed with `npm test` from `backend/`. These tests cover the focused utility functions only.
## Analysis and optimization
Search and language filtering scan the in-memory array linearly (O(n)). For larger catalogues, move filtering/search to MongoDB with suitable indexes, pagination and field projection. Debounce frontend search, avoid loading the entire catalogue, and cache frequently requested catalogue data with safe invalidation after admin edits. Validate real API p50/p95/p99 latency, throughput and error rate in staging before/after changes.
## Deployment and rollback
The proposed stack is React/Vite on Netlify, Express/Node on Render and MongoDB Atlas. Set environment variables in host dashboards, restrict CORS to the frontend origin, use HTTPS, least-privilege DB access, validation, security headers and auth rate limits. Deploy backend, verify health, deploy frontend, configure CORS, then smoke-test auth/search/favorites/admin flows. Keep the prior known-good release; rollback frontend/backend and revert the faulty commit if smoke tests fail or 5xx rate rises. See `deployment/DEPLOYMENT_PLAN.md`.
## Limitations
The measured figures are from this environment and synthetic data. They do not represent production performance or hosted app latency. A controlled HTTP load test against staging is still required.
