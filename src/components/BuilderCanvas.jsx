import React, { forwardRef, useEffect } from 'react';
import { drawBuilderGraphic } from '../lib/drawCard.js';

const BRAND_SOURCES = {
  wordmark: '/brand/hacker-house.png',
  hindi: '/brand/goa-hindi.svg',
  studio: '/brand/247pm.svg',
  sunrise: '/brand/goa-sunrise.webp',
};

let brandAssetsPromise;

function loadBrandAssets() {
  if (!brandAssetsPromise) {
    brandAssetsPromise = Promise.all(Object.entries(BRAND_SOURCES).map(([key, source]) => (
      new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([key, image]);
        image.onerror = () => resolve([key, null]);
        image.src = source;
      })
    ))).then((entries) => Object.fromEntries(entries));
  }
  return brandAssetsPromise;
}

const BuilderCanvas = forwardRef(function BuilderCanvas({ mode, state }, ref) {
  useEffect(() => {
    let cancelled = false;

    const paint = async () => {
      const [, brandAssets] = await Promise.all([
        document.fonts?.ready,
        loadBrandAssets(),
      ]);
      if (!cancelled) drawBuilderGraphic(ref.current, mode, { ...state, brandAssets });
    };

    paint();
    return () => {
      cancelled = true;
    };
  }, [mode, ref, state]);

  return <canvas ref={ref} className={`builder-canvas builder-canvas-${mode}`} aria-label="Live generated HH Goa graphic preview" />;
});

export default BuilderCanvas;
