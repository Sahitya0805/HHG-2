import React from 'react';
import { X, Sparkles, Palmtree, UserCheck, CreditCard } from 'lucide-react';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (format: 'id_card' | 'pfp_frame', name: string, role: string, title: string) => void;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const sampleCards = [
    {
      format: 'id_card' as const,
      name: 'Sahitya Singh',
      role: 'Full Stack Developer',
      title: '🌴 Pixel Surfer',
      theme: 'Emerald Green',
      badge: 'Goa Hacker Pass',
    },
    {
      format: 'id_card' as const,
      name: 'Ananya Sharma',
      role: 'Backend Systems Engineer',
      title: '💻 Beach Code Hacker',
      theme: 'Sunset Gold',
      badge: 'Systems Specialist',
    },
    {
      format: 'id_card' as const,
      name: 'Dev Rohan',
      role: 'Smart Contract Dev',
      title: '🌊 Rust Wave Rider',
      theme: 'Cyber Pink',
      badge: 'Solana Shack',
    },
    {
      format: 'pfp_frame' as const,
      name: 'Alex Rivera',
      role: 'Frontend Wizard',
      title: '🏄 Full Stack Surfer',
      theme: 'Classic Palm',
      badge: 'PFP Overlay',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream-card text-black border-3 border-black rounded-3xl p-6 lg:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-neo-lg relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-cream hover:bg-hot-pink hover:text-white rounded-full border-2 border-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-hh-yellow border border-black rounded-lg">
            <Palmtree className="w-5 h-5 text-black" />
          </div>
          <span className="font-mono text-xs font-bold text-goa-green uppercase tracking-wider">
            HH Goa 2026 Inspiration Gallery
          </span>
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-black mb-4">
          Community Examples
        </h2>

        <p className="text-xs sm:text-sm font-sans text-gray-700 mb-6">
          Check out how your HH Goa identity card or profile avatar will look when generated! Click any example to pre-fill your form.
        </p>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleCards.map((sample, idx) => (
            <div
              key={idx}
              className="bg-cream p-4 rounded-2xl border-2 border-black shadow-neo hover:scale-[1.02] transition-transform text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-hh-yellow border border-black text-black">
                  {sample.badge}
                </span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-gray-500 font-bold">
                  {sample.format === 'id_card' ? (
                    <CreditCard className="w-3.5 h-3.5 text-goa-green" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-hot-pink" />
                  )}
                  <span>{sample.format === 'id_card' ? 'ID Card' : 'Profile Frame'}</span>
                </div>
              </div>

              {/* Sample Card Graphic Representation */}
              <div className="bg-goa-green p-4 rounded-xl border border-black text-cream text-center mb-3">
                <div className="w-16 h-16 bg-cream border-2 border-black rounded-full mx-auto flex items-center justify-center text-black font-display font-bold text-xl shadow-sm mb-2">
                  {sample.name[0]}
                </div>
                <h4 className="font-serif font-bold text-lg text-hh-yellow">{sample.name}</h4>
                <p className="font-mono text-[11px] text-cream/90">{sample.role}</p>
                <div className="mt-2 bg-hot-pink text-white font-sans text-xs font-bold px-2 py-1 rounded border border-black inline-block">
                  "{sample.title}"
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectPreset(sample.format, sample.name, sample.role, sample.title);
                  onClose();
                }}
                className="w-full btn-starburst text-xs py-2 rounded-lg font-mono font-bold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-hot-pink" />
                <span>Use This Style</span>
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-black/10 text-center font-mono text-xs text-gray-600">
          HH Goa 2026 • 28–31 Oct 2026 • #FrameInGoa
        </div>

      </div>
    </div>
  );
};
