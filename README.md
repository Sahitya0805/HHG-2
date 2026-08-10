# HH Goa 2026 Builder Signal Generator

A mobile-first generator built for HH Goa 2026 Shortlisting Task 01. It creates crisp, downloadable graphics directly in the browser—no login, upload server, or manual cropping required.

## Output modes

- **Goa PFP** — a 1080 × 1080 profile frame.
- **Builder Pass** — a 1080 × 1350 event-style pass with a deterministic builder class generated from the user's stack.
- **Squad Signal** — a combined 1080 × 1350 team poster for two to four builders.

## Task requirements covered

- JPG, PNG, WebP, HEIC and HEIF input.
- Automatic cover fitting for portrait, landscape and unusual aspect ratios.
- Optional zoom, pan and photo filters.
- Real high-resolution PNG download.
- Native image sharing on supported mobile browsers.
- Desktop X fallback with a pre-filled caption and mandatory `#FrameInGoa` hashtag.
- Fully client-side photo processing.
- Responsive, one-pass flow with no account gate.

## Run locally

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Submission reminder

Only one submission is accepted per team. The submission must include the live link and an X post that actually contains `#FrameInGoa`.
