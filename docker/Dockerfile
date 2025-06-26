# syntax=docker/dockerfile:1.5

# ---------- 1️⃣ Base image ----------
    ARG NODE_VERSION=20
    FROM node:${NODE_VERSION}-alpine AS base
    
    RUN apk add --no-cache libc6-compat
    WORKDIR /app
    
    # ---------- 2️⃣ Dependencies (keep Alpine) ----------
    FROM base AS deps
    WORKDIR /app
    
    COPY package.json package-lock.json* pnpm-lock.yaml* ./
    
    RUN --mount=type=cache,target=/root/.cache \
        if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --no-frozen-lockfile; \
        elif [ -f package-lock.json ]; then npm ci; \
        else echo "Lockfile not found." && exit 1; fi
    
    # ---------- 🧱 Build (use Debian slim here) ----------
    FROM node:${NODE_VERSION}-slim AS builder
    WORKDIR /app
    
    # Required native deps for canvas
    RUN apt-get update && apt-get install -y \
        build-essential \
        libcairo2-dev \
        libjpeg-dev \
        libpango1.0-dev \
        libgif-dev \
        librsvg2-dev \
        python3 \
        && rm -rf /var/lib/apt/lists/*
    
    ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ARG NEXT_PUBLIC_GITHUB_CLIENT_ID
    ARG NEXT_PUBLIC_API_BASE_URL
    ARG NEXT_PUBLIC_DOCKER_BACKEND_URL
    ARG ENV
    ARG NEXT_PUBLIC_ENV
    
    ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
    ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID
    ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
    ENV NEXT_PUBLIC_DOCKER_BACKEND_URL=$NEXT_PUBLIC_DOCKER_BACKEND_URL
    ENV ENV=$ENV
    ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV
    ENV NEXT_TELEMETRY_DISABLED=1
    
    COPY --from=deps /app/node_modules ./node_modules
    COPY . .
    
    RUN if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
        elif [ -f package-lock.json ]; then npm run build; \
        else echo "Lockfile not found." && exit 1; fi
    
    # ---------- 4️⃣ Runtime (back to Alpine) ----------
    FROM base AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    
    RUN addgroup --system --gid 1001 nodejs \
        && adduser  --system --uid 1001 nextjs
    
    COPY --from=builder /app/public ./public
    COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
    COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
    
    USER nextjs
    
    EXPOSE 3000
    ENV PORT=3000
    ENV HOSTNAME=0.0.0.0
    
    HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
        CMD wget -qO- http://0.0.0.0:3000/ || exit 1
    
    CMD ["node", "server.js"]
    