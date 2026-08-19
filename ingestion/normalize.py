"""
Strips disfluencies from voice transcripts so they don't pollute BM25.

Only unambiguous ones (um, uh, er, hmm) and only where they can't be content --
leading, or comma-bracketed. Does not touch like/so/basically:
those are filler in some questions and content in others ("what is a like
button"), and a word filter can't tell. Raw text is kept alongside.
"""

from __future__ import annotations

import re
from typing import Dict

# Words that are never content in an English question.
_DISFLUENCY = r"(?:um+|uh+|er+|erm|hmm+|mm+)"
_LEADING = re.compile(rf"^\W*(?:{_DISFLUENCY}\b[\s,.]*)+", re.I)
_BRACKETED = re.compile(rf",\s*{_DISFLUENCY}\s*,", re.I)
_REPEATED_WORD = re.compile(r"\b(\w+)(\s+\1\b)+", re.I)
_WS = re.compile(r"\s+")


def normalize_query(text: str) -> Dict[str, object]:
    raw = text or ""
    out = _LEADING.sub("", raw)
    out = _BRACKETED.sub(", ", out)
    out = _REPEATED_WORD.sub(r"\1", out)      # "what what is" -> "what is"
    out = _WS.sub(" ", out).strip()
    return {
        "raw": raw,
        "normalized": out,
        "changed": out != raw.strip(),
    }
