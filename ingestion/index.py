"""
Vector Index Engine for EchoRAG.
Maintains in-memory vector index across multiple chunking strategies.
Provides fast candidate vector retrieval (< 5ms).
"""

from typing import List, Dict, Any, Tuple
from .dataset import load_msmarco_dataset
from .cleaners import clean_text
from .chunkers import (
    fixed_token_chunking,
    sentence_window_chunking,
    recursive_chunking,
    semantic_chunking,
    windowed_context_chunking,
)
from .embeddings import EmbeddingModel, cosine_similarity

class VectorIndex:
    def __init__(self):
        self.embedding_model = EmbeddingModel()
        self.strategies: Dict[str, List[Dict[str, Any]]] = {
            "fixed": [],
            "sentence": [],
            "recursive": [],
            "semantic": [],
            "window": []
        }
        self.indexed: bool = False
        self._build_index()

    def _build_index(self):
        """Offline dataset indexing phase across all chunking strategies."""
        docs = load_msmarco_dataset()
        for doc in docs:
            doc_id = doc["doc_id"]
            raw_text = clean_text(doc["text"])
            
            # Strategy A
            chunks_fixed = fixed_token_chunking(doc_id, raw_text, chunk_size=100, overlap=20)
            # Strategy B
            chunks_sentence = sentence_window_chunking(doc_id, raw_text, window_size=3, stride=2)
            # Strategy C
            chunks_recursive = recursive_chunking(doc_id, raw_text, max_tokens=120)
            # Strategy D
            chunks_semantic = semantic_chunking(doc_id, raw_text, similarity_threshold=0.25, max_tokens=150)
            # Strategy E
            chunks_window = windowed_context_chunking(doc_id, raw_text, base_chunk_size=80)
            
            for strategy_name, chunks in [
                ("fixed", chunks_fixed),
                ("sentence", chunks_sentence),
                ("recursive", chunks_recursive),
                ("semantic", chunks_semantic),
                ("window", chunks_window),
            ]:
                for chunk in chunks:
                    vec = self.embedding_model.encode(chunk["text"])
                    chunk["vector"] = vec
                    self.strategies[strategy_name].append(chunk)
                    
        self.indexed = True

    def search(
        self,
        query_text: str,
        strategy: str = "semantic",
        top_k: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Stage 1: Dense vector candidate search.
        Returns top_k candidate chunks with similarity scores.
        """
        if strategy not in self.strategies:
            strategy = "semantic"
            
        chunks = self.strategies[strategy]
        query_vec = self.embedding_model.encode(query_text)
        
        if not query_vec or not chunks:
            return []
            
        results = []
        for chunk in chunks:
            sim = cosine_similarity(query_vec, chunk["vector"])
            results.append((sim, chunk))
            
        results.sort(key=lambda x: x[0], reverse=True)
        
        candidates = []
        for score, chunk in results[:top_k]:
            candidate = {k: v for k, v in chunk.items() if k != "vector"}
            candidate["score"] = round(float(score), 4)
            candidates.append(candidate)
            
        return candidates

# Global vector index instance
_GLOBAL_INDEX = None

def get_vector_index() -> VectorIndex:
    global _GLOBAL_INDEX
    if _GLOBAL_INDEX is None:
        _GLOBAL_INDEX = VectorIndex()
    return _GLOBAL_INDEX
