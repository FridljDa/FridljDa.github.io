# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# Build needs env placeholders for Astro (PUBLIC_* and server-side vars are inlined or read at runtime)
ENV GEMINI_API_KEY=build-time-placeholder
ENV PUBLIC_SECRET_PASSWORD=build-time-placeholder
RUN npm run build

# Run stage: only standalone server output + production deps
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4321

# Copy package files and install production deps only (for any optional runtime deps)
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built server and client assets from builder (public is in dist/client)
COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
