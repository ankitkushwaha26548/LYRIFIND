# 🎵 LyriFind — Lyrics Discovery & Management Platform

**Week 2 deliverable – Implementation of a Mini Software Module**
Software Engineering Trainee Internship · YuvaIntern · Author: Ankit Kushwaha

LyriFind lets people search for songs, read lyrics and save favourites; administrators manage the song catalogue.
This repository contains the **Week 2 module**: authentication, role-based authorization, songs CRUD, search / filter / pagination and favourites — a secure REST API plus a responsive React interface. It continues the plan from the Week 1 report.

| Layer | Technology |
|---|---|
| Frontend | **React 18 + Vite 5** (React Router) |
| Styling | **Tailwind CSS 3** (light / dark mode, responsive) |
| Backend | **Node.js + Express 4** |
| Database | **MongoDB + Mongoose 8** |
| Auth / security | bcrypt password hashing, JWT, Helmet, CORS, rate-limiting, input validation |
| Testing | Jest + Supertest (+ mongodb-memory-server) |

> ⚖️ **Lyrics & copyright:** all sample lyrics in `server/scripts/seed.js` are **original text written for this project**. Do not add copyrighted lyrics without a licence.

---

## Features

* 🔐 Register / login (bcrypt + JWT), protected routes, `user` and `admin` roles
* 🔍 Search by title, artist or album · filter by language and genre · pagination · search state kept in the URL
* 📝 Lyrics page for every song
* ❤️ Favourites: save / remove songs, private per user
* 🛠️ Admin dashboard: add, edit and delete songs
* 🌓 Dark / light mode, fully responsive, keyboard- and screen-reader-friendly (labels, `aria-*`, focus rings)
* ✅ 37 automated API tests

## Run without a MongoDB installation

Install **Node.js 18+**, then run these commands from the project root:

```bash
npm run setup
npm run start:embedded
```

The setup command installs dependencies and builds the frontend. The embedded start command downloads and runs a private MongoDB binary the first time, creates sample data, and starts the app. An internet connection is needed for the initial download. Open **http://localhost:5000**. The demo admin account is ........; change the credentials before deployment.

Embedded database files are stored in `server/.embedded-db`. Delete that folder only if you want to reset the local database. If the MongoDB download is blocked, use Docker, a local MongoDB installation, or MongoDB Atlas as described below.

## Quick start (with your own MongoDB)

