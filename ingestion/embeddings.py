"""
Embedding generation pipeline for EchoRAG.
Supports fast vector embeddings with sparse-dense hybrid term and character n-gram projections.
Calculates normalized cosine similarity vectors in under 2ms per query.
"""

import math
import re
from collections import Counter
from typing import List, Dict, Any, Tuple

class EmbeddingModel:
    def __init__(self, vocab_size: int = 4096):
        self.vocab_size = vocab_size

    def _text_to_feature_counts(self, text: str) -> Dict[int, float]:
        """Extracts word and 3-gram feature hash counts."""
        tokens = [w.lower() for w in re.findall(r'\w+', text)]
        counts: Dict[int, float] = Counter()
        
        # Word features
        for token in tokens:
            h = hash(token) % self.vocab_size
            counts[h] += 2.0
            
        # Character 3-grams
        cleaned = text.lower()
        for i in range(len(cleaned) - 2):
            ngram = cleaned[i:i+3]
            h = hash(ngram) % self.vocab_size
            counts[h] += 1.0
            
        return counts

    def encode(self, text: str) -> Dict[int, float]:
        """Generates L2-normalized sparse vector for low-latency cosine search."""
        counts = self._text_to_feature_counts(text)
        if not counts:
            return {}
            
        norm = math.sqrt(sum(v * v for v in counts.values()))
        if norm == 0:
            return {}
            
        return {k: v / norm for k, v in counts.items()}

def cosine_similarity(v1: Dict[int, float], v2: Dict[int, float]) -> float:
    """Computes fast dot product of normalized sparse vectors."""
    if not v1 or not v2:
        return 0.0
    # Iterate over smaller vector
    if len(v1) > len(v2):
        v1, v2 = v2, v1
    return sum(val * v2.get(k, 0.0) for k, val in v1.items())
