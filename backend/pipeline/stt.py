"""
Sarvam speech-to-text. Picked over ElevenLabs because MSMARCO-XI is Indic
(14 languages) and Saarika is trained on them.

Without SARVAM_API_KEY, transcribe() returns status="unconfigured" instead of
falling back to something else and calling it Sarvam. Typed input goes through
accept_typed_query() with source="typed" and stt_ms=None, so a stage that never
ran can't contribute a made-up number to the latency breakdown.
"""

from __future__ import annotations

import os
import time
from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional

import requests

SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_MODEL = "saarika:v2"
DEFAULT_TIMEOUT_S = 10.0

# MSMARCO-XI language coverage, mapped to Sarvam language codes.
SARVAM_LANGUAGES = {
    "hin": "hi-IN", "ben": "bn-IN", "guj": "gu-IN", "kan": "kn-IN",
    "mal": "ml-IN", "mar": "mr-IN", "ori": "od-IN", "pan": "pa-IN",
    "tam": "ta-IN", "tel": "te-IN", "eng": "en-IN",
}


class STTNotConfigured(RuntimeError):
    """Raised when a transcription is requested but no provider key is present."""


@dataclass
class TranscriptionResult:
    transcript: str
    provider: Optional[str]
    source: str                      # "sarvam" | "typed" | "none"
    status: str                      # "success" | "unconfigured" | "error"
    language: Optional[str] = None
    stt_ms: Optional[float] = None   # None when no STT call was made
    request_id: Optional[str] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def provider_status() -> Dict[str, Any]:
    """Reports whether a real STT provider is wired up. Used by /api/health."""
    key = os.getenv("SARVAM_API_KEY")
    return {
        "provider": "sarvam" if key else None,
        "model": SARVAM_MODEL if key else None,
        "configured": bool(key),
        "detail": (
            "Sarvam Saarika v2 ready"
            if key else
            "SARVAM_API_KEY not set - voice transcription is disabled. "
            "Typed queries still work end to end."
        ),
    }


def transcribe(
    audio_bytes: bytes,
    language: str = "hi-IN",
    timeout_s: float = DEFAULT_TIMEOUT_S,
    retries: int = 2,
) -> TranscriptionResult:
    """
    Transcribes audio via Sarvam. Measures wall-clock latency of the real call.

    Retries only on transport errors and 5xx responses -- a 4xx means the
    request itself is wrong and retrying would just burn latency budget.
    """
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key:
        return TranscriptionResult(
            transcript="", provider=None, source="none", status="unconfigured",
            error="SARVAM_API_KEY is not set; no speech-to-text provider is available.",
        )

    if not audio_bytes:
        return TranscriptionResult(
            transcript="", provider="sarvam", source="sarvam", status="error",
            error="Empty audio payload.",
        )

    last_error: Optional[str] = None
    started = time.perf_counter()

    for attempt in range(retries + 1):
        try:
            resp = requests.post(
                SARVAM_STT_URL,
                headers={"api-subscription-key": api_key},
                files={"file": ("audio.wav", audio_bytes, "audio/wav")},
                data={"model": SARVAM_MODEL, "language_code": language},
                timeout=timeout_s,
            )

            if resp.status_code >= 500:
                last_error = f"Sarvam {resp.status_code}: {resp.text[:200]}"
                continue
            if resp.status_code >= 400:
                return TranscriptionResult(
                    transcript="", provider="sarvam", source="sarvam", status="error",
                    stt_ms=round((time.perf_counter() - started) * 1000, 2),
                    error=f"Sarvam {resp.status_code}: {resp.text[:200]}",
                )

            body = resp.json()
            return TranscriptionResult(
                transcript=(body.get("transcript") or "").strip(),
                provider="sarvam",
                source="sarvam",
                status="success",
                language=body.get("language_code") or language,
                stt_ms=round((time.perf_counter() - started) * 1000, 2),
                request_id=body.get("request_id"),
            )

        except requests.RequestException as exc:
            last_error = f"{type(exc).__name__}: {exc}"

    return TranscriptionResult(
        transcript="", provider="sarvam", source="sarvam", status="error",
        stt_ms=round((time.perf_counter() - started) * 1000, 2),
        error=f"Sarvam unreachable after {retries + 1} attempts. {last_error}",
    )


def accept_typed_query(text: str) -> TranscriptionResult:
    """
    Wraps a typed query in the same result shape as a transcription.

    Reported as source="typed" with stt_ms=None so downstream latency
    accounting never counts a speech-to-text stage that did not happen.
    """
    return TranscriptionResult(
        transcript=(text or "").strip(),
        provider="text-input",
        source="typed",
        status="success",
        stt_ms=None,
    )
