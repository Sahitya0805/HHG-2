"""
Query Processing and Normalization Module.
Prepares transcript for vector retrieval.
"""

import time
from typing import Dict, Any
from ingestion.cleaners import normalize_query

def process_query(transcript: str) -> Dict[str, Any]:
    """Processes and normalizes raw transcript for retrieval."""
    start_time = time.perf_counter()
    norm = normalize_query(transcript)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    
    return {
        "raw_transcript": norm["raw"],
        "normalized_query": norm["normalized"],
        "is_valid": norm["is_valid"],
        "is_empty": norm["is_empty"],
        "latency_ms": elapsed_ms
    }
