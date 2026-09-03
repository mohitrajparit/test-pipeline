# Daylist

A simple unauthenticated todo app with a React/Vite frontend, Express API, and PostgreSQL database.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:5173.

## Run locally

Start PostgreSQL with a database named `todos`, then run the API and client in separate terminals:

```bash
cd server
npm install
npm run dev
```

```bash
cd client
npm install
npm run dev
```

The API uses `DATABASE_URL` when provided, otherwise `postgres://postgres:postgres@localhost:5432/todos`.
