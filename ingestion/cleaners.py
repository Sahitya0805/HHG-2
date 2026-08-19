"""
Text cleaning and normalization utilities for EchoRAG ingestion and query processing.
"""

import re
import string

FILLER_WORDS = {
    "um", "umm", "uh", "uhh", "like", "you know", "so", "basically",
    "actually", "literally", "honestly", "mean", "i mean", "err", "ah"
}

def clean_text(text: str) -> str:
    """Basic text cleaning for documents and queries."""
    if not text:
        return ""
    # Normalize whitespace and strip invisible control characters
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def remove_filler_words(text: str) -> str:
    """Removes conversational filler words from speech-to-text transcripts."""
    if not text:
        return ""
    words = text.split()
    cleaned = []
    for w in words:
        stripped = w.strip(string.punctuation).lower()
        if stripped not in FILLER_WORDS:
            cleaned.append(w)
    result = " ".join(cleaned)
    # Ensure initial capitalization if missing
    return result.strip()

def normalize_query(transcript: str) -> dict:
    """
    Normalizes transcript before retrieval pipeline.
    Returns metadata about normalization changes.
    """
    raw = transcript or ""
    trimmed = raw.strip()
    cleaned = clean_text(trimmed)
    no_fillers = remove_filler_words(cleaned)
    
    # Capitalize first letter
    final_query = no_fillers[0].upper() + no_fillers[1:] if no_fillers else ""
    
    is_valid = len(final_query) >= 3
    is_empty = len(final_query) == 0
    
    return {
        "raw": raw,
        "normalized": final_query,
        "is_valid": is_valid,
        "is_empty": is_empty,
        "character_count": len(final_query),
        "word_count": len(final_query.split()) if final_query else 0
    }
