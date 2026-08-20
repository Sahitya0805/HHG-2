"""
Hybrid index: dense cosine (one numpy matmul) fused with BM25 over an inverted
index. Dense catches paraphrase, BM25 catches rare exact tokens that a 256-dim
static vector blurs away.

Important: the fused score ranks, but it can't be thresholded. BM25 is
unbounded and gets max-normalised per query, so the top hit scores ~1.0 for
every query including nonsense ones -- abstention on a fused score would never
fire. dense_score (raw cosine) is comparable across queries and is what the
guardrail uses. Both ride along on every Hit.
"""

from __future__ import annotations

import math
import pickle
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

from . import embeddings as E

BM25_K1 = 1.5
BM25_B = 0.75
MIN_IDF = 0.35                # below this a term is ~stopword; skip it
DEFAULT_ALPHA = 0.65          # weight on dense; 1-alpha on sparse


@dataclass
class Hit:
    chunk_id: str
    passage_id: str
    query_id: str
    strategy: str
    text: str
    core_text: str
    score: float              # fused, for ranking
    dense_score: float        # raw cosine, calibrated -> used by guardrails
    sparse_score: float
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id, "passage_id": self.passage_id,
            "query_id": self.query_id, "strategy": self.strategy,
            "text": self.core_text or self.text,
            "score": round(self.score, 4),
            "dense_score": round(self.dense_score, 4),
            "sparse_score": round(self.sparse_score, 4),
            "metadata": self.metadata,
        }


class HybridIndex:
    """In-memory hybrid index over one chunking strategy's output."""

    def __init__(self, strategy: str):
        self.strategy = strategy
        self.chunks: List[Dict[str, Any]] = []
        self.matrix: Optional[np.ndarray] = None
        self._postings: Dict[str, tuple] = {}   # term -> (doc_ids[], freqs[])
        self._doc_len: np.ndarray = np.zeros(0, dtype="float32")
        self._avg_len: float = 0.0
        self._idf: Dict[str, float] = {}
        self.built_ms: float = 0.0

    def build(self, chunks: Sequence[Dict[str, Any]], batch: int = 2048) -> "HybridIndex":
        started = time.perf_counter()
        self.chunks = list(chunks)
        n = len(self.chunks)
        if n == 0:
            self.matrix = np.zeros((0, E.dim()), dtype="float32")
            return self

        vecs = []
        for i in range(0, n, batch):
            vecs.append(E.encode([c["text"] for c in self.chunks[i:i + batch]]))
        self.matrix = np.vstack(vecs)

        doc_len = np.zeros(n, dtype="float32")
        raw: Dict[str, List[tuple]] = defaultdict(list)
        df: Dict[str, int] = defaultdict(int)
        for i, c in enumerate(self.chunks):
            toks = E.lexical_tokens(c["text"])
            doc_len[i] = len(toks)
            tf: Dict[str, int] = defaultdict(int)
            for t in toks:
                tf[t] += 1
            for t, f in tf.items():
                raw[t].append((i, f))
                df[t] += 1
        self._doc_len = doc_len
        # numpy postings so scoring vectorises; a Python loop over every
        # posting blows the budget once real text brings high-frequency terms.
        self._postings = {
            t: (np.fromiter((d for d, _ in lst), dtype="int32", count=len(lst)),
                np.fromiter((f for _, f in lst), dtype="float32", count=len(lst)))
            for t, lst in raw.items()
        }
        self._avg_len = float(doc_len.mean()) if n else 0.0
        self._idf = {t: math.log(1 + (n - d + 0.5) / (d + 0.5)) for t, d in df.items()}

        self.built_ms = (time.perf_counter() - started) * 1000
        return self

    def _bm25(self, terms: Sequence[str]) -> np.ndarray:
        scores = np.zeros(len(self.chunks), dtype="float32")
        avg = self._avg_len or 1.0
        seen = set()
        for t in terms:
            if t in seen:                       # a repeated query term adds nothing
                continue
            seen.add(t)
            posting = self._postings.get(t)
            if posting is None:
                continue
            idf = self._idf.get(t, 0.0)
            if idf <= MIN_IDF:                  # near-stopword: skip the work
                continue
            doc_ids, freqs = posting
            dl = self._doc_len[doc_ids]
            denom = freqs + BM25_K1 * (1 - BM25_B + BM25_B * dl / avg)
            np.add.at(scores, doc_ids, idf * (freqs * (BM25_K1 + 1)) / denom)
        return scores

    def search(self, query: str, top_k: int = 20,
               alpha: float = DEFAULT_ALPHA) -> List[Hit]:
        if not self.chunks or self.matrix is None or self.matrix.shape[0] == 0:
            return []

        qv = E.encode_one(query)
        dense = self.matrix @ qv                       # cosine, both normalised

        sparse = self._bm25(E.lexical_tokens(query))
        smax = float(sparse.max()) if sparse.size else 0.0
        sparse_n = sparse / smax if smax > 0 else sparse

        fused = alpha * dense + (1 - alpha) * sparse_n

        k = min(top_k, fused.shape[0])
        idx = np.argpartition(-fused, k - 1)[:k]
        idx = idx[np.argsort(-fused[idx])]

        out: List[Hit] = []
        for i in idx:
            c = self.chunks[int(i)]
            out.append(Hit(
                chunk_id=c["chunk_id"], passage_id=c["passage_id"],
                query_id=c["query_id"], strategy=c["strategy"],
                text=c["text"], core_text=c.get("core_text") or c["text"],
                score=float(fused[i]), dense_score=float(dense[i]),
                sparse_score=float(sparse[i]), metadata=c.get("metadata", {}),
            ))
        return out

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({
                "strategy": self.strategy, "chunks": self.chunks,
                "matrix": self.matrix, "postings": self._postings,
                "doc_len": self._doc_len, "avg_len": self._avg_len, "idf": self._idf,
            }, f, protocol=pickle.HIGHEST_PROTOCOL)

    @classmethod
    def load(cls, path: Path) -> "HybridIndex":
        with open(path, "rb") as f:
            d = pickle.load(f)
        ix = cls(d["strategy"])
        ix.chunks = d["chunks"]; ix.matrix = d["matrix"]
        ix._postings = d["postings"]
        ix._doc_len = d["doc_len"]; ix._avg_len = d["avg_len"]; ix._idf = d["idf"]
        return ix

    def stats(self) -> Dict[str, Any]:
        toks = [c["token_count"] for c in self.chunks] or [0]
        return {
            "strategy": self.strategy,
            "chunks": len(self.chunks),
            "vector_dim": int(self.matrix.shape[1]) if self.matrix is not None and self.matrix.size else 0,
            "vocab": len(self._idf),
            "avg_tokens": round(float(np.mean(toks)), 1),
            "p95_tokens": int(np.percentile(toks, 95)),
            "index_mb": round((self.matrix.nbytes / 1e6) if self.matrix is not None else 0, 2),
            "build_ms": round(self.built_ms, 1),
        }