### 1. Prerequisites
* **Node.js 18+** (`node -v`)
* **A MongoDB database** – choose one:
  * **Docker:** `docker compose up -d` (uses the included `docker-compose.yml`)
  * **Local install:** [MongoDB Community Server](https://www.mongodb.com/try/download/community), running on port 27017
  * **Cloud:** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster – paste its connection string into `MONGO_URI`

### 2. Install
```bash
git clone <your-repo-url> lyrifind
cd lyrifind
npm run install:all          # installs root, server and client dependencies
```

### 3. Configure
```bash
cp server/.env.example server/.env        # Windows (cmd): copy server\.env.example server\.env
```
Open `server/.env` and set at least `JWT_SECRET` (any long random string) and `MONGO_URI`.

### 4. Run (development)
```bash
npm run dev
```
* React app → **http://localhost:5173**  (Vite forwards `/api` calls to the API)
* API → http://localhost:5000/api/health

On first start, when the database is empty, **8 original sample songs and a demo admin are created automatically**.

### 5. Run (production-style, one server)
```bash
npm run build      # builds the React app into client/dist
npm start          # Express serves the API *and* the built React app on http://localhost:5000
```

### 6. Tests
```bash
npm test
```
The tests start an in-memory MongoDB automatically (first run downloads a MongoDB binary, so an internet connection is needed once).
To use an existing database instead: `TEST_MONGO_URI=mongodb://127.0.0.1:27017 npm test` (the tests use their own `lf_*` databases and empty them).

## Usage

**Demo accounts**

| Role | E-mail | Password |
|---|---|---|
| Admin | `admin@lyrifind.local` | `Admin1234` |
| User | register on the *Register* page | min 8 characters, letter + number |

> Change `ADMIN_EMAIL` and the demo admin password before any real deployment.

**As a visitor:** type in the search box (results update as you pause typing), pick a language or genre, open **View lyrics**.
**As a user:** log in, press **🤍 Save** on any song, open **❤ Favorites** to see your list.
**As admin:** open **Admin** in the navigation → **+ Add song**, **Edit**, **Delete**.

### API reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Create account → `{ user, token }` |
| POST | `/api/auth/login` | public | Log in → `{ user, token }` |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/songs` | public | Search. Query: `q, language, genre, page, limit (max 50)` |
| GET | `/api/songs/filters` | public | Distinct languages and genres |
| GET | `/api/songs/:id` | public | One song **with lyrics** |
| POST | `/api/songs` | admin | Create song |
| PUT | `/api/songs/:id` | admin | Update song (partial updates allowed) |
| DELETE | `/api/songs/:id` | admin | Delete song (also removed from favourites) |
| GET | `/api/favorites` | user | My favourites |
| POST | `/api/favorites/:songId` | user | Add favourite |
| DELETE | `/api/favorites/:songId` | user | Remove favourite |

Errors are always JSON `{ "error": "...", "details": ["..."] }` with a meaningful status (400 validation, 401 not logged in, 403 forbidden, 404 not found, 409 conflict, 429 too many attempts).

```bash
# example: search from the command line
curl "http://localhost:5000/api/songs?q=chai&language=Hindi&limit=5"
```

## Data model (Mongoose)

**User** – `name`, `email` (unique, lowercase), `passwordHash` (`select: false`), `role` (`user|admin`), `favorites: [ObjectId → Song]`, timestamps
**Song** – `title*`, `artist*`, `album`, `language`, `genre`, `year`, `lyrics*`, timestamps · indexes on `title`, `artist`, `(language, genre)`

## Project structure

```
lyrifind/
├── client/                      React + Vite + Tailwind front-end
│   ├── src/
│   │   ├── api/client.js        fetch wrapper (adds JWT, normalises errors)
│   │   ├── context/             AuthContext, FavoritesContext
│   │   ├── hooks/               useDebounce, useTheme
│   │   ├── components/          Navbar, SongCard, SongForm, Pagination, ProtectedRoute, …
│   │   ├── pages/               Home, SongDetail, Login/Register, Favorites, Admin, NotFound
│   │   └── App.jsx, main.jsx, index.css
│   ├── tailwind.config.js, vite.config.js, postcss.config.js
│   └── public/theme-init.js     dark-mode flash prevention (external file => CSP-safe)
├── server/                      Express + Mongoose API
│   ├── src/
│   │   ├── server.js            entry: connect DB → seed → listen
│   │   ├── app.js               Express app factory (helmet, cors, routes, serves client/dist)
│   │   ├── config/              env config + DB connection
│   │   ├── models/              User.js, Song.js
│   │   ├── routes/              API route table
│   │   ├── controllers/         thin HTTP layer
│   │   ├── services/            business logic (auth, songs, favourites)
│   │   ├── middleware/          authenticate / requireRole / errorHandler
│   │   └── utils/               validators, AppError, asyncHandler
│   ├── scripts/seed.js          original sample songs + demo admin
│   └── tests/                   Jest + Supertest
├── docs/screenshots/
├── docker-compose.yml           optional local MongoDB
└── package.json                 root scripts (dev, build, start, test)
```

## Architecture & development decisions

```
React (Vite)  ──HTTP/JSON──▶  Express routes ─▶ middleware (JWT, role) ─▶ controllers ─▶ services ─▶ Mongoose models ─▶ MongoDB
```

| Decision | Reasoning |
|---|---|
| **Layered backend** (routes → controllers → services → models) | One job per layer; business rules are independent from HTTP and easy to test. |
| **Vite proxy in development, Express serves `client/dist` in production** | No CORS problems in dev; a single deployable server in production. |
| **App factory (`createApp`) separate from `server.js`** | Tests import the app without opening a port. |
| **bcrypt + JWT; role assigned by the server** | No plain-text passwords; a client can never promote itself to admin. |
| **Identical login error for unknown user / wrong password** | Prevents account enumeration. |
| **`passwordHash` has `select: false`** | The hash can never leak by accident in a query result. |
| **Field whitelisting + Mongoose schema validation** | Blocks mass-assignment; validation exists in the API *and* the database layer. |
| **User input escaped before building a RegExp** | Prevents regex injection / ReDoS in search. |
| **Atomic favourites (`$addToSet` / `$pull` with the condition in the filter)** | No race conditions, no duplicates. |
| **Lyrics excluded from list queries (`select('-lyrics')`)** | Smaller responses; lyrics loaded only when opened. |
| **Search state in the URL + debounced input** | Shareable links, working Back button, fewer API calls. |
| **React Context for auth and favourites** | Small app – no extra state library needed. |
| **Optimistic favourite toggle with rollback** | Instant feedback; reverts if the server refuses. |
| **Helmet, rate-limited auth routes, 100 kb body limit** | Basic hardening against common attacks. |
| **Tailwind `darkMode: 'class'` + external theme script** | Theme persists with no flash; compatible with a strict Content-Security-Policy. |

## Known limitations / next steps (Weeks 3–5)

* Week 3: testing & debugging exercise · Week 4: code review & refactoring · Week 5: performance tests & deployment (Render + Netlify/Vercel or single-server hosting).
* Not yet implemented: password reset, refresh tokens, separate Artist/Album collections, front-end unit tests.

## License
MIT — for educational use.
