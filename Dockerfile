# Multi-stage Dockerfile for EchoRAG
FROM python:3.10-slim AS backend

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ingestion/ ./ingestion/
COPY backend/ ./backend/
COPY benchmarks/ ./benchmarks/

EXPOSE 8000

CMD ["python", "-m", "backend.api.server", "8000"]
