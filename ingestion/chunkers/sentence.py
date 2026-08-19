"""
Strategy B — Sentence Window Chunking
Groups complete sentences together into context windows.
"""

import re
from typing import List, Dict, Any

def split_sentences(text: str) -> List[str]:
    """Splits text into sentences using punctuation boundaries."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def sentence_window_chunking(
    document_id: str,
    text: str,
    window_size: int = 3,
    stride: int = 2,
    language: str = "en"
) -> List[Dict[str, Any]]:
    sentences = split_sentences(text)
    if not sentences:
        return []
    
    chunks = []
    chunk_idx = 0
    start = 0
    
    while start < len(sentences):
        end = min(start + window_size, len(sentences))
        window_sentences = sentences[start:end]
        chunk_text = " ".join(window_sentences)
        
        chunk_id = f"{document_id}_sentence_{chunk_idx:03d}"
        token_count = len(chunk_text.split())
        
        chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "strategy": "sentence",
            "chunk_index": chunk_idx,
            "language": language,
            "text": chunk_text,
            "token_count": token_count,
            "sentence_count": len(window_sentences)
        })
        
        chunk_idx += 1
        start += stride
        if end >= len(sentences):
            break
            
    return chunks
