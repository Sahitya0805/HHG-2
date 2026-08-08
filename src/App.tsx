import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Palmtree, Upload, Download, Share2, Wand2, Sparkles, RefreshCw, Check, Copy } from 'lucide-react';
import { FormatType, CardData, renderCanvas } from './utils/canvas';
import { loadPhotoFile, LoadedPhoto } from './utils/heic';

const TITLES = [
  '🌴 Pixel Surfer',
  '🥥 Code Coconut',
  '💻 Beach Code Hacker',
  '🏄 Full Stack Surfer',
  '⛵ Debugging Nomad',
  '🧙 Goa Code Wizard',
  '🏴‍☠️ Product Pirate',
  '🌊 Rust Wave Rider',
  '⚡ Async Anjuna Hacker',
];

export const App: React.FC = () => {
  const [format, setFormat] = useState<FormatType>('id_card');
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);

  const [data, setData] = useState<CardData>({
    name: 'Sahitya Singh',
    role: 'Full Stack Developer',
    title: '🌴 Pixel Surfer',
    theme: 'emerald',
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Render canvas in real-time
  useEffect(() => {
    if (canvasRef.current) {
      renderCanvas(canvasRef.current, format, data, photo ? photo.imageElement : null);
    }
  }, [format, data, photo]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const loaded = await loadPhotoFile(file);
      setPhoto(loaded);
    } catch (err: any) {
      alert(err.message || 'Error loading image');
    }
  };

  // Generate Title
  const handleRandomTitle = () => {
    const random = TITLES[Math.floor(Math.random() * TITLES.length)];
    setData((prev) => ({ ...prev, title: random }));
  };

  // Generate PNG
  const handleGenerate = () => {
    if (!canvasRef.current) return;
    renderCanvas(canvasRef.current, format, data, photo ? photo.imageElement : null);

    const url = canvasRef.current.toDataURL('image/png');
    setDataUrl(url);

    canvasRef.current.toBlob((b) => {
      setBlob(b);
      setIsGenerated(true);
      try {
        confetti({ particleCount: 70, spread: 60, colors: ['#FFD400', '#FF087C', '#08733F'] });
      } catch (e) {}
    }, 'image/png');
  };

  // Download PNG
  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `hhgoa-2026-${(data.name || 'builder').toLowerCase().replace(/\s+/g, '-')}.png`;
    a.click();
  };

  // Share to X
  const handleShareX = () => {
    const text = `Just got my HH Goa 2026 Builder Card 🌴💻\n\nReady to build in Goa.\n\n#FrameInGoa #HHGoa26`;
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy to Clipboard
  const handleCopy = async () => {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      handleDownload();
    }
  };

  return (
    <div className="min-h-screen bg-goa-green text-cream font-sans pb-12">
      {/* Header */}
      <header className="bg-goa-green-dark border-b-2 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-hh-yellow border-2 border-black rounded-xl flex items-center justify-center text-black shadow-neo">
            <Palmtree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-xl text-hh-yellow">HH GOA 2026</h1>
            <p className="font-mono text-xs text-cream/70">28–31 OCT 2026 • GOA, INDIA</p>
          </div>
        </div>

        <div className="bg-hot-pink text-white font-mono text-xs font-bold px-3 py-1 rounded-full border border-black shadow-sm">
          #FrameInGoa
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* Format Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => { setFormat('id_card'); setIsGenerated(false); }}
            className={`px-6 py-3 rounded-xl font-mono text-xs font-bold border-2 border-black shadow-neo transition-all ${
              format === 'id_card' ? 'bg-hh-yellow text-black' : 'bg-goa-green-dark text-cream'
            }`}
          >
            🪪 Option B: Builder ID Card
          </button>

          <button
            onClick={() => { setFormat('pfp_frame'); setIsGenerated(false); }}
            className={`px-6 py-3 rounded-xl font-mono text-xs font-bold border-2 border-black shadow-neo transition-all ${
              format === 'pfp_frame' ? 'bg-hot-pink text-white' : 'bg-goa-green-dark text-cream'
            }`}
          >
            🌴 Option A: Profile Frame
          </button>
        </div>

        {/* Generated Screen Result View */}
        {isGenerated && dataUrl ? (
          <div className="bg-goa-green-dark border-3 border-black p-6 rounded-3xl shadow-neo max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl font-bold text-hh-yellow mb-1">Your Identity Graphic is Ready! 🌴</h2>
            <p className="font-mono text-xs text-hot-pink font-bold mb-4">Post on X with hashtag #FrameInGoa</p>

            <img src={dataUrl} alt="HH Goa Graphic" className="max-h-[500px] mx-auto rounded-2xl border-2 border-black shadow-neo mb-6" />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={handleDownload} className="btn-starburst px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Download PNG
              </button>

              <button onClick={handleShareX} className="btn-pink px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share to X
              </button>

              <button onClick={handleCopy} className="px-5 py-3 bg-cream text-black border-2 border-black rounded-xl font-mono text-xs font-bold shadow-neo">
                {copied ? <><Check className="w-4 h-4 inline text-goa-green" /> Copied!</> : <><Copy className="w-4 h-4 inline" /> Copy Image</>}
              </button>
            </div>

            <button onClick={() => setIsGenerated(false)} className="mt-6 text-xs font-mono underline text-cream/70 hover:text-hh-yellow flex items-center gap-1 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" /> Edit / Create Another
            </button>
          </div>
        ) : (
          /* Split Studio Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Controls Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Photo Upload Box */}
              <div className="bg-cream-card text-black p-6 rounded-2xl border-2 border-black shadow-neo">
                <label className="block font-mono text-xs font-bold uppercase text-goa-green mb-3">
                  1. Upload Photo (JPG, PNG, HEIC)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,.heic"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-black/40 rounded-xl bg-cream hover:bg-hh-yellow/20 flex flex-col items-center justify-center gap-2 transition-all"
                >
                  <Upload className="w-6 h-6 text-hot-pink" />
                  <span className="font-mono text-xs font-bold text-black">
                    {photo ? 'Photo Loaded! (Click to Change)' : 'Choose or Drag Photo Here'}
                  </span>
                </button>
              </div>

              {/* Identity Details Box (Format B) */}
              {format === 'id_card' && (
                <div className="bg-cream-card text-black p-6 rounded-2xl border-2 border-black shadow-neo space-y-4">
                  <label className="block font-mono text-xs font-bold uppercase text-goa-green">
                    2. Enter Builder Information
                  </label>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sahitya Singh"
                      className="w-full px-3.5 py-2 bg-cream border-2 border-black rounded-xl font-sans text-sm font-bold text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 mb-1">Stack / Role</label>
                    <input
                      type="text"
                      value={data.role}
                      onChange={(e) => setData((prev) => ({ ...prev, role: e.target.value }))}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-3.5 py-2 bg-cream border-2 border-black rounded-xl font-mono text-xs font-bold text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-gray-700 mb-1">Builder Title</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                        className="flex-1 px-3.5 py-2 bg-cream border-2 border-black rounded-xl font-sans text-sm font-bold text-black focus:outline-none"
                      />
                      <button
                        onClick={handleRandomTitle}
                        className="btn-starburst px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-hot-pink" /> Title
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Action Button */}
              <button
                onClick={handleGenerate}
                className="w-full btn-starburst text-lg py-4 rounded-2xl flex items-center justify-center gap-2 font-extrabold shadow-neo"
              >
                <Sparkles className="w-5 h-5 text-hot-pink" />
                <span>Generate Graphic</span>
              </button>

            </div>

            {/* Right Live Canvas Preview Column */}
            <div className="lg:col-span-6 lg:sticky lg:top-24">
              <div className="bg-goa-green-dark border-3 border-black p-4 rounded-3xl shadow-neo text-center">
                <span className="font-mono text-xs font-bold text-hh-yellow uppercase block mb-3">
                  Live Preview
                </span>
                <div className="rounded-2xl border-2 border-black overflow-hidden bg-black inline-block max-w-full">
                  <canvas ref={canvasRef} className="w-full h-auto max-h-[500px] object-contain block mx-auto bg-white" />
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
