import React from 'react';
import { Palmtree, ArrowRight, Sparkles, ShieldCheck, Zap, Share2 } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onOpenExamples: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onOpenExamples }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-16 lg:pb-20 bg-goa-pattern border-b-2 border-black">
      {/* Decorative floating badges */}
      <div className="absolute top-8 left-4 lg:left-12 animate-float-slow hidden sm:block">
        <div className="bg-hh-yellow border-2 border-black text-black font-mono text-xs font-bold px-3 py-1 rounded-full shadow-neo flex items-center gap-1.5 rotate-[-6deg]">
          <span>🌴 GOA 2026</span>
        </div>
      </div>

      <div className="absolute top-12 right-6 lg:right-16 animate-float-slow hidden sm:block" style={{ animationDelay: '1.5s' }}>
        <div className="bg-hot-pink border-2 border-black text-white font-mono text-xs font-bold px-3 py-1 rounded-full shadow-neo flex items-center gap-1.5 rotate-[8deg]">
          <span>⚡ #FrameInGoa</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 bg-cream-card border-2 border-black text-black px-4 py-1.5 rounded-full shadow-neo mb-6">
          <Sparkles className="w-4 h-4 text-hot-pink animate-spin-slow" />
          <span className="font-mono text-xs lg:text-sm font-bold uppercase tracking-wider">
            Official HH Goa 2026 Social Identity Tool
          </span>
        </div>

        {/* Main Display Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-cream tracking-tight leading-[1.1] mb-4">
          HH GOA 2026 <br />
          <span className="text-hh-yellow underline decoration-hot-pink decoration-4 underline-offset-8">
            Build your frame.
          </span>{' '}
          <span className="font-serif italic font-normal text-white">Show your Goa.</span>
        </h1>

        {/* Script Overlay Accent */}
        <div className="inline-block relative mb-6">
          <span className="bg-hot-pink text-white font-sans text-xl lg:text-2xl font-extrabold px-4 py-1 rounded-xl border-2 border-black shadow-neo transform -rotate-3 inline-block">
            गोवा 🌴 28–31 OCT 2026
          </span>
        </div>

        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto font-sans text-base sm:text-lg text-cream/90 font-medium leading-relaxed mb-8">
          Create your HH Goa 2026 builder identity card or profile picture frame in seconds. Share your hacker persona with the community on X!
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={onStart}
            className="w-full sm:w-auto btn-starburst text-base sm:text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold group"
          >
            <span>Create My Frame</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenExamples}
            className="w-full sm:w-auto btn-pink text-base sm:text-lg px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
          >
            <Sparkles className="w-5 h-5" />
            <span>See Examples</span>
          </button>
        </div>

        {/* Value Props Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t-2 border-black/30">
          <div className="bg-cream-card/95 border-2 border-black p-4 rounded-xl shadow-neo text-black text-left flex items-start gap-3">
            <div className="p-2 bg-hh-yellow border border-black rounded-lg shrink-0">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider">Instant & Local</h4>
              <p className="text-xs text-gray-700 font-medium">Generates client-side in under 1 second. No login or signup required.</p>
            </div>
          </div>

          <div className="bg-cream-card/95 border-2 border-black p-4 rounded-xl shadow-neo text-black text-left flex items-start gap-3">
            <div className="p-2 bg-hot-pink text-white border border-black rounded-lg shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider">Social Ready</h4>
              <p className="text-xs text-gray-700 font-medium">1-Click Share to X pre-filled with mandatory #FrameInGoa hashtag.</p>
            </div>
          </div>

          <div className="bg-cream-card/95 border-2 border-black p-4 rounded-xl shadow-neo text-black text-left flex items-start gap-3">
            <div className="p-2 bg-goa-green text-white border border-black rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider">Smart Auto-Crop</h4>
              <p className="text-xs text-gray-700 font-medium">Handles portrait, landscape & HEIC iPhone photos automatically.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
