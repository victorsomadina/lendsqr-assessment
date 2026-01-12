# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/database ./src/database
COPY --from=builder /app/ormconfig.ts ./ormconfig.ts
COPY --from=builder /app/.env.example ./.env.example

EXPOSE 8080
ENV PORT 8080
ENV NODE_ENV production

CMD ["node", "dist/src/server/server.js"]
