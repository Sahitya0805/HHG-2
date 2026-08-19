"""
Reranking Engine for EchoRAG.
Stage 2: Takes Top 20 candidate chunks and performs relevance scoring & term-density reranking.
"""

import time
import re
from typing import List, Dict, Any

def rerank_candidates(
    query_text: str,
    candidates: List[Dict[str, Any]],
    top_k: int = 5
) -> Dict[str, Any]:
    """Reranks candidate passages based on query term match and semantic score."""
    start_time = time.perf_counter()
    if not candidates:
        return {
            "reranked_chunks": [],
            "latency_ms": (time.perf_counter() - start_time) * 1000.0
        }
        
    query_terms = set(re.findall(r'\w+', query_text.lower()))
    
    scored_candidates = []
    for chunk in candidates:
        base_score = chunk.get("score", 0.0)
        chunk_text = chunk.get("text", "").lower()
        chunk_words = set(re.findall(r'\w+', chunk_text))
        
        # Term overlap boost
        overlap = len(query_terms & chunk_words)
        overlap_score = (overlap / len(query_terms)) if query_terms else 0.0
        
        # Combined score
        rerank_score = 0.65 * base_score + 0.35 * overlap_score
        
        scored_chunk = dict(chunk)
        scored_chunk["rerank_score"] = round(float(rerank_score), 4)
        scored_chunk["score"] = round(float(rerank_score), 4)
        scored_candidates.append(scored_chunk)
        
    scored_candidates.sort(key=lambda x: x["rerank_score"], reverse=True)
    top_reranked = scored_candidates[:top_k]
    
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    return {
        "reranked_chunks": top_reranked,
        "latency_ms": elapsed_ms
    }
