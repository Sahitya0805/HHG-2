import React, { forwardRef, useEffect } from 'react';
import { drawBuilderGraphic } from '../lib/drawCard.js';

const BuilderCanvas = forwardRef(function BuilderCanvas({ mode, state }, ref) {
  useEffect(() => {
    let cancelled = false;

    const paint = async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      if (!cancelled) drawBuilderGraphic(ref.current, mode, state);
    };

    paint();
    return () => {
      cancelled = true;
    };
  }, [mode, ref, state]);

  return <canvas ref={ref} className={`builder-canvas builder-canvas-${mode}`} aria-label="Live generated HH Goa graphic preview" />;
});

export default BuilderCanvas;
