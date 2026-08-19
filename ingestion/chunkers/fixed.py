"""
Strategy A — Fixed Token/Word Chunks with Overlap
"""

from typing import List, Dict, Any

def fixed_token_chunking(
    document_id: str,
    text: str,
    chunk_size: int = 128,
    overlap: int = 24,
    language: str = "en"
) -> List[Dict[str, Any]]:
    words = text.split()
    if not words:
        return []
    
    chunks = []
    chunk_idx = 0
    start = 0
    step = max(1, chunk_size - overlap)
    
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words)
        
        chunk_id = f"{document_id}_fixed_{chunk_idx:03d}"
        chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "strategy": "fixed",
            "chunk_index": chunk_idx,
            "language": language,
            "text": chunk_text,
            "token_count": len(chunk_words),
            "start_word_idx": start,
            "end_word_idx": end
        })
        
        chunk_idx += 1
        start += step
        if end >= len(words):
            break
            
    return chunks
