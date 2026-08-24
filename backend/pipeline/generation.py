"""
Extractive answers: pick a contiguous verbatim sentence span from one retrieved
chunk and cite it. No paraphrasing.

Why not an LLM: the budget is 200ms for the whole pipeline and any hosted model
costs several hundred on its own. Span selection costs ~1ms and can't
hallucinate, which is what lets L5 prove groundedness by substring check.

The cost is real -- answers read like extracts, and nothing can be synthesised
across passages.

Candidate windows come from a single chunk so the result is always a substring
of exactly one citation.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Sequence

import numpy as np


from ingestion import embeddings as E

MAX_SPAN_SENTENCES = 3
MAX_ANSWER_CHARS = 600
_SENT = re.compile(r"(?<=[.!?])\s+")
_WORD = re.compile(r"[a-z0-9]+")
_STOP = {"what", "who", "when", "where", "why", "how", "is", "are", "the", "a", "an", "of",
         "in", "on", "for", "to", "and", "or", "do", "does", "did", "can", "with", "that"}


@dataclass
class Answer:
    text: str
    citations: List[str]
    passage_ids: List[str]
    span_score: float
    mode: str = "extractive"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _sentences(text: str) -> List[str]:
    return [s.strip() for s in _SENT.split(re.sub(r"\s+", " ", text or "").strip()) if s.strip()]


def _terms(text: str) -> set:
    return {w for w in _WORD.findall((text or "").lower()) if w not in _STOP and len(w) > 1}


def generate(query: str, hits: Sequence[Any],
             consider_top: int = 3,
             max_sentences: int = MAX_SPAN_SENTENCES) -> Optional[Answer]:
    """
    Selects the best verbatim sentence span across the top hits.

    Returns None when no usable span exists, letting the orchestrator abstain
    rather than emitting an empty or fabricated answer.
    """
    if not hits:
        return None

    q_terms = _terms(query)
    candidates: List[tuple] = []          # (text, chunk_id, passage_id)

    for hit in list(hits)[:consider_top]:
        body = getattr(hit, "core_text", "") or getattr(hit, "text", "")
        sents = _sentences(body)
        if not sents:
            continue
        # Contiguous windows only, so the result stays a substring of this
        # chunk. That is what makes L5 provable.
        for size in range(1, min(max_sentences, len(sents)) + 1):
            for start in range(0, len(sents) - size + 1):
                span = " ".join(sents[start:start + size])
                if len(span) <= MAX_ANSWER_CHARS:
                    candidates.append((span, hit.chunk_id, hit.passage_id))

    if not candidates:
        return None

    texts = [c[0] for c in candidates]
    qv = E.encode_one(query)
    vecs = E.encode(texts)
    dense = vecs @ qv

    # Overlap rewards spans that mention the asked-about terms; the length term
    # nudges away from 4-word fragments.
    scores = np.zeros(len(candidates), dtype="float32")
    for i, (span, _, _) in enumerate(candidates):
        overlap = len(q_terms & _terms(span)) / (len(q_terms) or 1)
        length_bonus = min(len(span.split()) / 40.0, 1.0) * 0.10
        scores[i] = 0.70 * float(dense[i]) + 0.20 * overlap + length_bonus

    best = int(np.argmax(scores))
    span, chunk_id, passage_id = candidates[best]
    return Answer(
        text=span,
        citations=[chunk_id],
        passage_ids=[passage_id],
        span_score=round(float(scores[best]), 4),
    )
