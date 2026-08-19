"""
Strategy E — Windowed Context Chunking
Attaches neighboring context (Chunk N-1 + Chunk N + Chunk N+1) to prevent losing boundary context.
"""

from typing import List, Dict, Any
from .fixed import fixed_token_chunking

def windowed_context_chunking(
    document_id: str,
    text: str,
    base_chunk_size: int = 100,
    language: str = "en"
) -> List[Dict[str, Any]]:
    base_chunks = fixed_token_chunking(document_id, text, chunk_size=base_chunk_size, overlap=10, language=language)
    if not base_chunks:
        return []
        
    windowed_chunks = []
    for idx, chunk in enumerate(base_chunks):
        prev_text = base_chunks[idx - 1]["text"] if idx > 0 else ""
        curr_text = chunk["text"]
        next_text = base_chunks[idx + 1]["text"] if idx < len(base_chunks) - 1 else ""
        
        full_text = " ".join([t for t in [prev_text, curr_text, next_text] if t]).strip()
        chunk_id = f"{document_id}_window_{idx:03d}"
        
        windowed_chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "strategy": "window",
            "chunk_index": idx,
            "language": language,
            "text": full_text,
            "primary_text": curr_text,
            "token_count": len(full_text.split())
        })
        
    return windowed_chunks
