import React, { useState, useEffect, useRef } from 'react';
import { GeneratorFormat, BuilderDetails, PhotoData, ImageAdjustment } from './types';
import { generateCanvasGraphic } from './utils/canvasGenerator';
import { getRandomBuilderTitle } from './data/builderTitles';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FormatSelector } from './components/FormatSelector';
import { PhotoUploader } from './components/PhotoUploader';
import { BuilderForm } from './components/BuilderForm';
import { CanvasAdjuster } from './components/CanvasAdjuster';
import { ResultScreen } from './components/ResultScreen';
import { ExamplesModal } from './components/ExamplesModal';
import { Footer } from './components/Footer';

import { Sparkles, Palmtree, ArrowRight, Wand2, Loader2, CheckCircle2, SlidersHorizontal } from 'lucide-react';

export const App: React.FC = () => {
  // Application state
  const [format, setFormat] = useState<GeneratorFormat>('id_card');
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  
  const [details, setDetails] = useState<BuilderDetails>({
    name: 'Sahitya Singh',
    role: 'Full Stack Developer',
    title: '🌴 Pixel Surfer',
    theme: 'emerald',
    framePreset: 'classic_palm',
  });

  const [adjustment, setAdjustment] = useState<ImageAdjustment>({
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);

  const [isExamplesOpen, setIsExamplesOpen] = useState(false);

  // Hidden Canvas Ref for high DPI output
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generatorRef = useRef<HTMLDivElement | null>(null);

  // Scroll to studio generator
  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Re-render canvas preview in real time whenever details/adjustments/photo changes
  useEffect(() => {
    if (canvasRef.current) {
      generateCanvasGraphic(
        canvasRef.current,
        format,
        details,
        photoData ? photoData.imageElement : null,
        adjustment
      );
    }
  }, [format, details, photoData, adjustment]);

  // Handle Form Details update
  const handleUpdateDetails = (updated: Partial<BuilderDetails>) => {
    setDetails((prev) => ({ ...prev, ...updated }));
  };

  // Handle Adjustment update
  const handleUpdateAdjustment = (updated: Partial<ImageAdjustment>) => {
    setAdjustment((prev) => ({ ...prev, ...updated }));
  };

  const handleResetAdjustment = () => {
    setAdjustment({
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
    });
  };

  // Trigger high resolution generation and switch to Result Screen
  const handleGenerateGraphic = () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);

    // Short processing delay (< 1 second) for crisp UX state transition
    setTimeout(() => {
      if (canvasRef.current) {
        // Render final graphic canvas
        generateCanvasGraphic(
          canvasRef.current,
          format,
          details,
          photoData ? photoData.imageElement : null,
          adjustment
        );

        // Convert canvas to Data URL and Blob
        const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
        setGeneratedDataUrl(dataUrl);

        canvasRef.current.toBlob(
          (blob) => {
            setGeneratedBlob(blob);
            setIsGenerating(false);
            setIsGenerated(true);

            // Scroll result into view
            window.scrollTo({ top: generatorRef.current?.offsetTop || 400, behavior: 'smooth' });
          },
          'image/png',
          1.0
        );
      } else {
        setIsGenerating(false);
      }
    }, 600);
  };

  // Preset selection from Examples gallery
  const handleSelectExamplePreset = (
    presetFormat: GeneratorFormat,
    name: string,
    role: string,
    title: string
  ) => {
    setFormat(presetFormat);
    setDetails((prev) => ({
      ...prev,
      name,
      role,
      title,
    }));
    scrollToGenerator();
  };

  return (
    <div className="min-h-screen bg-goa-pattern text-cream font-sans flex flex-col">
      
      {/* Sticky Navigation */}
      <Navbar onOpenExamples={() => setIsExamplesOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onStart={scrollToGenerator}
          onOpenExamples={() => setIsExamplesOpen(true)}
        />

        {/* Generator Studio Area */}
        <section ref={generatorRef} className="py-10 px-4 max-w-7xl mx-auto">
          
          {/* Format Selector */}
          <FormatSelector
            selectedFormat={format}
            onSelectFormat={(newFormat) => {
              setFormat(newFormat);
              setIsGenerated(false);
            }}
          />

          {/* Generated Result Screen View */}
          {isGenerated ? (
            <ResultScreen
              imageBlob={generatedBlob}
              dataUrl={generatedDataUrl}
              name={details.name}
              format={format}
              onReset={() => setIsGenerated(false)}
            />
          ) : (
            /* Split Interactive Studio Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Controls & Upload */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Photo Upload Zone */}
                <PhotoUploader
                  photoData={photoData}
                  onPhotoUploaded={(data) => setPhotoData(data)}
                  onRemovePhoto={() => setPhotoData(null)}
                />

                {/* Photo Position Fine-Tuning */}
                {photoData && (
                  <CanvasAdjuster
                    adjustment={adjustment}
                    onChangeAdjustment={handleUpdateAdjustment}
                    onReset={handleResetAdjustment}
                  />
                )}

                {/* Details Form (Format B Builder ID Card details) */}
                {format === 'id_card' && (
                  <BuilderForm
                    details={details}
                    onChangeDetails={handleUpdateDetails}
                  />
                )}

                {/* Generate CTA Action Button */}
                <div className="pt-2">
                  <button
                    onClick={handleGenerateGraphic}
                    disabled={isGenerating}
                    className="w-full btn-starburst text-lg py-4 rounded-2xl flex items-center justify-center gap-3 font-extrabold shadow-neo-lg disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 text-hot-pink animate-spin" />
                        <span>Creating Your Goa Identity...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 text-hot-pink" />
                        <span>
                          {format === 'id_card'
                            ? 'Generate My HH Goa Builder ID'
                            : 'Generate My Goa Profile Frame'}
                        </span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <p className="text-center font-mono text-[11px] text-cream/70 mt-2">
                    ⚡ Near-instant generation ({'< 1 sec'}) • High-Res PNG Output
                  </p>
                </div>

              </div>

              {/* Right Column: Live Interactive Canvas Preview */}
              <div className="lg:col-span-5 lg:sticky lg:top-20">
                <div className="bg-goa-green-dark border-3 border-black p-5 rounded-3xl shadow-neo-lg text-center">
                  
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="font-mono text-xs font-bold text-hh-yellow uppercase tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Live Canvas Preview</span>
                    </span>
                    <span className="bg-hot-pink text-white font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-black">
                      Real-Time
                    </span>
                  </div>

                  {/* Canvas Container */}
                  <div className="relative overflow-hidden rounded-2xl border-3 border-black shadow-neo bg-black inline-block max-w-full">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto max-h-[550px] object-contain block mx-auto bg-white"
                    />
                  </div>

                  <p className="text-[11px] font-mono text-cream/70 mt-3">
                    Preview updates automatically as you type or adjust your photo!
                  </p>
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* Inspiration Examples Modal */}
      <ExamplesModal
        isOpen={isExamplesOpen}
        onClose={() => setIsExamplesOpen(false)}
        onSelectPreset={handleSelectExamplePreset}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
};
