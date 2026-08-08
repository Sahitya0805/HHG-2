import React from 'react';
import { GeneratorFormat } from '../types';
import { CreditCard, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface FormatSelectorProps {
  selectedFormat: GeneratorFormat;
  onSelectFormat: (format: GeneratorFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onSelectFormat,
}) => {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <span className="font-mono text-xs font-bold text-hh-yellow uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-hh-yellow/30">
          Step 1 • Choose Format
        </span>
        <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-cream mt-2">
          Select Your Graphic Type
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Format B Option Card: Builder ID Card */}
        <div
          onClick={() => onSelectFormat('id_card')}
          className={`cursor-pointer rounded-2xl p-6 border-3 transition-all relative overflow-hidden ${
            selectedFormat === 'id_card'
              ? 'bg-cream-card text-black border-black shadow-neo-lg ring-4 ring-hh-yellow'
              : 'bg-goa-green-dark/80 text-cream border-cream/20 hover:border-hh-yellow hover:bg-goa-green-dark'
          }`}
        >
          {/* Recommended Tag */}
          <div className="absolute top-3 right-3 bg-hot-pink text-white font-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border border-black shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>High Value & Popular</span>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl border-2 border-black shrink-0 ${
                selectedFormat === 'id_card'
                  ? 'bg-hh-yellow text-black'
                  : 'bg-cream/10 text-hh-yellow'
              }`}
            >
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl">Builder ID Card</h3>
                {selectedFormat === 'id_card' && (
                  <CheckCircle2 className="w-5 h-5 text-goa-green fill-hh-yellow" />
                )}
              </div>
              <p className="text-xs font-sans mt-1 opacity-90 leading-relaxed">
                Create your official HH Goa 2026 builder identity card with your photo, name, stack, and generated builder class title.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-current/15 flex items-center justify-between font-mono text-xs font-bold">
            <span className="opacity-75">Format B • Social Event Card</span>
            <button
              className={`px-4 py-1.5 rounded-lg border border-black font-bold transition-transform ${
                selectedFormat === 'id_card' ? 'bg-hh-yellow text-black shadow-neo' : 'bg-cream/20 text-cream'
              }`}
            >
              Select ID Card
            </button>
          </div>
        </div>

        {/* Format A Option Card: Profile Frame Overlay */}
        <div
          onClick={() => onSelectFormat('pfp_frame')}
          className={`cursor-pointer rounded-2xl p-6 border-3 transition-all relative overflow-hidden ${
            selectedFormat === 'pfp_frame'
              ? 'bg-cream-card text-black border-black shadow-neo-lg ring-4 ring-hh-yellow'
              : 'bg-goa-green-dark/80 text-cream border-cream/20 hover:border-hh-yellow hover:bg-goa-green-dark'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-xl border-2 border-black shrink-0 ${
                selectedFormat === 'pfp_frame'
                  ? 'bg-hot-pink text-white'
                  : 'bg-cream/10 text-hot-pink'
              }`}
            >
              <UserCheck className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-xl">Goa Profile Frame</h3>
                {selectedFormat === 'pfp_frame' && (
                  <CheckCircle2 className="w-5 h-5 text-goa-green fill-hot-pink" />
                )}
              </div>
              <p className="text-xs font-sans mt-1 opacity-90 leading-relaxed">
                Turn your profile photo into an HH Goa 2026 branded avatar. Circular & social-friendly wrap frame around your image.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-current/15 flex items-center justify-between font-mono text-xs font-bold">
            <span className="opacity-75">Format A • Profile Avatar</span>
            <button
              className={`px-4 py-1.5 rounded-lg border border-black font-bold transition-transform ${
                selectedFormat === 'pfp_frame' ? 'bg-hot-pink text-white shadow-neo' : 'bg-cream/20 text-cream'
              }`}
            >
              Select Frame
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
