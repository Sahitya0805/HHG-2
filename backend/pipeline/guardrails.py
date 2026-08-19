"""
Five guardrail layers. First one to trip returns a refusal carrying the layer
and a machine-readable code.

  L1 input       malformed / empty / overlong
  L2 safety      unsafe requests, prompt injection
  L3 retrieval   nothing close enough in the index
  L4 relevance   evidence shares no content terms with the query
  L5 provenance  answer isn't verbatim from a cited chunk

L5 checks provenance, not entailment. Generation is extractive, so "is this
grounded" collapses to a substring check -- stronger than a similarity score,
but only because the generator can't write new prose. An LLM generator would
need real entailment checking.

L2 is regex, not a classifier. It catches direct phrasings and the usual
injection shapes and will miss obfuscated ones.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import Any, Dict, List, Optional, Sequence

# From benchmarks/calibrate.py: 0.60 maximises balanced accuracy over 400
# in-domain queries and 18 OOD probes (85.0% answered / 77.8% declined).
# The distributions overlap and no threshold splits them cleanly -- MSMARCO is
# broad web text, so "population of Mars in 2090" really does retrieve Mars
# passages at 0.56-0.69, against a 0.577 in-domain p10. About 1 in 5 OOD
# questions still gets through; closing that needs entailment checking.
MIN_DENSE_SCORE = 0.60
MIN_TERM_OVERLAP = 1
MAX_QUERY_CHARS = 512
MIN_QUERY_CHARS = 3

REFUSAL = "I don't have enough grounded evidence in the MSMARCO-XI corpus to answer that."

_UNSAFE = [
    (re.compile(r"\b(how to (make|build|synthesi[sz]e)) .*(bomb|explosive|nerve agent|meth)\b", re.I), "weapons_or_drugs"),
    (re.compile(r"\b(kill|harm|hurt) (myself|yourself|himself|herself|themselves)\b", re.I), "self_harm"),
    (re.compile(r"\b(child|minor|underage)\b.{0,30}\b(sexual|porn|explicit)\b", re.I), "csam"),
    (re.compile(r"\b(credit card|ssn|social security) (number|details)\b.{0,40}\b(steal|dump|generate)\b", re.I), "fraud"),
]

_INJECTION = [
    re.compile(r"ignore (all |any |the )?(previous|prior|above) (instruction|prompt|rule)", re.I),
    re.compile(r"disregard (your|the) (instruction|system prompt|guardrail)", re.I),
    re.compile(r"\byou are now\b|\bact as\b.{0,20}\b(dan|jailbreak|unrestricted)\b", re.I),
    re.compile(r"reveal (your|the) (system prompt|instructions|prompt)", re.I),
    re.compile(r"\bpretend (you|to be)\b.{0,30}\bno (rules|restrictions|guardrails)\b", re.I),
]

_STOP = {
    "what", "who", "when", "where", "why", "how", "is", "are", "was", "were", "the", "a", "an",
    "of", "in", "on", "for", "to", "and", "or", "do", "does", "did", "can", "could", "with",
    "that", "this", "it", "its", "be", "been", "as", "at", "by", "from", "about", "tell", "me",
}
_WORD = re.compile(r"[a-z0-9]+")


@dataclass
class GuardrailVerdict:
    passed: bool
    layer: str
    reason: str
    code: str
    detail: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _ok(layer: str) -> GuardrailVerdict:
    return GuardrailVerdict(True, layer, "passed", "ok", {})


def _terms(text: str) -> set:
    return {w for w in _WORD.findall((text or "").lower()) if w not in _STOP and len(w) > 1}


# L1
def input_check(query: str) -> GuardrailVerdict:
    q = (query or "").strip()
    if not q:
        return GuardrailVerdict(False, "L1_input", "Empty query.", "empty_query", {})
    if len(q) < MIN_QUERY_CHARS:
        return GuardrailVerdict(False, "L1_input", f"Query shorter than {MIN_QUERY_CHARS} characters.",
                                "query_too_short", {"length": len(q)})
    if len(q) > MAX_QUERY_CHARS:
        return GuardrailVerdict(False, "L1_input", f"Query exceeds {MAX_QUERY_CHARS} characters.",
                                "query_too_long", {"length": len(q)})
    if not _WORD.search(q):
        return GuardrailVerdict(False, "L1_input", "Query contains no alphanumeric content.",
                                "no_content", {})
    return _ok("L1_input")


# L2
def safety_check(query: str) -> GuardrailVerdict:
    for pattern, category in _UNSAFE:
        if pattern.search(query):
            return GuardrailVerdict(False, "L2_safety",
                                    "Query requests unsafe content.",
                                    "unsafe_request", {"category": category})
    for pattern in _INJECTION:
        if pattern.search(query):
            return GuardrailVerdict(False, "L2_safety",
                                    "Query looks like a prompt-injection attempt; "
                                    "treating it as data, not instructions.",
                                    "prompt_injection", {})
    return _ok("L2_safety")


# L3
def retrieval_check(hits: Sequence[Any],
                    min_score: float = MIN_DENSE_SCORE) -> GuardrailVerdict:
    if not hits:
        return GuardrailVerdict(False, "L3_retrieval", "Nothing retrieved.", "no_hits", {})
    top = max(float(getattr(h, "dense_score", 0.0)) for h in hits)
    if top < min_score:
        return GuardrailVerdict(False, "L3_retrieval",
                                "Closest evidence is below the grounding threshold; "
                                "the question is likely outside the corpus.",
                                "below_threshold",
                                {"top_dense_score": round(top, 4), "threshold": min_score})
    return GuardrailVerdict(True, "L3_retrieval", "passed", "ok",
                            {"top_dense_score": round(top, 4)})


# L4
def relevance_check(query: str, hits: Sequence[Any],
                    min_overlap: int = MIN_TERM_OVERLAP) -> GuardrailVerdict:
    q_terms = _terms(query)
    if not q_terms:
        return _ok("L4_relevance")     # nothing contentful to match on; L3 governs
    best = 0
    for h in hits[:5]:
        overlap = len(q_terms & _terms(getattr(h, "core_text", "") or getattr(h, "text", "")))
        best = max(best, overlap)
    if best < min_overlap:
        return GuardrailVerdict(False, "L4_relevance",
                                "Retrieved evidence shares no content terms with the question.",
                                "no_term_overlap",
                                {"query_terms": len(q_terms), "best_overlap": best})
    return GuardrailVerdict(True, "L4_relevance", "passed", "ok", {"best_overlap": best})


# L5
def provenance_check(answer: str, citations: Sequence[str],
                     hits: Sequence[Any]) -> GuardrailVerdict:
    """Verifies the answer is verbatim from cited evidence and citations resolve."""
    if not answer:
        return GuardrailVerdict(False, "L5_provenance", "Empty answer.", "empty_answer", {})
    if not citations:
        return GuardrailVerdict(False, "L5_provenance", "Answer carries no citation.",
                                "missing_citation", {})

    by_id = {getattr(h, "chunk_id", ""): h for h in hits}
    unresolved = [c for c in citations if c not in by_id]
    if unresolved:
        return GuardrailVerdict(False, "L5_provenance",
                                "Answer cites chunks that were not retrieved.",
                                "dangling_citation", {"unresolved": unresolved[:3]})

    def norm(s: str) -> str:
        return re.sub(r"\s+", " ", s or "").strip().lower()

    haystack = " ".join(norm(getattr(by_id[c], "core_text", "") or
                             getattr(by_id[c], "text", "")) for c in citations)
    needle = norm(answer)
    if needle not in haystack:
        return GuardrailVerdict(False, "L5_provenance",
                                "Answer text is not a verbatim span of its cited evidence.",
                                "not_verbatim",
                                {"answer_chars": len(needle)})
    return GuardrailVerdict(True, "L5_provenance", "passed", "ok",
                            {"verbatim": True, "citations": len(citations)})
