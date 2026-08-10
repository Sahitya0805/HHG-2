# Frame In Goa · HH Goa 2026

A mobile-first generator built for HH Goa 2026 Shortlisting Task 01. It creates crisp, downloadable graphics directly in the browser—no login, upload server, or manual cropping required.

## Output modes

- **Goa PFP** — a 1080 × 1080 profile frame.
- **Builder ID** — a 1080 × 1350 editorial identity card with a deterministic builder class and ID generated from the user's details.
- **Squad Signal** — a combined 1080 × 1350 team poster for two to four builders.

## Task requirements covered

- JPG, PNG, WebP, HEIC and HEIF input.
- Automatic cover fitting for portrait, landscape and unusual aspect ratios.
- Optional zoom, pan and photo filters.
- Real high-resolution PNG download.
- Native image sharing on supported mobile browsers.
- Native file sharing on supported phones so the PNG reaches X as an attachment.
- Desktop fallback that downloads and copies the PNG before opening X.
- Pre-filled X caption containing the deployment link, `@247pmstudio`, and mandatory `#FrameInGoa` hashtag.
- Static 1200 × 630 Open Graph cover so the deployment link has a branded X preview.
- Fully client-side photo processing.
- Responsive, one-pass flow with no account gate.

## Branding

The generator uses the recognizable Hacker House wordmark, `गोवा` lockup, 2:47PM Studio mark, and Goa sunrise illustration published on [hhgoa.com](https://hhgoa.com/). The product is community-built for Open Trial 01 and does not claim official admission or selection.

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

Only one submission is accepted per team. Use real participant photos, attach the generated PNG, include the live deployment link, and keep the exact `#FrameInGoa` hashtag in the X post.
