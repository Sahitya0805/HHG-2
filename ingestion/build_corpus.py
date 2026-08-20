"""
Builds the EchoRAG corpus from the real ai4bharat/MSMARCO-XI parquet.

Output (written to ingestion/data/):
  corpus.jsonl   -- one record per passage, the retrievable unit
  queries.jsonl  -- one record per query, carrying gold passage ids
  manifest.json  -- provenance: source file, row count, checksums, build time

MSMARCO-XI ships passages.is_selected, a human relevance judgement per passage.
That's what makes Recall@k measurable rather than asserted -- every retrieval
number here traces back to those labels.

Run:
    python -m ingestion.build_corpus --parquet <file> --queries 6000
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

DATA_DIR = Path(__file__).parent / "data"
_WS = re.compile(r"\s+")


def _clean(text: str) -> str:
    return _WS.sub(" ", (text or "").replace("​", "")).strip()


def _rows_from_parquet(parquet_path: Path, n_queries: int) -> List[Dict[str, Any]]:
    import pyarrow.parquet as pq

    cols = ["query_id", "query_type", "target_lang", "Eng_Query", "query",
            "Eng_Answer", "Answer", "passages"]
    pf = pq.ParquetFile(parquet_path)
    rows: List[Dict[str, Any]] = []
    for batch in pf.iter_batches(batch_size=500, columns=cols):
        rows.extend(batch.to_pylist())
        if len(rows) >= n_queries:
            break
    return rows[:n_queries]


def build(parquet_path: Optional[Path], n_queries: int,
          out_dir: Path = DATA_DIR,
          rows_json: Optional[Path] = None) -> Dict[str, Any]:
    """
    Builds the corpus from a parquet file, or from rows already extracted to
    JSON. The rows-JSON path exists because pulling the parquet over a slow
    link is the expensive step; once extracted, rebuilding should not repeat it.
    """
    out_dir.mkdir(parents=True, exist_ok=True)

    if rows_json is not None:
        rows = json.loads(rows_json.read_text(encoding="utf-8"))[:n_queries]
        source_name = rows_json.name
    elif parquet_path is not None:
        rows = _rows_from_parquet(parquet_path, n_queries)
        source_name = parquet_path.name
    else:
        raise ValueError("Provide either parquet_path or rows_json.")

    corpus: List[Dict[str, Any]] = []
    queries: List[Dict[str, Any]] = []
    skipped = 0

    for row in rows:
        qid = str(row["query_id"])
        eng_q = _clean(row.get("Eng_Query"))
        passages = row.get("passages") or {}
        eng_passages = passages.get("English_passages") or []
        selected = passages.get("is_selected") or []

        if not eng_q or not eng_passages:
            skipped += 1
            continue

        gold: List[str] = []
        for j, text in enumerate(eng_passages):
            body = _clean(text)
            if not body:
                continue
            pid = f"{qid}_p{j}"
            is_sel = int(selected[j]) if j < len(selected) else 0
            corpus.append({
                "passage_id": pid,
                "query_id": qid,
                "text": body,
                "is_selected": is_sel,
                "query_type": row.get("query_type") or "unknown",
                # The retrievable corpus is English_passages, so the passage
                # language is English. The query's Indic language is recorded
                # on the query record instead -- labelling an English passage
                # with the query's target_lang would be wrong.
                "lang": "eng",
                "query_lang": row.get("target_lang") or "unknown",
            })
            if is_sel:
                gold.append(pid)

        queries.append({
            "query_id": qid,
            "eng_query": eng_q,
            "native_query": _clean(row.get("query")),
            "eng_answer": _clean(row.get("Eng_Answer")),
            "native_answer": _clean(row.get("Answer")),
            "query_type": row.get("query_type") or "unknown",
            "lang": row.get("target_lang") or "eng",
            "gold_passage_ids": gold,
        })

    # Written twice: plain .jsonl for local work, and .jsonl.gz which is what
    # gets committed. The gzip copy is ~3.7MB against 13MB plain, small enough
    # that a clone can rebuild indexes without re-downloading 462MB of parquet.
    for name, records in (("corpus", corpus), ("queries", queries)):
        body = "".join(json.dumps(r, ensure_ascii=False) + "\n" for r in records)
        (out_dir / f"{name}.jsonl").write_text(body, encoding="utf-8")
        with gzip.open(out_dir / f"{name}.jsonl.gz", "wt", encoding="utf-8") as f:
            f.write(body)

    answerable = sum(1 for q in queries if q["gold_passage_ids"])
    manifest = {
        "source_dataset": "ai4bharat/MSMARCO-XI",
        "source_file": source_name,
        "source_sha256_16": (
            hashlib.sha256(parquet_path.read_bytes()[:1 << 20]).hexdigest()[:16]
            if parquet_path is not None else None
        ),
        "split": "validation",
        "built_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "queries": len(queries),
        "passages": len(corpus),
        "queries_with_gold": answerable,
        "queries_without_gold": len(queries) - answerable,
        "skipped_rows": skipped,
        "avg_passages_per_query": round(len(corpus) / max(len(queries), 1), 2),
        "note": ("English_passages are used as the retrievable corpus; "
                 "is_selected provides gold relevance judgements for Recall@k."),
    }
    with open(out_dir / "manifest.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    return manifest


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--parquet", type=Path, default=None)
    ap.add_argument("--rows-json", type=Path, default=None,
                    help="Pre-extracted rows, as produced by a partial parquet read.")
    ap.add_argument("--queries", type=int, default=3000)
    args = ap.parse_args()
    if args.parquet is None and args.rows_json is None:
        ap.error("one of --parquet or --rows-json is required")
    m = build(args.parquet, args.queries, rows_json=args.rows_json)
    print(json.dumps(m, indent=2))
