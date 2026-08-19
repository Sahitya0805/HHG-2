"""
Seven chunking strategies.

MSMARCO passages are short (50-120 words), not long documents, so splitting
them further mostly destroys context -- the useful levers here are merging and
context enrichment, and several strategies below grow chunks rather than shrink
them. The benchmark bears this out: `semantic` makes the most chunks and
retrieves worst.

All strategies return List[Chunk] with a stable chunk_id so a hit traces back
to its source passage.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional, Sequence

_SENT_SPLIT = re.compile(r"(?<=[.!?])\s+")
_WS = re.compile(r"\s+")


@dataclass
class Chunk:
    chunk_id: str
    passage_id: str
    query_id: str
    strategy: str
    text: str               # text that gets embedded
    core_text: str          # the span this chunk is actually "about"
    token_count: int
    chunk_index: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _norm(text: str) -> str:
    return _WS.sub(" ", (text or "")).strip()


def _sentences(text: str) -> List[str]:
    return [s.strip() for s in _SENT_SPLIT.split(_norm(text)) if s.strip()]


def _tokens(text: str) -> List[str]:
    return _norm(text).split()


def _mk(strategy: str, passage_id: str, query_id: str, idx: int,
        text: str, core: str, meta: Dict[str, Any]) -> Chunk:
    return Chunk(
        chunk_id=f"{passage_id}::{strategy}::{idx:03d}",
        passage_id=passage_id,
        query_id=query_id,
        strategy=strategy,
        text=_norm(text),
        core_text=_norm(core),
        token_count=len(_tokens(text)),
        chunk_index=idx,
        metadata=meta,
    )


# Baseline. MSMARCO passages are already curated retrieval units, so this is a
# strong strategy here rather than a straw man.
def atomic(passage: Dict[str, Any]) -> List[Chunk]:
    text = _norm(passage["text"])
    if not text:
        return []
    return [_mk("atomic", passage["passage_id"], passage["query_id"], 0,
                text, text, {"boundary": "passage"})]


# Overlap as a fraction so window size and redundancy tune independently.
def fixed_overlap(passage: Dict[str, Any], window: int = 64,
                  overlap_ratio: float = 0.25, min_tail: int = 12) -> List[Chunk]:
    toks = _tokens(passage["text"])
    if not toks:
        return []
    overlap = int(window * overlap_ratio)
    step = max(1, window - overlap)
    # A tail guard wider than the window itself would discard every window
    # after the first, so it is capped to half the window.
    min_tail = min(min_tail, max(1, window // 2))

    chunks: List[Chunk] = []
    idx = 0
    start = 0
    while start < len(toks):
        end = min(start + window, len(toks))
        span = toks[start:end]
        # Drop only a trailing sliver already covered by the previous window --
        # never a full-width window in the middle of the passage.
        if chunks and end >= len(toks) and len(span) < min_tail:
            break
        body = " ".join(span)
        chunks.append(_mk("fixed_overlap", passage["passage_id"], passage["query_id"],
                          idx, body, body,
                          {"window": window, "overlap": overlap,
                           "span": [start, end]}))
        idx += 1
        if end >= len(toks):
            break
        start += step
    return chunks


# Stride < window, so a fact spanning a sentence boundary is never orphaned.
def sentence_window(passage: Dict[str, Any], window: int = 3,
                    stride: int = 2) -> List[Chunk]:
    sents = _sentences(passage["text"])
    if not sents:
        return []
    chunks: List[Chunk] = []
    idx = 0
    start = 0
    while start < len(sents):
        end = min(start + window, len(sents))
        body = " ".join(sents[start:end])
        chunks.append(_mk("sentence_window", passage["passage_id"], passage["query_id"],
                          idx, body, body,
                          {"sentences": [start, end], "stride": stride}))
        idx += 1
        if end >= len(sents):
            break
        start += stride
    return chunks


# paragraph -> sentence -> hard token cut. Keeps the largest coherent unit that
# fits the budget instead of cutting everything to one size.
def recursive(passage: Dict[str, Any], max_tokens: int = 96) -> List[Chunk]:
    text = _norm(passage["text"])
    if not text:
        return []

    def descend(block: str) -> List[str]:
        if len(_tokens(block)) <= max_tokens:
            return [block]
        sents = _sentences(block)
        if len(sents) <= 1:                       # cannot split further by sentence
            toks = _tokens(block)
            return [" ".join(toks[i:i + max_tokens])
                    for i in range(0, len(toks), max_tokens)]
        out, buf, buf_len = [], [], 0
        for s in sents:
            n = len(_tokens(s))
            if buf and buf_len + n > max_tokens:
                out.append(" ".join(buf)); buf, buf_len = [], 0
            buf.append(s); buf_len += n
        if buf:
            out.append(" ".join(buf))
        return out

    paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()] or [text]
    pieces: List[str] = []
    for p in paragraphs:
        pieces.extend(descend(p))

    return [_mk("recursive", passage["passage_id"], passage["query_id"], i, body, body,
                {"max_tokens": max_tokens, "depth_used": "sentence" if len(pieces) > 1 else "paragraph"})
            for i, body in enumerate(pieces)]


# Boundaries where adjacent-sentence meaning shifts, by embedding cosine rather
# than word overlap. Caller passes the encoder in to keep this module light.
def semantic(passage: Dict[str, Any],
             encode: Callable[[Sequence[str]], Any],
             threshold: float = 0.45,
             max_tokens: int = 120) -> List[Chunk]:
    sents = _sentences(passage["text"])
    if not sents:
        return []
    if len(sents) == 1:
        body = sents[0]
        return [_mk("semantic", passage["passage_id"], passage["query_id"], 0, body, body,
                    {"boundaries": 0, "threshold": threshold})]

    import numpy as np
    vecs = np.asarray(encode(sents), dtype="float32")
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1e-9
    vecs = vecs / norms
    # Cosine similarity between each adjacent sentence pair.
    sims = (vecs[:-1] * vecs[1:]).sum(axis=1)

    groups: List[List[str]] = [[sents[0]]]
    cur_len = len(_tokens(sents[0]))
    boundaries = 0
    for i, s in enumerate(sents[1:]):
        n = len(_tokens(s))
        topic_shift = sims[i] < threshold
        too_long = cur_len + n > max_tokens
        if topic_shift or too_long:
            groups.append([s]); cur_len = n; boundaries += 1
        else:
            groups[-1].append(s); cur_len += n

    return [_mk("semantic", passage["passage_id"], passage["query_id"], i,
                " ".join(g), " ".join(g),
                {"boundaries": boundaries, "threshold": threshold})
            for i, g in enumerate(groups)]


# Folds the MSMARCO query_type label (numeric/description/entity/location/person)
# into the embedded string so a "how many" question leans toward numeric
# passages. core_text keeps clean prose for display and citation.
def metadata_aware(passage: Dict[str, Any]) -> List[Chunk]:
    core = _norm(passage["text"])
    if not core:
        return []
    qtype = passage.get("query_type") or "unknown"
    lang = passage.get("lang") or "eng"
    header = f"[type: {qtype}] [lang: {lang}]"
    return [_mk("metadata_aware", passage["passage_id"], passage["query_id"], 0,
                f"{header} {core}", core,
                {"query_type": qtype, "lang": lang, "header": header})]


# Vector carries neighbour context, citation stays tight. Best R@10 of the seven,
# worst R@1 -- it finds the right region and blurs the exact hit.
def context_enriched(passage: Dict[str, Any],
                     neighbours: Sequence[Dict[str, Any]] = ()) -> List[Chunk]:
    core = _norm(passage["text"])
    if not core:
        return []
    ctx = " ".join(_norm(n["text"])[:180] for n in neighbours if n.get("text"))
    embedded = f"{core} {ctx}".strip() if ctx else core
    return [_mk("context_enriched", passage["passage_id"], passage["query_id"], 0,
                embedded, core,
                {"neighbour_count": len(neighbours), "enriched": bool(ctx)})]


STRATEGIES: Dict[str, str] = {
    "atomic": "Whole passage as one chunk (MSMARCO passages are already retrieval units)",
    "fixed_overlap": "Fixed 64-token windows, 25% overlap, tail-sliver guard",
    "sentence_window": "3 sentences per chunk, stride 2, never splits mid-sentence",
    "recursive": "Hierarchical paragraph -> sentence -> token descent, 96-token budget",
    "semantic": "Embedding cosine-distance boundaries at real topic shifts",
    "metadata_aware": "Query-type and language folded into the embedded text",
    "context_enriched": "Embeds neighbour context, cites only the core span",
}
