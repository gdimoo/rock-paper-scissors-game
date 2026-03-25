# RPS // ARENA 🪨📄✂️

Rock Paper Scissors web game — interview challenge submission.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, SCSS Modules |
| Backend | NestJS 10, TypeScript |
| Database | PostgreSQL 16 + TypeORM |
| Real-time | Socket.io (WebSocket Gateway) |
| Auth | JWT + bcrypt |
| Container | Docker + docker-compose + Nginx |
| Testing | Jest, @testing-library/react |

---

## Project Structure

```
rps-game/
├── rps-frontend/          # Next.js 14 app
│   ├── src/
│   │   ├── app/           # App Router pages (/, /login)
│   │   ├── components/    # GameBoard, ScorePanel, BotDisplay, ActionButtons
│   │   ├── hooks/         # useGame, useWebSocket
│   │   ├── services/      # api.ts — all REST calls
│   │   ├── styles/        # globals.scss, _tokens.scss (light theme)
│   │   └── __tests__/     # Unit tests
│   └── Dockerfile
│
├── rps-backend/           # NestJS app
│   ├── src/
│   │   ├── auth/          # Register, Login, JWT strategy, guards
│   │   ├── game/          # Play logic, WebSocket gateway
│   │   ├── score/         # High score persistence
│   │   └── main.ts
│   └── Dockerfile
│
├── nginx/
│   └── default.conf       # Reverse proxy config
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Features

- ✅ Rock / Paper / Scissors — 3 player actions
- ✅ Bot picks randomly (via Backend API only — no client-side random)
- ✅ UI locked for 2 seconds while bot "thinks" (shows `???`)
- ✅ Your Score — increments on WIN, resets via button
- ✅ High Score — persisted on server, loaded on page load
- ✅ Real-time High Score update via WebSocket (all connected clients sync instantly)
- ✅ Login system (JWT) — score stored in DB per user
- ✅ Guest mode — score stored in cookie when not logged in
- ✅ Responsive — works on Desktop (Chrome/Win10) and Mobile (Safari/iOS15)
- ✅ TypeScript — both Frontend and Backend
- ✅ Docker + docker-compose — single command deploy
- ✅ Unit tests — Frontend (hooks + components) and Backend (services)

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- Git

### 1. Clone the repo

```bash
git clone https://github.com/gdimoo/rock-paper-scissors-game.git
cd rps-game
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET`:

```env
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars
```

### 3. Build and run

```bash
docker compose up --build
```

This starts:
- `postgres` on internal network (port 5432)
- `backend` (NestJS) on internal port 3001
- `frontend` (Next.js) on internal port 3000
- `nginx` on **http://localhost:8080** ← open this in your browser

### 4. Open the game

```
http://localhost:8080
```

---

## Local Development (without Docker)

### Backend

```bash
cd rps-backend
cp .env.example .env          # edit DB_* to point to your local Postgres
npm install
npm run start:dev             # runs on http://localhost:3001
```

### Frontend

```bash
cd rps-frontend
cp .env.example .env.local
npm install
npm run dev                   # runs on http://localhost:3000
```

---

## Running Tests

### Frontend (Unit)

```bash
cd rps-frontend
npm test                      # run all tests
npm run test:coverage         # with coverage report
```

### Backend (Unit)

```bash
cd rps-backend
npm test                      # run all .spec.ts files
npm run test:coverage
```

### API Smoke Test

```bash
# Requires the stack to be running
./scripts/test-api.sh                        # default: http://localhost:8080/api
./scripts/test-api.sh http://your-host/api   # custom target
```

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npx playwright install chromium
npm test                      # headless against http://localhost:8080
BASE_URL=http://your-host npm test
npm run test:ui               # interactive UI mode
npm run test:report           # open HTML report
```

---

## Scaling the Backend

Nginx is configured with an `upstream backend_pool` using `least_conn`. To run multiple backend instances:

```bash
docker compose up --build --scale backend=3
```

Docker's internal DNS resolves the `backend` service name to all replica IPs. Nginx distributes requests using least-connections policy.

---

## API Reference

### Health / Monitor

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns database connectivity status |

