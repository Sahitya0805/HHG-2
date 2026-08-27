"""Embedder module for the evaluation loop."""

from __future__ import annotations
from typing import List, Sequence
import numpy as np
from ingestion import embeddings as E

def get_model():
    """Loads model into memory."""
    return E._load()

def embed(texts: Sequence[str]) -> np.ndarray:
    """Encodes texts into normalised float32 embeddings."""
    return E.encode(texts)

def embed_one(text: str) -> np.ndarray:
    """Encodes a single text into a normalised 1D vector."""
    return E.encode_one(text)
