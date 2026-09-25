# One image: builds the SPA and runs the API, which also serves the SPA.
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci

COPY . .
RUN npx --workspace apps/api prisma generate \
  && npm run build --workspace apps/web

ENV NODE_ENV=production PORT=4000
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/server.ts"]