Response example:
```json
{ "status": "ok", "info": { "database": { "status": "up" } } }
```

### Auth

| Method | Endpoint | Body | Rate limit | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | `{ username, password }` | 10 / min | Create account → returns JWT |
| `POST` | `/auth/login` | `{ username, password }` | 10 / min | Login → returns JWT |
| `GET` | `/auth/me` | — (JWT header) | 60 / min | Get current user |

### Game

| Method | Endpoint | Auth | Rate limit | Description |
|---|---|---|---|---|
| `POST` | `/game/play` | Optional JWT | **20 / min** | Send action → bot result + updated scores |
| `POST` | `/game/reset` | Optional JWT | 60 / min | Reset your score to 0 |
| `GET` | `/game/state` | Optional JWT | 60 / min | Get current yourScore + highScore |

### Score

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/score/high` | Get current global high score |

### WebSocket events

| Event | Direction | Payload | Description |
|---|---|---|---|
| `score:updated` | Server → Client | `{ highScore: number }` | Emitted to all clients when high score is beaten |

**Authentication:** Include `Authorization: Bearer <token>` header.
**Guest mode:** No header needed — score tracked via `rps_your_score` cookie.

---

## Architecture Decisions

**Why Optional JWT Guard on `/game/play`?**
The game works for both logged-in users and guests. Instead of two separate endpoints, a single endpoint uses `OptionalJwtGuard` — authenticated users get DB-persisted scores, guests get cookie-based scores.

**Why is bot randomness server-side?**
Per requirement: bot action must come from Backend API only (`Math.random()` lives in `game.service.ts`). The frontend never generates the bot action.

**Why Rate Limiting?**
`@nestjs/throttler` is applied globally (60 req/min) with stricter overrides on sensitive endpoints — `/game/play` at 20 req/min prevents score-spam abuse, and `/auth/register` + `/auth/login` at 10 req/min prevent brute-force attacks.

**Why socket.io over raw WebSocket?**
Auto-reconnect, room support, and simpler CORS handling. The gateway uses `@WebSocketGateway` decorator — NestJS handles the socket.io server lifecycle automatically alongside the HTTP server.

**High Score strategy:**
Each time a new high score is set, a row is inserted into `high_scores` (append-only log). `getHighScore()` queries `ORDER BY score DESC LIMIT 1`. This preserves score history without needing an UPDATE.

**Why Nginx upstream with `least_conn`?**
Enables horizontal scaling of the backend (`--scale backend=N`) without any code changes. Docker DNS resolves the service name to all replica IPs; `least_conn` ensures even request distribution under load.

**Why no Kafka/RabbitMQ or Kubernetes?**
Kafka/RabbitMQ and Kubernetes were considered but not added — the game's communication model is synchronous request/response with a single real-time channel (WebSocket), which does not justify the operational overhead of a message broker or container orchestrator at this scale. These can be introduced incrementally as requirements grow: Kafka when async event processing is needed (e.g. leaderboards, match history, notifications), and Kubernetes when the deployment needs auto-scaling, rolling updates, or multi-region availability.

---

## Deployment Notes

- `synchronize: true` is enabled — TypeORM auto-creates tables on first run. No manual migration needed for this project.
- Change `JWT_SECRET` in `.env` before deploying — never use the default.
- The frontend is built with `output: 'standalone'` in Next.js for minimal Docker image size.

---

## Score: Bonus Items Implemented

| Bonus | Status |
|---|---|
| TypeScript (FE + BE) | ✅ |
| SCSS / SASS | ✅ |
| Docker + docker-compose | ✅ |
| Load balancer (Nginx `least_conn` upstream + `--scale`) | ✅ |
| Service monitor (`GET /health` via @nestjs/terminus) | ✅ |
| API testing script (`scripts/test-api.sh`) | ✅ |
| End-to-End Tests (Playwright — auth + gameplay) | ✅ |
| Real-time High Score (WebSocket) | ✅ |
| Login system | ✅ |
| Unit tests (FE + BE) | ✅ |
| Nginx reverse proxy | ✅ |
| Deployment document | ✅ (this README) |
