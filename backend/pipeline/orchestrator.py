"""
Pipeline harness: typed stage contracts, retries with backoff on transient
failures only, strategy fallback, per-stage timing, trace_id for debugging.

Deterministic failures aren't retried -- a malformed query fails identically on
attempt three and just burns budget. A missing strategy index degrades to
atomic instead of failing the request.

pipeline_ms is measured once around the whole thing, not summed from stages;
the difference is harness overhead and the UI shows it. STT is excluded from
pipeline_ms (it's a network call to Sarvam) and added into total_ms when it ran.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Any, Callable, Dict, List, Optional

from backend.pipeline import guardrails as G
from backend.pipeline import generation
from backend.pipeline.stt import TranscriptionResult
from ingestion.normalize import normalize_query

FALLBACK_STRATEGY = "atomic"


class StageError(Exception):
    """Transient stage failure; the harness may retry it."""
    def __init__(self, message: str, retryable: bool = True):
        super().__init__(message)
        self.retryable = retryable


@dataclass
class StageTiming:
    name: str
    ms: Optional[float]
    status: str                       # "ok" | "skipped" | "failed" | "recovered"
    attempts: int = 1
    note: Optional[str] = None


@dataclass
class PipelineResult:
    trace_id: str
    query: str                        # normalised query actually retrieved on
    raw_query: Optional[str] = None   # what the user said/typed, before cleanup
    answer: Optional[str] = None
    abstained: bool = False
    citations: List[str] = field(default_factory=list)
    evidence: List[Dict[str, Any]] = field(default_factory=list)
    guardrail: Optional[Dict[str, Any]] = None
    guardrails_run: List[Dict[str, Any]] = field(default_factory=list)
    strategy: str = FALLBACK_STRATEGY
    stt: Optional[Dict[str, Any]] = None
    timings: List[Dict[str, Any]] = field(default_factory=list)
    pipeline_ms: float = 0.0          # retrieval..answer -- the 200ms budget
    total_ms: float = 0.0             # including STT when it ran
    status: str = "ok"
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class Harness:
    """Runs the voice-RAG pipeline with retries, recovery, and real timing."""

    def __init__(self, registry: Dict[str, Any], default_strategy: str = "atomic",
                 max_retries: int = 2, backoff_s: float = 0.02):
        self.registry = registry              # strategy -> HybridIndex
        self.default_strategy = default_strategy
        self.max_retries = max_retries
        self.backoff_s = backoff_s

    def _run_stage(self, name: str, fn: Callable[[], Any],
                   timings: List[StageTiming]) -> Any:
        started = time.perf_counter()
        last: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 2):
            try:
                value = fn()
                timings.append(StageTiming(
                    name, round((time.perf_counter() - started) * 1000, 3),
                    "ok" if attempt == 1 else "recovered", attempt,
                    None if attempt == 1 else f"succeeded on attempt {attempt}",
                ))
                return value
            except StageError as exc:
                last = exc
                if not exc.retryable:
                    break
                time.sleep(self.backoff_s * attempt)
            except Exception as exc:                       # unexpected: do not retry blindly
                last = exc
                break

        timings.append(StageTiming(
            name, round((time.perf_counter() - started) * 1000, 3),
            "failed", attempt, str(last),
        ))
        raise StageError(f"{name} failed: {last}", retryable=False)

    def _index_for(self, strategy: str, timings: List[StageTiming]) -> Any:
        index = self.registry.get(strategy)
        if index is not None:
            return index
        fallback = self.registry.get(FALLBACK_STRATEGY)
        if fallback is None:
            raise StageError(f"No index for '{strategy}' and no fallback available.",
                             retryable=False)
        timings.append(StageTiming(
            "strategy_fallback", 0.0, "recovered", 1,
            f"'{strategy}' unavailable; degraded to '{FALLBACK_STRATEGY}'",
        ))
        return fallback

    def run(self, query: str, strategy: Optional[str] = None,
            top_k: int = 20, rerank_k: int = 5,
            stt: Optional[TranscriptionResult] = None) -> PipelineResult:

        trace_id = f"t_{uuid.uuid4().hex[:10]}"
        strategy = strategy or self.default_strategy

        # Strip speech disfluencies before anything else sees the text. The raw
        # form is kept on the result so the UI can show what was actually said.
        raw_query = query
        norm = normalize_query(query)
        query = str(norm["normalized"])
        timings: List[StageTiming] = []
        guardrails_run: List[G.GuardrailVerdict] = []

        stt_dict = stt.to_dict() if stt else None
        stt_ms = (stt.stt_ms if stt else None)

        def finish(result: PipelineResult, pipeline_started: float) -> PipelineResult:
            result.pipeline_ms = round((time.perf_counter() - pipeline_started) * 1000, 3)
            result.total_ms = round(result.pipeline_ms + (stt_ms or 0.0), 3)
            result.timings = [asdict(t) for t in timings]
            result.guardrails_run = [g.to_dict() for g in guardrails_run]
            result.stt = stt_dict
            return result

        pipeline_started = time.perf_counter()

        def refuse(verdict: G.GuardrailVerdict) -> PipelineResult:
            guardrails_run.append(verdict)
            return finish(PipelineResult(
                trace_id=trace_id, query=query, raw_query=raw_query,
                answer=G.REFUSAL, abstained=True, guardrail=verdict.to_dict(), strategy=strategy, status="abstained",
            ), pipeline_started)

        # Cheap input gates first, before spending anything on retrieval.
        g_started = time.perf_counter()
        v1 = G.input_check(query)
        if not v1.passed:
            timings.append(StageTiming("guardrails_input", round((time.perf_counter() - g_started) * 1000, 3), "ok"))
            return refuse(v1)
        guardrails_run.append(v1)

        v2 = G.safety_check(query)
        timings.append(StageTiming("guardrails_input", round((time.perf_counter() - g_started) * 1000, 3), "ok"))
        if not v2.passed:
            return refuse(v2)
        guardrails_run.append(v2)

        try:
            index = self._index_for(strategy, timings)
            hits = self._run_stage(
                "retrieval", lambda: index.search(query, top_k=top_k), timings)

            def rerank():
                # Fused score already blends dense+sparse; this trims to the
                # generation window and is where a cross-encoder would slot in
                # if the latency budget ever allowed one.
                return list(hits)[:rerank_k]
            top_hits = self._run_stage("rerank", rerank, timings)

            # Is the evidence good enough to answer from?
            g2 = time.perf_counter()
            v3 = G.retrieval_check(top_hits)
            if not v3.passed:
                timings.append(StageTiming("guardrails_retrieval", round((time.perf_counter() - g2) * 1000, 3), "ok"))
                result = refuse(v3)
                result.evidence = [h.to_dict() for h in top_hits[:3]]
                return result
            guardrails_run.append(v3)

            v4 = G.relevance_check(query, top_hits)
            timings.append(StageTiming("guardrails_retrieval", round((time.perf_counter() - g2) * 1000, 3), "ok"))
            if not v4.passed:
                result = refuse(v4)
                result.evidence = [h.to_dict() for h in top_hits[:3]]
                return result
            guardrails_run.append(v4)

            answer = self._run_stage(
                "generation", lambda: generation.generate(query, top_hits), timings)

            if answer is None:
                return refuse(G.GuardrailVerdict(
                    False, "L5_provenance", "No usable span found in retrieved evidence.",
                    "no_span", {}))

            # Prove the answer came from its cited evidence.
            g3 = time.perf_counter()
            v5 = G.provenance_check(answer.text, answer.citations, top_hits)
            timings.append(StageTiming("guardrails_provenance", round((time.perf_counter() - g3) * 1000, 3), "ok"))
            if not v5.passed:
                return refuse(v5)
            guardrails_run.append(v5)

            return finish(PipelineResult(
                trace_id=trace_id, query=query, raw_query=raw_query,
                answer=answer.text, abstained=False,
                citations=answer.citations,
                evidence=[h.to_dict() for h in top_hits],
                guardrail=v5.to_dict(), strategy=getattr(index, "strategy", strategy),
                status="ok",
            ), pipeline_started)

        except StageError as exc:
            return finish(PipelineResult(
                trace_id=trace_id, query=query, raw_query=raw_query,
                answer=G.REFUSAL, abstained=True, strategy=strategy, status="error", error=str(exc),
            ), pipeline_started)
