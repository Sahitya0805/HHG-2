"""
Downloads an ai4bharat/MSMARCO-XI split into ingestion/data/.

The HF CDN drops long connections at low bandwidth, so this pulls ranged chunks
and resumes from whatever is on disk. A partial file from an interrupted run is
a valid starting point -- rerun and it picks up where it stopped.

Run:
    python -m ingestion.fetch_dataset                 # Hindi validation split
    python -m ingestion.fetch_dataset --lang tam --split validation
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path

import requests

DATA_DIR = Path(__file__).parent / "data"
BASE = "https://huggingface.co/datasets/ai4bharat/MSMARCO-XI/resolve/main"
CHUNK = 8 * 1024 * 1024
MAX_STALLS = 30

LANGS = ["asm", "ben", "guj", "hin", "kan", "mal", "mar",
         "nep", "ori", "pan", "san", "tam", "tel", "urd"]


def fetch(lang: str = "hin", split: str = "validation",
          out_dir: Path = DATA_DIR) -> Path:
    if lang not in LANGS:
        raise SystemExit(f"Unknown language '{lang}'. Options: {', '.join(LANGS)}")

    suffix = "val" if split == "validation" else "train"
    name = f"{lang}{suffix}.parquet"
    url = f"{BASE}/{split}/{name}"
    out_dir.mkdir(parents=True, exist_ok=True)
    dest = out_dir / name

    session = requests.Session()
    head = session.head(url, allow_redirects=True, timeout=30)
    head.raise_for_status()
    total = int(head.headers["Content-Length"])

    started = time.perf_counter()
    stalls = 0

    while True:
        have = dest.stat().st_size if dest.exists() else 0
        if have >= total:
            break
        end = min(have + CHUNK, total) - 1
        try:
            r = session.get(url, headers={"Range": f"bytes={have}-{end}"},
                            timeout=120, stream=True)
            r.raise_for_status()
            with open(dest, "ab") as f:
                for part in r.iter_content(1 << 20):
                    if part:
                        f.write(part)
            stalls = 0
        except Exception as exc:
            stalls += 1
            if stalls > MAX_STALLS:
                raise SystemExit(
                    f"Gave up after {MAX_STALLS} consecutive failures "
                    f"({type(exc).__name__}: {exc}). "
                    f"{dest.stat().st_size / 1e6:.0f}MB is on disk; rerun to resume."
                )
            time.sleep(min(2 * stalls, 15))
            continue

        now = dest.stat().st_size
        elapsed = max(time.perf_counter() - started, 1e-6)
        print(f"  {now/1e6:7.1f}/{total/1e6:.0f} MB  {100*now/total:5.1f}%  "
              f"{now/1e6/elapsed:.2f} MB/s", flush=True)

    print(f"Done: {dest} ({dest.stat().st_size/1e6:.1f} MB)")
    return dest


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="hin", choices=LANGS)
    ap.add_argument("--split", default="validation", choices=["validation", "train"])
    args = ap.parse_args()
    fetch(args.lang, args.split)
