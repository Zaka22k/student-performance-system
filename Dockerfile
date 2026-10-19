# --- ЭТАП 1: Сборка фронтенда (React + Vite) ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Устанавливаем зависимости фронта и собираем проект
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# В результате внутри контейнера появилась папка /app/frontend/dist
# (в vite.config.ts не должно быть build.outDir, иначе путь ниже изменится)


# --- ЭТАП 2: Финальный образ бэкенда ---
FROM node:22-alpine
WORKDIR /app

# Устанавливаем зависимости бэкенда
COPY backend/package*.json ./
RUN npm install

# Копируем код бэкенда
COPY backend/ ./

# Генерируем Prisma-клиент. Подключения к базе тут нет:
# DATABASE_URL нужен только затем, чтобы прочиталась конфигурация Prisma
RUN DATABASE_URL=postgres://build:build@localhost:5432/build npx prisma generate

# Multi-stage: забираем ТОЛЬКО собранную папку dist из первого этапа и кладём её в ./public
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5000

CMD ["npm", "start"]
