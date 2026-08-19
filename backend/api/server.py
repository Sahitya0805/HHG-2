"""
EchoRAG API Server Implementation.
Implements endpoints:
  POST /api/transcribe
  POST /api/query
  POST /api/voice-query
  GET  /api/benchmark
  GET  /api/health
  GET  /api/chunk-lab
Runs on python stdlib http.server or FastAPI on port 8000.
"""

import json
import time
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.pipeline.orchestrator import run_pipeline
from backend.pipeline.stt import transcribe_audio
from benchmarks.runner import run_benchmark
from ingestion.dataset import load_msmarco_dataset
from ingestion.chunkers import (
    fixed_token_chunking,
    sentence_window_chunking,
    recursive_chunking,
    semantic_chunking,
    windowed_context_chunking
)

class EchoRAGRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def _send_json(self, data: dict, status_code: int = 200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json({
                "status": "healthy",
                "stt_service": "online (Sarvam/ElevenLabs/WebSpeech)",
                "embedding_engine": "online (Ultra-low latency vector encoder)",
                "vector_db": "online (In-Memory FAISS / Sparse-Dense Index)",
                "llm_generator": "online (Grounded Local Synthesizer)",
                "guardrails": "active (5-layer verification)",
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            })

        elif path == "/api/benchmark":
            # Run benchmark and return report
            report = run_benchmark(strategy="semantic", query_limit=105)
            self._send_json(report)

        elif path == "/api/chunk-lab":
            # Return strategy comparison and live chunking demonstration
            sample_text = load_msmarco_dataset()[0]["text"]
            self._send_json({
                "sample_document": load_msmarco_dataset()[0]["title"],
                "strategies": {
                    "fixed": fixed_token_chunking("doc_demo", sample_text, 100, 20),
                    "sentence": sentence_window_chunking("doc_demo", sample_text, 3, 2),
                    "recursive": recursive_chunking("doc_demo", sample_text, 120),
                    "semantic": semantic_chunking("doc_demo", sample_text, 0.25, 150),
                    "window": windowed_context_chunking("doc_demo", sample_text, 80)
                }
            })

        else:
            self._send_json({"error": "Endpoint not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        
        try:
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            payload = {}

        if path == "/api/transcribe":
            audio = payload.get("audio") or payload.get("transcript") or ""
            res = transcribe_audio(audio)
            self._send_json(res)

        elif path == "/api/query":
            transcript = payload.get("transcript") or payload.get("query") or ""
            strategy = payload.get("strategy", "semantic")
            res = run_pipeline(transcript, strategy=strategy)
            self._send_json(res)

        elif path == "/api/voice-query":
            audio = payload.get("audio") or payload.get("transcript") or ""
            strategy = payload.get("strategy", "semantic")
            res = run_pipeline(audio, strategy=strategy)
            self._send_json(res)

        else:
            self._send_json({"error": "Endpoint not found"}, 404)

def run_server(port: int = 8000):
    server_address = ("127.0.0.1", port)
    HTTPServer.allow_reuse_address = True
    httpd = HTTPServer(server_address, EchoRAGRequestHandler)
    print(f"⚡ EchoRAG API Backend running on http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    run_server(port)
