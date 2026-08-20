"""
Calibrates the abstention threshold (guardrails.MIN_DENSE_SCORE).

The threshold decides when the system says "I don't know", so it's swept
against two labelled sets rather than picked by feel: real MSMARCO queries with
gold passages (should answer) and questions with no possible support -- future
events, private data, fictional places (should decline).

Picks the threshold with the best balanced accuracy and writes
reports/calibration.json, which is where the guardrails constant comes from.

Run:
    python -m benchmarks.calibrate --queries 400
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Any, Dict, List

from benchmarks.harness import OOD_QUERIES, load_registry
from ingestion import dataset

REPORTS = Path(__file__).parent / "reports"

EXTRA_OOD = [
    "What is the airspeed velocity of an unladen Kryptonian?",
    "Who will win the 2044 general election?",
    "What did I have for breakfast last Tuesday?",
    "Read me the last message in my inbox.",
    "What is the stock price of a company that does not exist?",
    "Describe the flag of the nation of Wakanda in real life.",
    "How many employees does my current employer have today?",
    "What is the password to my laptop?",
]


def top_dense(index, query: str) -> float:
    hits = index.search(query, top_k=5)
    return max((h.dense_score for h in hits), default=0.0)


def run(n_queries: int = 400, strategy: str = "metadata_aware", seed: int = 23) -> Dict[str, Any]:
    registry = load_registry([strategy, "atomic"])
    index = registry.get(strategy) or next(iter(registry.values()))

    rng = random.Random(seed)
    in_domain = [q for q in dataset.load_queries() if q["gold_passage_ids"]]
    in_domain = rng.sample(in_domain, min(n_queries, len(in_domain)))
    ood = OOD_QUERIES + EXTRA_OOD

    in_scores = [top_dense(index, q["eng_query"]) for q in in_domain]
    ood_scores = [top_dense(index, q) for q in ood]

    sweep: List[Dict[str, Any]] = []
    best = None
    t = 0.20
    while t <= 0.80001:
        answered = sum(1 for s in in_scores if s >= t)
        declined = sum(1 for s in ood_scores if s < t)
        tpr = answered / len(in_scores)
        tnr = declined / len(ood_scores)
        balanced = (tpr + tnr) / 2
        row = {
            "threshold": round(t, 3),
            "in_domain_answer_rate": round(tpr, 4),
            "ood_abstain_rate": round(tnr, 4),
            "balanced_accuracy": round(balanced, 4),
        }
        sweep.append(row)
        if best is None or balanced > best["balanced_accuracy"]:
            best = row
        t += 0.02

    def dist(xs: List[float]) -> Dict[str, float]:
        s = sorted(xs)
        pick = lambda p: round(s[min(int(len(s) * p), len(s) - 1)], 4)
        return {"min": round(s[0], 4), "p10": pick(0.10), "p50": pick(0.50),
                "p90": pick(0.90), "max": round(s[-1], 4)}

    report = {
        "strategy": strategy,
        "in_domain_queries": len(in_scores),
        "ood_queries": len(ood_scores),
        "in_domain_score_distribution": dist(in_scores),
        "ood_score_distribution": dist(ood_scores),
        "recommended_threshold": best["threshold"],
        "at_recommended": best,
        "sweep": sweep,
        "note": ("Threshold is on raw dense cosine, which is comparable across "
                 "queries. The fused dense+BM25 score is not usable here because "
                 "per-query max-normalisation makes every query's top hit ~1.0."),
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "calibration.json").write_text(json.dumps(report, indent=2))
    return report


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--queries", type=int, default=400)
    ap.add_argument("--strategy", default="metadata_aware")
    args = ap.parse_args()
    r = run(args.queries, args.strategy)
    print(json.dumps({k: r[k] for k in
                      ("in_domain_score_distribution", "ood_score_distribution",
                       "recommended_threshold", "at_recommended")}, indent=2))
