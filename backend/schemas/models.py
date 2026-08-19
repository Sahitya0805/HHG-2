"""
Structured JSON schemas for EchoRAG pipeline inputs, evidence packages, and response objects.
"""

from typing import List, Dict, Any, Optional

def create_evidence_package(question: str, candidate_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Formats retrieved candidates into a structured evidence package."""
    evidence_items = []
    for c in candidate_chunks:
        evidence_items.append({
            "chunk_id": c.get("chunk_id", ""),
            "document_id": c.get("document_id", ""),
            "score": c.get("score", 0.0),
            "text": c.get("text", ""),
            "strategy": c.get("strategy", "semantic"),
            "token_count": c.get("token_count", 0)
        })
    return {
        "question": question,
        "evidence_count": len(evidence_items),
        "evidence": evidence_items
    }

def create_pipeline_response(
    query_id: str,
    transcript: str,
    answer: str,
    sources: List[str],
    grounded: bool,
    abstained: bool,
    total_latency_ms: float,
    stage_latencies: Optional[Dict[str, float]] = None,
    evidence: List[Dict[str, Any]] = None,
    status: str = "success",
    error_message: Optional[str] = None,
    stage_latencies_ms: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """Builds final structured I/O response adhering strictly to PRD Section 23."""
    lats = stage_latencies or stage_latencies_ms or {}
    return {
        "query_id": query_id,
        "transcript": transcript,
        "answer": answer,
        "sources": sources,
        "grounded": grounded,
        "abstained": abstained,
        "latency_ms": round(total_latency_ms, 2),
        "status": status,
        "stage_latencies": {k: round(v, 2) for k, v in lats.items()},
        "evidence": evidence or [],
        "error_message": error_message
    }
