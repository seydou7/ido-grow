# I Do Grow

I Do Grow is organized as an npm workspace with separate frontend and backend applications.

## Applications

- `frontend/` — Next.js, React, TypeScript, and Tailwind CSS
- `backend/` — NestJS and TypeScript modular-monolith foundation

The foundation intentionally contains no database, authentication provider, ORM, queue, AI provider, storage vendor, payment integration, WhatsApp integration, business module, or Platform Agent.

## Requirements

- Node.js 20.9 or newer
- npm 11

## Commands

```bash
npm install
npm run build
npm run lint
npm run typecheck
npm test
```

Run either application independently:

```bash
npm run dev:frontend
npm run dev:backend
```
