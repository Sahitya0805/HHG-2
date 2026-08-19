"""
model2vec potion-base-8M -- static embeddings distilled from a
sentence-transformer. Encoding is a vocab lookup plus a mean, so a query takes
~0.2ms; a transformer forward pass would eat most of the 200ms budget before
retrieval started. No torch, ~30MB.

Tradeoff: no contextual attention, so it trails a cross-encoder on nuanced
matching. Hybrid retrieval and the lexical rerank exist to cover that.
"""

from __future__ import annotations

import re
import threading
from typing import List, Sequence

import numpy as np

MODEL_NAME = "minishlab/potion-base-8M"
_TOKEN = re.compile(r"[a-z0-9]+")

_model = None
_lock = threading.Lock()


def _load():
    global _model
    if _model is None:
        with _lock:
            if _model is None:
                from model2vec import StaticModel
                _model = StaticModel.from_pretrained(MODEL_NAME)
    return _model


def warmup() -> None:
    """Loads and exercises the model so the first real query is not penalised."""
    encode(["warmup"])


def encode(texts: Sequence[str]) -> np.ndarray:
    """Encodes texts to L2-normalised float32 vectors (cosine == dot product)."""
    if not texts:
        return np.zeros((0, dim()), dtype="float32")
    vecs = np.asarray(_load().encode(list(texts)), dtype="float32")
    if vecs.ndim == 1:
        vecs = vecs.reshape(1, -1)
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1e-9
    return vecs / norms


def encode_one(text: str) -> np.ndarray:
    return encode([text])[0]


def dim() -> int:
    return int(_load().dim)


def lexical_tokens(text: str) -> List[str]:
    return _TOKEN.findall((text or "").lower())
