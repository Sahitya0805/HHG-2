# EchoRAG — Voice-Enabled RAG over MSMARCO-XI

**HH Goa 2026 · Task 2 · #RAGInGoa**

Speak or type a question. EchoRAG transcribes it with Sarvam, retrieves from the real
[`ai4bharat/MSMARCO-XI`](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI) corpus using a
hybrid dense + BM25 index across seven chunking strategies, and answers **only** with a
verbatim span of what it retrieved, or refuses.

```
voice ─► Sarvam STT ─► guardrails L1–L2 ─► hybrid retrieval ─► rerank
                                                                 │
              answer ◄─ guardrail L5 ◄─ span selection ◄─ guardrails L3–L4
```

---

## Limitations

- **No prose generation.** Answers are verbatim spans, so nothing gets synthesised across
  passages or rephrased. That's the price of provable groundedness.
- **No key, no voice.** Without `SARVAM_API_KEY` voice input is disabled and the UI says so.
  There's no silent fallback to browser speech recognition.
- **The safety layer is regex.** Catches direct phrasings and common injection shapes, misses
  obfuscated ones. It's a guardrail, not moderation.
- **Static embeddings have no attention.** Hybrid retrieval and the lexical rerank cover some
  of that gap, not all of it.

## Latency

Measured with `time.perf_counter` around real pipeline calls, after warmup, across a
300-query sample. Reproduce with `npm run bench`.

| Metric | Measured |
|---|---|
| **P50** | **2.615 ms** |
| **P70** | **2.906 ms** |
| **P90** | 3.277 ms |
| **P100** | **4.719 ms** |
| mean ± stdev | 2.493 ± 0.708 ms |
| under 200ms target | **300/300 (100.0%)** |
| cold start | 746.33 ms (model load, measured once, excluded from percentiles) |

Measured across 300 real MSMARCO-XI queries with `time.perf_counter`, after warmup.
Reproduce: `make bench`.

Per-stage P50: `generation` 1.14ms · `guardrails_input` 0.007ms · `guardrails_provenance` 0.03ms · `guardrails_retrieval` 0.075ms · `rerank` 0.001ms · `retrieval` 1.462ms

**Scope.** The 200ms target applies to `pipeline_ms`: query embedding, retrieval, rerank, guardrails,
span selection. Sarvam STT is excluded and reported separately, since it's a network call to
a third-party API. Cold start is its own number, not folded into the percentiles.

Chunking and index building are offline (`ingestion/build_index.py`); a request never
re-chunks the corpus. Build cost is in `ingestion/indexes/build_report.json`.

## Chunking — seven strategies

MSMARCO-XI isn't long-form: ~10 passages of 50–120 words per query. Aggressive splitting
destroys context, so the useful levers are merging and context enrichment. Several of these
grow chunks rather than shrink them.

| Strategy | Boundary logic |
|---|---|
| `atomic` | Whole passage. MSMARCO passages are already curated retrieval units. |
| `fixed_overlap` | 64-token windows, 25% overlap, tail-sliver guard. |
| `sentence_window` | 3 sentences, stride 2 — never splits mid-sentence. |
| `recursive` | Paragraph → sentence → token descent under a 96-token budget. |
| `semantic` | Boundaries at real embedding cosine-distance topic shifts. |
| `metadata_aware` | Folds MSMARCO `query_type` + language into the embedded text. |
| `context_enriched` | Embeds neighbour context, cites only the core span. |

| Strategy | Chunks | R@1 | R@5 | R@10 | MRR@10 | P50 ms |
|---|---|---|---|---|---|---|
| `metadata_aware` | 29,985 | 0.268 | 0.738 | 0.899 | 0.455 | 2.556 |
| `atomic` | 29,985 | 0.259 | 0.736 | 0.904 | 0.449 | 2.734 |
| `recursive` | 31,147 | 0.259 | 0.735 | 0.902 | 0.447 | 2.644 |
| `fixed_overlap` | 35,548 | 0.259 | 0.713 | 0.882 | 0.443 | 2.751 |
| `sentence_window` | 46,442 | 0.261 | 0.688 | 0.843 | 0.432 | 2.875 |
| `context_enriched` | 29,985 | 0.210 | 0.698 | 0.951 | 0.417 | 2.55 |
| `semantic` | 76,265 | 0.224 | 0.661 | 0.825 | 0.406 | 3.557 |

