# Frame In Goa · HH Goa 2026

A small browser tool for HH Goa 2026 Shortlisting Task 01. You give it a photo and
your details, it gives you back a PNG you can post. There is no login, no upload
server, and no cropping in a separate app first.

## What it makes

**Goa PFP** is a 1080 × 1080 square for your profile picture.

**Builder ID** is a 1080 × 1350 identity card. The builder class and the ID number
come out of what you type in the stack field, so the same input always gives the
same card.

**Team Frame** puts two to four teammates on one 1080 × 1350 poster.

## What it handles

Photos can be JPG, PNG, WebP, or HEIC/HEIF straight off an iPhone. Portrait,
landscape and odd aspect ratios all get cover-fitted into the frame on their own,
and you can nudge the zoom, the position and the filter afterwards if the automatic
crop misses.

The download is a real full-resolution PNG, not a screenshot of the preview. On
phones that support it, the share button opens the native share sheet with the
image already attached, so it reaches X as a proper attachment. On desktop the
image downloads and gets copied to the clipboard, then X opens with the caption
already filled in: the deployment link, `@247pmstudio`, and the `#FrameInGoa`
hashtag the task requires.

There is also a static 1200 × 630 Open Graph cover so the link itself previews
properly on X.

Every photo is processed in the browser. Nothing is uploaded anywhere.

## Branding

The Hacker House wordmark, the गोवा lockup, the 2:47PM Studio mark and the Goa
sunrise illustration all come from [hhgoa.com](https://hhgoa.com/). This is a
community build for Open Trial 01. It does not represent admission or selection.

## Running it

```bash
npm install
npm run dev
```

To check a production build:

```bash
npm run build
npm run preview
```

## Before you submit

One submission per team. Use real photos of real people, attach the generated PNG,
include the live link, and keep `#FrameInGoa` spelled exactly that way in the post.
