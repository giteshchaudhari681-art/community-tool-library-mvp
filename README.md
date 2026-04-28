# Community Tool Library

## Overview
Community Tool Library is a neighborhood sharing app where residents can list tools and borrow them from each other.

## MVP
The restored MVP supports:

- Add a tool
- View all tools
- Borrow a tool
- Return a tool

## Local Setup

### 1. Configure the database
Create a PostgreSQL database and set the connection string in `server/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tool_library_broken?schema=public"
```

You can copy `server/.env.example` to `server/.env` and edit it.

### 2. Start the backend

```bash
cd server
npm install
npx prisma generate
npx prisma db push
node index.js
```

The API runs on `http://localhost:5000`.

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```

The Vite app runs on `http://localhost:3000`.

## Notes
- The frontend uses the Vite proxy to forward `/api` requests to the backend.
- Prisma 7 is configured through `server/prisma.config.js`, and the runtime client lives in `server/prismaClient.js`.
- A health check is available at `GET /health`.
- The hosted demo is deployed on Vercel. Local development uses Prisma with PostgreSQL, while the deployed backend uses GitHub-backed storage through `server/toolStore.js` to persist the MVP tool data online.