Scored on 800 gold-labelled queries using MSMARCO `is_selected`.

**Reading the table.** `semantic` produces the most chunks (76k) and retrieves
*worst* (R@5 0.661 vs 0.738). That is the design note in
`ingestion/chunking.py` confirmed by measurement: MSMARCO passages are already short curated
units, so splitting them further destroys context rather than sharpening it. `metadata_aware`
wins on precision (R@1, R@5, MRR) by folding `query_type` into the embedded text, which is why
it is the default. `context_enriched` has the best R@10 (0.951) but the worst
R@1 (0.210) -- neighbour context finds the right region and blurs the exact hit.

## Retrieval

Dense (model2vec cosine, one numpy matmul) fused with sparse (BM25 over an inverted index,
vectorised so only query-term postings are touched).

One detail that matters: BM25 is unbounded and gets max-normalised per query, so the top hit
scores ≈1.0 for every query including nonsense ones. Thresholding abstention on the fused
score would never fire. The fused score ranks; raw dense cosine, which is comparable across
queries, is what the guardrail thresholds on.

## Guardrails

| Layer | Check | On failure |
|---|---|---|
| L1 | Malformed / empty / overlong input | refuse |
| L2 | Unsafe requests, prompt injection | refuse before any retrieval |
| L3 | Top dense cosine below calibrated threshold | abstain |
| L4 | No content-term overlap with evidence | abstain |
| L5 | Answer not a verbatim span of a cited chunk, or dangling citation | refuse |

`benchmarks/calibrate.py` sweeps the abstention threshold against
400 in-domain queries and 18 out-of-domain probes; **0.6** maximises balanced
accuracy at 85.0% in-domain answered / 77.8% out-of-domain declined.

Measured on the live pipeline: **221/300** in-domain answered,
**8/10** out-of-domain declined, **3/3** unsafe/injection blocked.

**The caveat.** These distributions overlap and no threshold separates them cleanly.
Out-of-domain cosines run 0.5635–0.6875 while the bottom decile of genuine queries sits at
0.5774. MSMARCO is broad web text, so "population of Mars in 2090" legitimately
retrieves passages about Mars. Roughly **one in five out-of-domain questions still gets an
answer** drawn from loosely-related evidence, and a stricter threshold would cost real
in-domain coverage. Closing that gap needs entailment checking, which this system does not do.

L5 checks provenance, not entailment. Since generation is extractive, "is this grounded"
collapses to a substring check. Stronger than a similarity score, but only because the
generator can't write new prose.

## Harness

`backend/pipeline/orchestrator.py` — typed stage contracts, retries with backoff on transient
failures only, fallback to the `atomic` index when a strategy is missing, per-stage wall-clock
timing. Stages that didn't run report `None`, not zero.

`pipeline_ms` is measured once around the request rather than summed from stages; the
difference is harness overhead and the UI shows it.

---

## Run it

```bash
python -m venv .venv && .venv/bin/pip install -r requirements.txt
npm install
```

The corpus ships as `ingestion/data/*.jsonl.gz` (3.7MB), so you only need to build indexes:

```bash
make index                  # 7 hybrid indexes, ~551MB on disk, not committed
```

To rebuild the corpus from the original parquet (462MB download, resumable):

```bash
make data
```

Then:

```bash
cp .env.example .env        # add SARVAM_API_KEY for voice; typed queries work without it
npm run api                 # backend on :8000
npm run dev                 # frontend on :3000
```

Benchmarks and tests:

```bash
npm run bench               # P50/P70/P100 + Recall@k, writes benchmarks/reports/
npm test
python -m benchmarks.calibrate   # re-derive the abstention threshold
```

## Layout

```
ingestion/    chunking (7 strategies), embeddings, hybrid index, corpus build
backend/      stt (Sarvam), guardrails (5 layers), extractive generation, harness, API
benchmarks/   latency + Recall@k harness, threshold calibration, reports
src/          React UI — every number rendered comes from the backend
tests/        unit tests + integration tests (auto-skip without indexes)
```

## Dataset provenance

`ai4bharat/MSMARCO-XI` validation split. English passages are the retrievable corpus;
`is_selected` gives the gold relevance labels that make Recall@k measurable.
`ingestion/data/manifest.json` records source file, row counts and build time.
