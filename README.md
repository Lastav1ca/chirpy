A small Twitter-like HTTP API built while working through the boot.dev course
*Learn HTTP Servers in TypeScript*.

## Stack

- TypeScript + Express 5
- PostgreSQL with Drizzle ORM
- Vitest for unit tests

## Setup

Requires Node 20+ and a running PostgreSQL instance.

```bash
npm install
```

Create a `.env` file in the project root:

```
DB_URL="postgres://user:password@localhost:5432/chirpy"
PLATFORM="dev"
JWT_SECRET="<openssl rand -base64 64>"
```

Then start the server (migrations run automatically on startup):

```bash
npm run dev     # builds and runs on :8080
npm test        # unit tests
```

## Endpoints

| Method | Path                  | Auth   | Description                          |
| ------ | --------------------- | ------ | ------------------------------------ |
| POST   | `/api/users`          | –      | Create a user                        |
| PUT    | `/api/users`          | JWT    | Update own email and password        |
| POST   | `/api/login`          | –      | Log in, returns access + refresh token |
| POST   | `/api/refresh`        | refresh| Issue a new access token             |
| POST   | `/api/revoke`         | refresh| Revoke a refresh token               |
| POST   | `/api/chirps`         | JWT    | Post a chirp                         |
| GET    | `/api/chirps`         | –      | List all chirps                      |
| GET    | `/api/chirps/:chirpId`| –      | Get a single chirp                   |
| GET    | `/api/healthz`        | –      | Health check                         |
| GET    | `/admin/metrics`      | –      | Fileserver hit counter               |
| POST   | `/admin/reset`        | –      | Delete all users (dev only)          |
