"""
Retrieval Engine for EchoRAG.
Handles Stage 1 Top-K Candidate Retrieval (Top 20) and Stage 3 Context Filtering (Top 5).
"""

import time
from typing import List, Dict, Any
from ingestion.index import get_vector_index

def retrieve_candidates(
    query_text: str,
    strategy: str = "semantic",
    candidate_k: int = 20,
    final_k: int = 5
) -> Dict[str, Any]:
    """
    Executes Stage 1 Vector Search and initial context filter.
    Returns candidate chunks and latency measurement.
    """
    start_time = time.perf_counter()
    index = get_vector_index()
    
    # Stage 1: Top Candidate Retrieval
    candidates = index.search(query_text, strategy=strategy, top_k=candidate_k)
    
    # Stage 3: Top Context Filter
    top_contexts = candidates[:final_k]
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    
    return {
        "query": query_text,
        "strategy": strategy,
        "total_candidates": len(candidates),
        "candidates": candidates,
        "top_contexts": top_contexts,
        "latency_ms": elapsed_ms
    }
