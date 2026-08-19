"""
Strategy D — Semantic Chunking
Detects semantic topic shifts between adjacent sentences to place boundaries.
"""

import re
import math
from typing import List, Dict, Any
from collections import Counter

def sentence_similarity(s1: str, s2: str) -> float:
    """Calculates TF-IDF / Jaccard semantic overlap between two sentences."""
    words1 = [w.lower() for w in re.findall(r'\w+', s1)]
    words2 = [w.lower() for w in re.findall(r'\w+', s2)]
    
    if not words1 or not words2:
        return 0.0
        
    c1, c2 = Counter(words1), Counter(words2)
    intersection = sum((c1 & c2).values())
    denom = math.sqrt(len(words1) * len(words2))
    return intersection / denom if denom > 0 else 0.0

def semantic_chunking(
    document_id: str,
    text: str,
    similarity_threshold: float = 0.2,
    max_tokens: int = 200,
    language: str = "en"
) -> List[Dict[str, Any]]:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    if not sentences:
        return []
        
    chunks_text = []
    current_chunk = [sentences[0]]
    current_tokens = len(sentences[0].split())
    
    for i in range(1, len(sentences)):
        prev_s = sentences[i-1]
        curr_s = sentences[i]
        curr_tokens = len(curr_s.split())
        
        sim = sentence_similarity(prev_s, curr_s)
        
        # Split if similarity drops below threshold OR token limit reached
        if (sim < similarity_threshold and current_tokens >= 40) or (current_tokens + curr_tokens > max_tokens):
            chunks_text.append(" ".join(current_chunk))
            current_chunk = [curr_s]
            current_tokens = curr_tokens
        else:
            current_chunk.append(curr_s)
            current_tokens += curr_tokens
            
    if current_chunk:
        chunks_text.append(" ".join(current_chunk))
        
    chunks = []
    for idx, c_text in enumerate(chunks_text):
        chunk_id = f"{document_id}_semantic_{idx:03d}"
        chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "strategy": "semantic",
            "chunk_index": idx,
            "language": language,
            "text": c_text,
            "token_count": len(c_text.split())
        })
        
    return chunks
