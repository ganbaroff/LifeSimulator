# 🐳 Dockerfile for Life Simulator Azerbaijan
# Создано: DevOps (Agile Team)
# Версия: 3.0.0

# Multi-stage build for optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY yarn.lock* ./

# Install dependencies based on the preferred package manager
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Disable telemetry during the build
ENV EXPO_NO_DOCTOR=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expo

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Create app directory and set permissions
RUN mkdir -p /app/uploads && chown -R expo:nodejs /app/uploads

USER expo

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]

# Development stage
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development
ENV EXPO_NO_DOCTOR=1

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create a non-root user for development
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expo

# Create necessary directories
RUN mkdir -p /app/uploads && chown -R expo:nodejs /app/uploads

USER expo

# Expose development port
EXPOSE 19006

# Start development server
CMD ["npm", "run", "start"]

# Test stage
FROM base AS test
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Run tests
RUN npm run test

# Lint stage
FROM base AS lint
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Run linting
RUN npm run lint

# Format check stage
FROM base AS format
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Check formatting
RUN npm run format:check

# Type check stage
FROM base AS type-check
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Run type checking
RUN npm run type-check
