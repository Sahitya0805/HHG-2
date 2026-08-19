"""
Unit and Integration Tests for EchoRAG Pipeline.
"""

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.pipeline.orchestrator import run_pipeline
from backend.pipeline.query import process_query
from backend.pipeline.guardrails import check_input_guardrail, check_retrieval_guardrail
from ingestion.cleaners import remove_filler_words
from ingestion.chunkers import (
    fixed_token_chunking,
    sentence_window_chunking,
    recursive_chunking,
    semantic_chunking,
    windowed_context_chunking,
)

class TestEchoRAGPipeline(unittest.TestCase):
    def test_filler_word_removal(self):
        raw = "Umm... so like, what causes high blood pressure?"
        cleaned = remove_filler_words(raw)
        self.assertNotIn("umm", cleaned.lower())
        self.assertNotIn("like", cleaned.lower())
        self.assertIn("causes high blood pressure", cleaned.lower())

    def test_chunking_strategies(self):
        text = "Influenza is a flu virus. Symptoms include fever and chills. It is contagious."
        fixed = fixed_token_chunking("doc1", text, chunk_size=10, overlap=2)
        sentence = sentence_window_chunking("doc1", text, window_size=2)
        recursive = recursive_chunking("doc1", text, max_tokens=15)
        semantic = semantic_chunking("doc1", text)
        window = windowed_context_chunking("doc1", text)

        self.assertTrue(len(fixed) > 0)
        self.assertTrue(len(sentence) > 0)
        self.assertTrue(len(recursive) > 0)
        self.assertTrue(len(semantic) > 0)
        self.assertTrue(len(window) > 0)

    def test_normal_query_pipeline(self):
        res = run_pipeline("What causes the symptoms of influenza and seasonal flu?")
        self.assertEqual(res["status"], "success")
        self.assertFalse(res["abstained"])
        self.assertTrue(res["grounded"])
        self.assertTrue(len(res["sources"]) > 0)
        self.assertTrue(res["latency_ms"] < 200.0)

    def test_unsupported_query_abstention(self):
        res = run_pipeline("What is the population of Mars?")
        self.assertEqual(res["status"], "abstained")
        self.assertTrue(res["abstained"])
        self.assertIn("don't have enough information", res["answer"].lower())

if __name__ == "__main__":
    unittest.main()
