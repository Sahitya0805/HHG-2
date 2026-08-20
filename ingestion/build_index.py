"""
Builds and persists one hybrid index per chunking strategy.

Chunking is offline work -- a served query pays for query embedding, search,
rerank, guardrails and span selection, not for re-chunking 30k passages.
Chunking cost shows up separately in build_report.json.

    python -m ingestion.build_index
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any, Dict, List

from ingestion import chunking, dataset
from ingestion import embeddings as E
from ingestion.index import HybridIndex

INDEX_DIR = Path(__file__).parent / "indexes"


def build_chunks(strategy: str, passages: List[Dict[str, Any]],
                 by_query: Dict[str, List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    if strategy == "semantic":
        # Batch the encoder across the corpus rather than per passage.
        for p in passages:
            out.extend(c.to_dict() for c in chunking.semantic(p, E.encode))
    elif strategy == "context_enriched":
        for p in passages:
            siblings = [s for s in by_query.get(p["query_id"], [])
                        if s["passage_id"] != p["passage_id"]][:2]
            out.extend(c.to_dict() for c in chunking.context_enriched(p, siblings))
    else:
        fn = {
            "atomic": chunking.atomic,
            "fixed_overlap": chunking.fixed_overlap,
            "sentence_window": chunking.sentence_window,
            "recursive": chunking.recursive,
            "metadata_aware": chunking.metadata_aware,
        }[strategy]
        for p in passages:
            out.extend(c.to_dict() for c in fn(p))
    return out


def main(strategies: List[str], out_dir: Path = INDEX_DIR) -> Dict[str, Any]:
    out_dir.mkdir(parents=True, exist_ok=True)
    passages = dataset.load_passages()
    by_query = dataset.passages_by_query()
    E.warmup()

    report: Dict[str, Any] = {"corpus": dataset.manifest(), "strategies": {}}

    for strategy in strategies:
        t0 = time.perf_counter()
        chunks = build_chunks(strategy, passages, by_query)
        chunk_ms = (time.perf_counter() - t0) * 1000

        index = HybridIndex(strategy).build(chunks)
        index.save(out_dir / f"{strategy}.pkl")

        stats = index.stats()
        stats["chunk_ms"] = round(chunk_ms, 1)
        stats["chunks_per_passage"] = round(len(chunks) / max(len(passages), 1), 2)
        stats["description"] = chunking.STRATEGIES[strategy]
        report["strategies"][strategy] = stats
        print(f"  {strategy:18s} chunks={stats['chunks']:>7} "
              f"avg_tok={stats['avg_tokens']:>5} chunk={stats['chunk_ms']:>8.0f}ms "
              f"index={stats['build_ms']:>8.0f}ms {stats['index_mb']:>6}MB", flush=True)

    (out_dir / "build_report.json").write_text(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--strategies", nargs="*", default=list(chunking.STRATEGIES.keys()))
    args = ap.parse_args()
    print(json.dumps(main(args.strategies)["corpus"], indent=2))
