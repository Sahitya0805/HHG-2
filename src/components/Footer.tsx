import React from 'react';
import { Palmtree, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-goa-green-dark text-cream border-t-2 border-black py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Column */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hh-yellow border-2 border-black rounded-xl flex items-center justify-center text-black shadow-neo">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-hh-yellow">
              HH GOA 2026 Identity Studio
            </h3>
            <p className="font-mono text-xs text-cream/70">
              28–31 October 2026 • Goa, India • 2:47 PM STUDIO
            </p>
          </div>
        </div>

        {/* Center Hashtag Banner */}
        <div className="bg-hot-pink text-white border-2 border-black font-mono text-xs font-bold px-4 py-2 rounded-xl shadow-neo flex items-center gap-2">
          <span>Official Tag:</span>
          <strong className="text-hh-yellow text-sm">#FrameInGoa</strong>
        </div>

        {/* Right Column: Privacy Note */}
        <div className="text-center md:text-right text-xs font-mono text-cream/80 max-w-xs">
          <div className="flex items-center justify-center md:justify-end gap-1 text-goa-green-light mb-1">
            <ShieldCheck className="w-4 h-4 text-hh-yellow" />
            <span className="font-bold text-cream">100% Privacy Preserved</span>
          </div>
          <p className="text-[11px] text-cream/70">
            Photos are processed 100% client-side in your browser. No images are stored.
          </p>
        </div>

      </div>
    </footer>
  );
};
