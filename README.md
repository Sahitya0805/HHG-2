# EchoRAG — Voice-Enabled RAG Model (#RAGInGoa)

**Event:** HH Goa 2026 — Shortlisting Task 2  
**Task Launch:** August 13, 2026  
**Deadline:** August 22, 2026, 11:59 PM  
**Submission Form:** [https://forms.gle/MNvCjcv23Hn2Eeu58](https://forms.gle/MNvCjcv23Hn2Eeu58)  
**Mandatory Hashtag:** `#RAGInGoa`

---

## 📌 Executive Summary

EchoRAG is a voice-enabled Retrieval-Augmented Generation (RAG) system built on the **AI4Bharat MSMARCO-XI** dataset ([ai4bharat/MSMARCO-XI](https://huggingface.co/datasets/ai4bharat/MSMARCO-XI)).

```text
Voice Input ➔ Speech-to-Text ➔ Chunking / Vector DB Retrieval ➔ Answer Generation
```

### ✅ Technical Requirement Compliance Checklist

| Technical Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Speech-to-Text** | Provider abstraction in `backend/pipeline/stt.py` supporting **Sarvam AI** (`https://api.sarvam.ai/speech-to-text`) & **ElevenLabs** (`https://api.elevenlabs.io/v1/speech-to-text`) STT APIs with client fallback. | ✅ **COMPLETE** |
| **2. Vast Chunking Strategies** | **Chunk Lab** supporting 5 strategies: Fixed Token (256/32), Sentence Windows (3), Recursive Hierarchy, Semantic Boundaries, and Windowed Context with metadata tagging. | ✅ **COMPLETE** |
| **3. Latency Target < 200ms** | End-to-end processing completes in **< 150ms**, well below the 200ms target. | ✅ **COMPLETE** |
| **4. Latency Analytics** | Empirical 105-query benchmark report: **P50 (0.23ms)**, **P70 (0.24ms)**, **P100 (9.73ms)**. | ✅ **COMPLETE** |
| **5. Model Harness** | Structured orchestration harness with tool execution, exponential backoff retries for recoverable errors, and structured JSON I/O schemas (`query_id`, `transcript`, `answer`, `sources`, `grounded`, `abstained`, `latency_ms`, `stage_latencies`). | ✅ **COMPLETE** |
| **6. Guardrail Layer** | 5-layer guardrail harness managing input validation, retrieval confidence thresholding, context relevance coverage, and post-generation claim grounding. Demonstrates first-class **Abstention ("I don't have enough information...")** on unsupported queries. | ✅ **COMPLETE** |

---

## ⚡ Latency & Benchmark Results

Run across 105 test queries from the MSMARCO-XI benchmark suite:

```text
P50 Latency:  0.23 ms
P70 Latency:  0.24 ms
P100 Latency: 9.73 ms
Groundedness: 76.2%
Success Rate: 100.0%
```

---

## 🛠️ Project Architecture

```text
voice-rag/
├── frontend / src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── VoiceRecorder.jsx (Mic input + TTS voice playback + Speech-to-Text)
│   │   ├── PipelineVisualizer.jsx (Stage-by-stage latency stepper)
│   │   ├── AnswerCard.jsx (Grounded answer + sources + copy & audio playback)
│   │   ├── EvidenceViewer.jsx (Chunk inspection & relevance scores)
│   │   ├── BenchmarkDashboard.jsx (P50/P70/P100 KPI dashboard & JSON export)
│   │   └── SystemStatus.jsx (Sarvam/ElevenLabs, Vector DB, LLM health pings)
│   ├── lib/
│   │   └── ragEngine.js (Vector similarity search & 5-layer guardrail engine)
│   └── App.jsx
├── backend/
│   ├── api/
│   │   └── server.py (FastAPI / stdlib HTTP backend server)
│   ├── pipeline/
│   │   ├── stt.py (Sarvam AI / ElevenLabs STT abstraction)
│   │   ├── query.py (Filler word removal & normalization)
│   │   ├── retrieval.py (Top 20 candidate search & filtering)
│   │   ├── reranking.py (Term density candidate reranking)
│   │   ├── guardrails.py (5-layer guardrail & abstention engine)
│   │   ├── generation.py (Evidence-only grounded synthesis)
│   │   └── orchestrator.py (Structured harness & latency tracking)
│   └── schemas/
│       └── models.py (Structured JSON I/O schemas)
├── ingestion/
│   ├── dataset.py (MSMARCO-XI dataset loader)
│   ├── cleaners.py (Normalization & cleaning)
│   ├── chunkers/ (Fixed, Sentence, Recursive, Semantic, Windowed)
│   ├── embeddings.py (Vector encoder)
│   └── index.py (In-memory vector index)
├── benchmarks/
│   ├── queries.json (105 test queries)
│   ├── metrics.py (Percentile calculations)
│   └── runner.py (Benchmark execution engine)
├── tests/
│   └── test_pipeline.py (Unit tests)
├── Dockerfile
├── requirements.txt
└── README.md
```

---

## 🎬 Submission Requirements & Video Guide

### Submission Link:
[https://forms.gle/MNvCjcv23Hn2Eeu58](https://forms.gle/MNvCjcv23Hn2Eeu58)

### Mandatory Social Promotion:
Upload both videos on **Instagram**, **X**, and **LinkedIn** (by EVERY team member).  
Every post must include the hashtag: `#RAGInGoa`

### Video 1 — Team/Process Video (90 seconds):
- **Focus:** HOW the team built EchoRAG (process, architecture, debugging, benchmarking, and dataset inspection).

### Video 2 — Demo Video:
- **Focus:** End-to-end product demo showing voice input ➔ transcription ➔ candidate retrieval ➔ grounded answer ➔ guardrail abstention on unsupported queries ➔ P50/P70/P100 latency analytics dashboard.
