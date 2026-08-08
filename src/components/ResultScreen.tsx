import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, Share2, Copy, Check, Sparkles, RefreshCw, Palmtree } from 'lucide-react';
import { GeneratorFormat } from '../types';

interface ResultScreenProps {
  imageBlob: Blob | null;
  dataUrl: string | null;
  name: string;
  format: GeneratorFormat;
  onReset: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  imageBlob,
  dataUrl,
  name,
  format,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(true);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD400', '#FF087C', '#08733F', '#FFFFFF'],
      });
    } catch (e) {
      // Ignore if confetti fails
    }
  }, []);

  // Format safe filename
  const getFilename = () => {
    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return cleanName ? `hhgoa-2026-${cleanName}.png` : 'hhgoa-2026-builder.png';
  };

  // Download PNG file
  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy PNG image to clipboard if supported by browser
  const handleCopyImage = async () => {
    if (!imageBlob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': imageBlob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        setClipboardSupported(false);
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      // Fallback: download directly
      handleDownload();
    }
  };

  // Share to X post with mandatory hashtag #FrameInGoa
  const handleShareX = () => {
    const formatName = format === 'id_card' ? 'Builder ID' : 'Profile Frame';
    const text = `Just got my HH Goa 2026 ${formatName} 🌴💻\n\nReady to build in Goa.\n\n#FrameInGoa #HHGoa26`;
    const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-goa-green-dark border-3 border-black p-6 sm:p-8 rounded-3xl shadow-neo-lg text-center max-w-3xl mx-auto my-6 animate-fade-in">
      {/* Top Ready Pill */}
      <div className="inline-flex items-center gap-2 bg-hh-yellow text-black border-2 border-black px-4 py-1.5 rounded-full shadow-neo mb-4">
        <Palmtree className="w-4 h-4 animate-bounce" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">
          Your HH Goa Identity is Ready!
        </span>
      </div>

      <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-cream mb-2">
        Showcase Your Goa Persona 🌴
      </h2>

      {/* Mandatory Hashtag Alert Banner */}
      <div className="bg-hot-pink/90 text-white border-2 border-black p-3 rounded-xl shadow-neo max-w-md mx-auto mb-6 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 shrink-0 text-hh-yellow" />
        <span className="font-mono text-xs font-bold">
          Posting on X? Make sure to include <strong className="text-hh-yellow underline">#FrameInGoa</strong>
        </span>
      </div>

      {/* Dominant Generated Image Display */}
      {dataUrl ? (
        <div className="relative inline-block max-w-full my-2 group">
          <img
            src={dataUrl}
            alt="HH Goa 2026 Generated Graphic"
            className="max-h-[600px] w-auto mx-auto rounded-2xl border-4 border-black shadow-neo-lg bg-white object-contain"
          />
          <div className="absolute top-3 right-3 bg-black/80 text-hh-yellow text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border border-hh-yellow/40 backdrop-blur-sm">
            High DPI PNG
          </div>
        </div>
      ) : (
        <div className="p-12 text-cream font-mono text-sm">Rendering image...</div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto btn-starburst text-base px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Download PNG</span>
        </button>

        {/* Share to X Button */}
        <button
          onClick={handleShareX}
          className="w-full sm:w-auto btn-pink text-base px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          {/* X logo SVG */}
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>Share to X</span>
        </button>

        {/* Copy Image Button */}
        <button
          onClick={handleCopyImage}
          className="w-full sm:w-auto px-5 py-3.5 bg-cream text-black border-2 border-black rounded-xl font-mono text-sm font-bold shadow-neo hover:bg-cream-dark flex items-center justify-center gap-2 transition-transform"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-goa-green" />
              <span>Copied Image!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Image</span>
            </>
          )}
        </button>
      </div>

      {/* Create Another Button */}
      <div className="mt-8 pt-6 border-t border-cream/20">
        <button
          onClick={onReset}
          className="text-xs font-mono text-cream/80 hover:text-hh-yellow font-bold uppercase tracking-wider underline flex items-center justify-center gap-1.5 mx-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Create Another Frame / ID Card</span>
        </button>
      </div>
    </div>
  );
};
