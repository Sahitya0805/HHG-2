"""
Strategy C — Recursive Chunking
Hierarchy: Document -> Paragraph -> Sentence -> Token.
Only splits deeper when current chunk exceeds max token count.
"""

import re
from typing import List, Dict, Any

def recursive_chunking(
    document_id: str,
    text: str,
    max_tokens: int = 150,
    language: str = "en"
) -> List[Dict[str, Any]]:
    # Stage 1: Paragraphs
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    if not paragraphs:
        paragraphs = [text.strip()]
        
    final_passages = []
    
    for paragraph in paragraphs:
        words = paragraph.split()
        if len(words) <= max_tokens:
            final_passages.append(paragraph)
        else:
            # Stage 2: Sentences
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', paragraph) if s.strip()]
            current_group = []
            current_len = 0
            
            for sentence in sentences:
                s_words = sentence.split()
                if current_len + len(s_words) <= max_tokens:
                    current_group.append(sentence)
                    current_len += len(s_words)
                else:
                    if current_group:
                        final_passages.append(" ".join(current_group))
                    # If a single sentence exceeds max_tokens, split by token
                    if len(s_words) > max_tokens:
                        for i in range(0, len(s_words), max_tokens):
                            sub = " ".join(s_words[i:i+max_tokens])
                            final_passages.append(sub)
                        current_group = []
                        current_len = 0
                    else:
                        current_group = [sentence]
                        current_len = len(s_words)
            if current_group:
                final_passages.append(" ".join(current_group))
                
    chunks = []
    for idx, passage in enumerate(final_passages):
        chunk_id = f"{document_id}_recursive_{idx:03d}"
        token_count = len(passage.split())
        chunks.append({
            "chunk_id": chunk_id,
            "document_id": document_id,
            "strategy": "recursive",
            "chunk_index": idx,
            "language": language,
            "text": passage,
            "token_count": token_count
        })
        
    return chunks
