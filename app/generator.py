"""Generator module for the evaluation loop with calibrated groundedness."""

from __future__ import annotations
import time
from dataclasses import dataclass
from typing import Any, List
from backend.pipeline.generation import generate
from backend.pipeline.guardrails import _terms
from ingestion import embeddings as E

@dataclass
class EvalAnswer:
    text: str
    grounded: bool
    generation_ms: float
    model: str = "extractive-minishlab/potion-base-8M"

class ContextAdapter:
    def __init__(self, item: Any, idx: int):
        self.text = getattr(item, "text", str(item))
        self.chunk_id = f"eval_chunk_{idx}"
        self.passage_id = getattr(item, "source", f"eval_passage_{idx}")
        self.score = 1.0

def generate_answer(query: str, results: List[Any]) -> EvalAnswer:
    started = time.perf_counter()
    if not results:
        return EvalAnswer(
            text="I do not have enough information to answer that question.",
            grounded=False,
            generation_ms=round((time.perf_counter() - started) * 1000, 3),
            model="extractive-minishlab/potion-base-8M",
        )

    hits = [ContextAdapter(r, i) for i, r in enumerate(results)]
    ans = generate(query, hits)
    elapsed_ms = round((time.perf_counter() - started) * 1000, 3)

    if ans is None or not ans.text.strip():
        return EvalAnswer(
            text="I do not have enough information to answer that question.",
            grounded=False,
            generation_ms=elapsed_ms,
            model="extractive-minishlab/potion-base-8M",
        )

    # Compute dense cosine score of best span vs query
    qv = E.encode_one(query)
    sv = E.encode_one(ans.text)
    cosine = float(sv @ qv)
    
    q_terms = _terms(query)
    a_terms = _terms(ans.text)
    overlap = len(q_terms & a_terms)
    
    # Grounded requires strong semantic alignment
    is_grounded = cosine >= 0.70 and overlap >= min(2, len(q_terms))

    return EvalAnswer(
        text=ans.text if is_grounded else "I do not have enough information to answer that question.",
        grounded=is_grounded,
        generation_ms=elapsed_ms,
        model="extractive-minishlab/potion-base-8M",
    )
