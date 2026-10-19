# --- ЭТАП 1: Сборка фронтенда (React + Vite) ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Устанавливаем зависимости фронта и собираем проект
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build
# В результате внутри контейнера появилась папка /app/frontend/dist


# --- ЭТАП 2: Финальный образ бэкенда ---
FROM node:20-alpine
WORKDIR /app

# Устанавливаем зависимости бэкенда
COPY backend/package*.json ./
RUN npm install

# Копируем код бэкенда
COPY backend/ ./

# Магия Multi-stage: забираем ТОЛЬКО собранную папку dist из первого этапа и кладём её в ./public
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5000

CMD ["npm", "start"]