import React from 'react';
import { Palmtree, Sparkles, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenExamples: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExamples }) => {
  return (
    <header className="sticky top-0 z-40 bg-goa-green-dark/95 backdrop-blur-md border-b-2 border-black px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-hh-yellow border-2 border-black flex items-center justify-center shadow-neo text-black">
            <Palmtree className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl lg:text-2xl text-hh-yellow tracking-tight">
                HH GOA <span className="font-mono text-sm text-hot-pink font-bold ml-1">2026</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-hot-pink text-white font-sans text-[11px] font-extrabold uppercase border border-black shadow-sm">
                #FrameInGoa
              </span>
            </div>
            <p className="text-[11px] font-mono text-cream/70 hidden md:block">
              28 – 31 OCT 2026 • GOA, INDIA • 2:47 PM STUDIO
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenExamples}
            className="px-3 py-1.5 rounded-lg bg-cream/10 hover:bg-cream/20 text-cream font-mono text-xs font-bold border border-cream/30 flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-hh-yellow" />
            <span>See Examples</span>
          </button>

          <a
            href="https://hhgoa.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-starburst text-xs px-4 py-2 rounded-lg flex items-center gap-1"
          >
            <span>APPLY</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </header>
  );
};
