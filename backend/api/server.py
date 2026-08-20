"""
HTTP API.

  POST /api/query       {query, strategy} -> pipeline result
  POST /api/voice       multipart audio   -> Sarvam STT -> pipeline
  GET  /api/health      component status
  GET  /api/strategies  chunking + index stats
  GET  /api/benchmark   last measured report
  GET  /api/corpus      dataset provenance

Indexes load once at startup and stay in memory.
"""

from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.pipeline import stt as stt_mod
from backend.pipeline.orchestrator import Harness
from ingestion import chunking, dataset
from ingestion import embeddings as E
from ingestion.index import HybridIndex

INDEX_DIR = Path(__file__).parent.parent.parent / "ingestion" / "indexes"
REPORTS = Path(__file__).parent.parent.parent / "benchmarks" / "reports"

STATE: Dict[str, Any] = {"registry": {}, "harness": None, "startup_error": None}


def _load_indexes() -> Dict[str, HybridIndex]:
    registry: Dict[str, HybridIndex] = {}
    if not INDEX_DIR.exists():
        return registry
    for name in chunking.STRATEGIES:
        path = INDEX_DIR / f"{name}.pkl"
        if path.exists():
            registry[name] = HybridIndex.load(path)
    return registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        E.warmup()
        registry = _load_indexes()
        STATE["registry"] = registry
        if registry:
            # metadata_aware measures best on R@1/R@5/MRR -- see
            # benchmarks/reports/latency_report.json. atomic is the fallback
            # because it is the strategy the harness degrades to.
            default = next((s for s in ("metadata_aware", "atomic") if s in registry),
                           next(iter(registry)))
            STATE["harness"] = Harness(registry, default_strategy=default)
        else:
            STATE["startup_error"] = (
                "No indexes found. Run: python -m ingestion.build_index"
            )
    except Exception as exc:
        STATE["startup_error"] = f"{type(exc).__name__}: {exc}"
    yield


app = FastAPI(title="EchoRAG", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(..., description="The question to answer.")
    strategy: Optional[str] = Field(None, description="Chunking strategy to retrieve over.")
    top_k: int = Field(20, ge=1, le=100)


def _unavailable() -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"status": "unavailable", "error": STATE["startup_error"]},
    )


@app.post("/api/query")
def query(req: QueryRequest):
    if STATE["harness"] is None:
        return _unavailable()
    result = STATE["harness"].run(req.query, strategy=req.strategy, top_k=req.top_k)
    return result.to_dict()


@app.post("/api/voice")
async def voice(audio: UploadFile = File(...),
                strategy: Optional[str] = Form(None),
                language: str = Form("hi-IN")):
    """503 with status "unconfigured" if SARVAM_API_KEY is unset."""
    if STATE["harness"] is None:
        return _unavailable()

    raw = await audio.read()
    transcription = stt_mod.transcribe(raw, language=language)

    if transcription.status != "success" or not transcription.transcript:
        return JSONResponse(
            status_code=503 if transcription.status == "unconfigured" else 502,
            content={"status": transcription.status, "stt": transcription.to_dict(),
                     "error": transcription.error or "Transcription produced no text."},
        )

    result = STATE["harness"].run(transcription.transcript, strategy=strategy,
                                 stt=transcription)
    return result.to_dict()


@app.get("/api/health")
def health():
    registry = STATE["registry"]
    return {
        "status": "ok" if STATE["harness"] else "degraded",
        "startup_error": STATE["startup_error"],
        "stt": stt_mod.provider_status(),
        "embedding_model": {"name": E.MODEL_NAME, "dim": E.dim() if registry else None,
                            "type": "static (model2vec)"},
        "indexes": {name: ix.stats()["chunks"] for name, ix in registry.items()},
        "corpus_loaded": dataset.is_available(),
    }


@app.get("/api/strategies")
def strategies():
    registry = STATE["registry"]
    return {
        "strategies": [
            {"name": name, "description": chunking.STRATEGIES[name],
             "loaded": name in registry,
             "stats": registry[name].stats() if name in registry else None}
            for name in chunking.STRATEGIES
        ]
    }


@app.get("/api/benchmark")
def benchmark():
    path = REPORTS / "latency_report.json"
    if not path.exists():
        return JSONResponse(status_code=404, content={
            "error": "No benchmark report. Run: python -m benchmarks.harness"})
    return json.loads(path.read_text())


@app.get("/api/corpus")
def corpus():
    if not dataset.is_available():
        return JSONResponse(status_code=404, content={
            "error": "Corpus not built. Run: python -m ingestion.build_corpus"})
    return dataset.manifest()
