# --- ЭТАП 1: Установка зависимостей и сборка Next.js ---
FROM node:22-alpine AS builder
WORKDIR /app

# Фиктивный URL только для этапа сборки (для prisma generate и next build)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1

# 1. Копируем только package.json и ставим зависимости без запуска postinstall
COPY package*.json ./
RUN npm ci --ignore-scripts

# 2. Копируем весь проект целиком и запускаем "build": "prisma generate && next build"
COPY . .
RUN npm run build


# --- ЭТАП 2: Чистый и лёгкий финальный образ для запуска ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=5000

# Забираем только статику и собранный standalone-сервер
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 5000

CMD ["node", "server.js"]
