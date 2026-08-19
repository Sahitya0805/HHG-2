"""
Reads the corpus that ingestion.build_corpus produced from the real parquet.

No inlined passages, no sample fixtures -- missing files raise rather than
letting the pipeline look functional with no data behind it.
"""

from __future__ import annotations

import gzip
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

DATA_DIR = Path(__file__).parent / "data"
CORPUS = DATA_DIR / "corpus.jsonl"
QUERIES = DATA_DIR / "queries.jsonl"
MANIFEST = DATA_DIR / "manifest.json"


class CorpusMissing(FileNotFoundError):
    pass


def _resolve(path: Path) -> Path:
    """Prefers the plain .jsonl, falls back to the committed .jsonl.gz."""
    if path.exists():
        return path
    gz = path.with_suffix(path.suffix + ".gz")
    if gz.exists():
        return gz
    return path


def _require(path: Path) -> None:
    if not path.exists():
        raise CorpusMissing(
            f"{path.name} not found. Build it from the real dataset first:\n"
            f"  python -m ingestion.build_corpus --parquet <hinval.parquet>"
        )


def _read_jsonl(path: Path) -> List[Dict[str, Any]]:
    resolved = _resolve(path)
    _require(resolved)
    opener = gzip.open if resolved.suffix == ".gz" else open
    with opener(resolved, "rt", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


@lru_cache(maxsize=1)
def load_passages() -> List[Dict[str, Any]]:
    """Passage records: passage_id, query_id, text, is_selected, query_type, lang."""
    return _read_jsonl(CORPUS)


@lru_cache(maxsize=1)
def load_queries() -> List[Dict[str, Any]]:
    """Query records including gold_passage_ids from MSMARCO `is_selected`."""
    return _read_jsonl(QUERIES)


@lru_cache(maxsize=1)
def manifest() -> Dict[str, Any]:
    _require(MANIFEST)
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def passages_by_query() -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for p in load_passages():
        grouped.setdefault(p["query_id"], []).append(p)
    return grouped


def is_available() -> bool:
    return all(_resolve(p).exists() for p in (CORPUS, QUERIES, MANIFEST))
