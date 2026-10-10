# 🎵 LyriFind — Lyrics Discovery & Management Platform
> ⚖️ **Lyrics & copyright:** all sample lyrics in `scripts/seed.js` are **original text written for this project**. Do not add copyrighted lyrics without a licence.

---

## Features

| Area | What it does |
|---|---|
| Authentication | Register / login with bcrypt-hashed passwords and JWT access tokens |
| Authorization | Role-based access: `user` vs `admin`; admin-only song management |
| Songs CRUD | Create, read, update, delete songs (admin) with full input validation |
| Search | Case-insensitive search by title / artist / album, filter by language & genre, sorted, paginated |
| Favorites | Logged-in users save / remove songs; private per user |
| Web UI | Search page, lyrics viewer, login/register, favorites, admin "add song" form, dark-mode aware, responsive |
| Quality | 34 automated tests (Jest + Supertest), ~95 % line coverage |

## Tech stack

Node.js 18+ · Express 4 · JSON Web Tokens · bcryptjs · Jest + Supertest · vanilla HTML/CSS/JS front-end.
Storage: **JSON file by default (zero setup)** or **MongoDB** via Mongoose (see "Choosing a database").

## Installation

```bash
# 1. Prerequisites: Node.js 18 or newer  (check with: node -v)
git clone <your-repo-url> lyrifind
cd lyrifind

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env        # Windows: copy .env.example .env
#    then open .env and set JWT_SECRET to a long random string

# 4. Start the server (sample songs + demo admin are created on first run)
npm start
```

Open **http://localhost:5000** in your browser.

## Usage

### Demo accounts
| Role | E-mail | Password |
|---|---|---|
| Admin | `admin@lyrifind.local` | `Admin1234` |
| User | register your own from the UI | min 8 chars, letter + number |

> Change the demo admin password / `ADMIN_EMAIL` before any real deployment.

### Using the web UI
1. Type in the search box or pick a language / genre → **Search**.
2. **View lyrics** opens the lyrics dialog.
3. **Login / Register** → then **❤ Save** to favourite a song; **❤ My favorites** shows your list.
4. Logged in as admin you also get **Delete** buttons and an **Add a song** form.

### Using the API (curl examples)
```bash
# Register
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Ankit","email":"ankit@example.com","password":"Ankit1234"}'

# Search: title/artist/album text, filters, paging
curl "localhost:5000/api/songs?q=chai&language=Hindi&page=1&limit=5"

# Login as admin and create a song
TOKEN=$(curl -s -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@lyrifind.local","password":"Admin1234"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")
curl -X POST localhost:5000/api/songs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My Song","artist":"Me","language":"English","lyrics":"original lyrics here"}'
```

### API reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create account → `{user, token}` |
| POST | `/api/auth/login` | public | Log in → `{user, token}` |
| GET | `/api/auth/me` | user | Current user profile |
| GET | `/api/songs` | public | Search/filter/paginate. Query: `q, language, genre, page, limit (max 50)` |
| GET | `/api/songs/:id` | public | One song **with lyrics** |
| POST | `/api/songs` | admin | Create song |
| PUT | `/api/songs/:id` | admin | Update song (partial updates allowed) |
| DELETE | `/api/songs/:id` | admin | Delete song (also removes it from favourites) |
| GET | `/api/favorites` | user | List my favourites |
| POST | `/api/favorites/:songId` | user | Add favourite |
| DELETE | `/api/favorites/:songId` | user | Remove favourite |

Errors are always JSON: `{ "error": "message", "details": ["..."] }` with a proper status code
(400 validation, 401 not logged in, 403 forbidden, 404 not found, 409 conflict).

## Running the tests

```bash
npm test
```
Runs 34 tests with a coverage report. Tests use an in-memory store, so they never touch your data.

## Project structure

```
lyrifind/
├── src/
│   ├── server.js            # entry point: store -> seed -> app.listen
│   ├── app.js               # Express app factory (middleware + routes)
│   ├── config/              # all environment variables in one place
│   ├── routes/              # API route table (who can call what)
│   ├── controllers/         # thin HTTP layer (req -> service -> res)
│   ├── services/            # business logic (auth, songs, favourites)
│   ├── middleware/          # JWT auth, role check, error handling
│   ├── store/               # data layer: jsonStore (default) / mongoStore
│   └── utils/               # validators, AppError, asyncHandler
├── public/                  # demo web UI (index.html, app.js, styles.css)
├── scripts/seed.js          # original sample songs + demo admin
├── tests/                   # Jest + Supertest test suites
├── docs/screenshots/        # UI screenshots
├── .env.example
└── package.json
```

## Architecture & development decisions

```
 Browser UI ──HTTP/JSON──▶ routes ─▶ middleware (JWT, role) ─▶ controller ─▶ service ─▶ store (JSON | MongoDB)
```

| Decision | Reasoning |
|---|---|
| **Layered architecture** (routes → controllers → services → store) | Each layer has one job; business rules can be tested without HTTP, and the database can change without touching them. |
| **Repository/"store" interface with two implementations** | The Week 1 plan chose MongoDB. A JSON-file store lets any reviewer run the project with `npm install && npm start` and keeps tests fast, while `STORAGE=mongo` switches to MongoDB with zero service changes. |
| **App factory + dependency injection** (`createApp(store)`) | Tests build a fresh app with an in-memory store each time — isolated and deterministic. |
| **bcrypt + JWT** | Passwords are never stored in plain text; stateless tokens suit a REST API and a separate front-end. |
| **Role decided by the server** | The client can never send `role: "admin"`; admin is granted only to `ADMIN_EMAIL`. |
| **Identical login error for unknown user / wrong password** | Prevents account enumeration. |
| **Whitelist fields on create/update** | Blocks mass-assignment (e.g. forging `id`). |
| **Hand-written validators returning all errors** | Small, dependency-free, and the client sees every problem at once. |
| **List view omits lyrics** | Smaller payloads for search results; lyrics fetched only when opened. |
| **Pagination limits clamped (1–50)** | A bad or hostile `limit` cannot overload the server. |
| **`escape()` in UI before inserting text into HTML** | Prevents XSS from stored song titles/lyrics. |

### Choosing a database

* **Default (`STORAGE=json`)** – data in `data/db.json`; nothing else to install.
* **MongoDB (`STORAGE=mongo`)** – set `MONGO_URI` in `.env` and run `npm install` (installs the optional `mongoose` package). Same API, same behaviour.
  *Note:* the automated test-suite targets the JSON store; the Mongo adapter implements the identical interface and is intended for the deployment stage (Week 5).

## Known limitations / planned next steps (Weeks 3–5)

* Week 3: deeper testing & debugging exercise · Week 4: code review & refactoring · Week 5: performance tests & deployment.
* Not yet implemented: password reset, rate-limiting, refresh tokens, artist/album as separate entities, React front-end.

## License
MIT — for educational use.
