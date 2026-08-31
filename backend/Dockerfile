# Multi-stage production build for NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace @ido-grow/backend

COPY backend ./backend

RUN npm run prisma:generate --workspace @ido-grow/backend
RUN npm run build --workspace @ido-grow/backend

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace @ido-grow/backend --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3001

CMD ["npm", "run", "start:prod", "--workspace", "@ido-grow/backend"]
