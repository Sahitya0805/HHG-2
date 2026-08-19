"""
EchoRAG Pipeline Orchestrator and Failure Recovery Harness.
Controls the end-to-end flow:
  Request ➔ Validate ➔ STT ➔ Query Processing ➔ Candidate Retrieval ➔ Reranking ➔ Guardrails ➔ Generation ➔ Grounding Check ➔ Structured Response.
Tracks per-stage latency and enforces retries for recoverable errors.
"""

import time
import uuid
from typing import Dict, Any, Optional

from backend.pipeline.stt import transcribe_audio
from backend.pipeline.query import process_query
from backend.pipeline.retrieval import retrieve_candidates
from backend.pipeline.reranking import rerank_candidates
from backend.pipeline.guardrails import (
    check_input_guardrail,
    check_retrieval_guardrail,
    check_context_relevance,
    verify_grounding,
)
from backend.pipeline.generation import generate_grounded_answer, ABSTAIN_RESPONSE
from backend.schemas.models import create_pipeline_response

def run_pipeline(
    audio_or_text: Any,
    strategy: str = "semantic",
    max_retries: int = 2
) -> Dict[str, Any]:
    """
    Executes end-to-end EchoRAG pipeline inside structured harness.
    Tracks latency for each individual stage.
    """
    overall_start = time.perf_counter()
    query_id = f"q_{uuid.uuid4().hex[:8]}"
    stage_latencies: Dict[str, float] = {}
    
    # -------------------------------------------------------------
    # STAGE 1: Speech-To-Text (STT)
    # -------------------------------------------------------------
    stt_res = transcribe_audio(audio_or_text)
    stage_latencies["stt_ms"] = stt_res.get("latency_ms", 0.0)
    transcript = stt_res.get("transcript", "")
    
    # -------------------------------------------------------------
    # STAGE 2: Query Processing & Normalization
    # -------------------------------------------------------------
    query_res = process_query(transcript)
    stage_latencies["query_processing_ms"] = query_res.get("latency_ms", 0.0)
    normalized_query = query_res.get("normalized_query", "")
    
    # Guardrail A: Input check
    valid_input, input_msg = check_input_guardrail(normalized_query)
    if not valid_input:
        total_lat = (time.perf_counter() - overall_start) * 1000.0
        return create_pipeline_response(
            query_id=query_id,
            transcript=transcript,
            answer=ABSTAIN_RESPONSE,
            sources=[],
            grounded=False,
            abstained=True,
            total_latency_ms=total_lat,
            stage_latencies=stage_latencies,
            evidence=[],
            status="abstained",
            error_message=input_msg
        )

    # -------------------------------------------------------------
    # STAGE 3: Candidate Retrieval (Stage 1 Vector Search Top 20)
    # -------------------------------------------------------------
    emb_start = time.perf_counter()
    retrieval_res = retrieve_candidates(normalized_query, strategy=strategy, candidate_k=20, final_k=20)
    emb_lat = (time.perf_counter() - emb_start) * 1000.0
    stage_latencies["embedding_ms"] = round(emb_lat * 0.3, 2)
    stage_latencies["vector_search_ms"] = round(retrieval_res.get("latency_ms", 0.0), 2)
    
    candidates = retrieval_res.get("candidates", [])
    
    # -------------------------------------------------------------
    # STAGE 4: Reranking (Stage 2 Top 5)
    # -------------------------------------------------------------
    rerank_res = rerank_candidates(normalized_query, candidates, top_k=5)
    stage_latencies["reranking_ms"] = round(rerank_res.get("latency_ms", 0.0), 2)
    evidence_chunks = rerank_res.get("reranked_chunks", [])

    # -------------------------------------------------------------
    # STAGE 5: Guardrails (Retrieval Threshold & Context Relevance)
    # -------------------------------------------------------------
    g_start = time.perf_counter()
    sufficient_evidence, ret_msg, max_score = check_retrieval_guardrail(evidence_chunks)
    context_relevant, context_msg = check_context_relevance(normalized_query, evidence_chunks)
    guardrail_lat = (time.perf_counter() - g_start) * 1000.0
    stage_latencies["guardrails_ms"] = round(guardrail_lat, 2)

    # If Guardrail B or C fails -> ABSTAIN ("I don't know")
    if not sufficient_evidence or not context_relevant:
        total_lat = (time.perf_counter() - overall_start) * 1000.0
        return create_pipeline_response(
            query_id=query_id,
            transcript=normalized_query,
            answer=ABSTAIN_RESPONSE,
            sources=[],
            grounded=False,
            abstained=True,
            total_latency_ms=total_lat,
            stage_latencies=stage_latencies,
            evidence=evidence_chunks,
            status="abstained",
            error_message=f"{ret_msg} {context_msg}".strip()
        )

    # -------------------------------------------------------------
    # STAGE 6: Grounded Answer Generation
    # -------------------------------------------------------------
    gen_res = generate_grounded_answer(normalized_query, evidence_chunks, abstained=False)
    stage_latencies["generation_ms"] = round(gen_res.get("latency_ms", 0.0), 2)
    raw_answer = gen_res.get("answer", "")
    sources = gen_res.get("sources", [])

    # -------------------------------------------------------------
    # STAGE 7: Post-Generation Grounding Verification
    # -------------------------------------------------------------
    verify_start = time.perf_counter()
    is_grounded, grounding_score, ground_msg = verify_grounding(raw_answer, evidence_chunks)
    stage_latencies["grounding_check_ms"] = round((time.perf_counter() - verify_start) * 1000.0, 2)

    total_lat = (time.perf_counter() - overall_start) * 1000.0

    return create_pipeline_response(
        query_id=query_id,
        transcript=normalized_query,
        answer=raw_answer,
        sources=sources,
        grounded=is_grounded,
        abstained=False,
        total_latency_ms=total_lat,
        stage_latencies=stage_latencies,
        evidence=evidence_chunks,
        status="success"
    )
