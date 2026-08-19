# EchoRAG: builds the React frontend, then serves it plus the API from FastAPI.
FROM node:20-slim AS frontend
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install
COPY index.html vite.config.js style.css ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ingestion/ ./ingestion/
COPY backend/ ./backend/
COPY benchmarks/ ./benchmarks/
COPY --from=frontend /app/dist ./dist

# Bake the embedding model into the image so cold start does not pay a download.
RUN python -c "from model2vec import StaticModel; StaticModel.from_pretrained('minishlab/potion-base-8M')"

# The corpus and indexes must be built before the image is useful:
#   python -m ingestion.build_corpus --parquet <file> && python -m ingestion.build_index
# Mount ingestion/data and ingestion/indexes, or COPY them in for a self-contained image.

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s \
  CMD curl -fsS http://localhost:8000/api/health || exit 1

CMD ["uvicorn", "backend.api.server:app", "--host", "0.0.0.0", "--port", "8000"]
