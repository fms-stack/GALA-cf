# Cook & Food Gala · image unique (site React + API FastAPI) · Render, ou tout hébergeur Docker.

# --- 1. Build du site public ---
FROM node:20-slim AS front
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund
COPY frontend/ ./
# API sur la même origine : le site appelle /api directement
ENV REACT_APP_BACKEND_URL="" GENERATE_SOURCEMAP=false CI=false
RUN npx craco build

# --- 2. API + service du site ---
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 FRONTEND_BUILD_DIR=/app/frontend/build
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=front /app/frontend/build /app/frontend/build
EXPOSE 8001
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001} --proxy-headers --forwarded-allow-ips='*'"]
