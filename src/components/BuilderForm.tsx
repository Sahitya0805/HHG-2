import React from 'react';
import { BuilderDetails, CardTheme } from '../types';
import { getRandomBuilderTitle, POPULAR_ROLES } from '../data/builderTitles';
import { Wand2, User, Code2, Sparkles, Palette } from 'lucide-react';

interface BuilderFormProps {
  details: BuilderDetails;
  onChangeDetails: (updated: Partial<BuilderDetails>) => void;
}

export const BuilderForm: React.FC<BuilderFormProps> = ({
  details,
  onChangeDetails,
}) => {
  const handleGenerateTitle = () => {
    const newTitle = getRandomBuilderTitle();
    onChangeDetails({ title: newTitle });
  };

  return (
    <div className="bg-cream-card text-black border-2 border-black p-6 rounded-2xl shadow-neo mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-goa-green flex items-center gap-1.5">
          <User className="w-4 h-4 text-hot-pink" />
          <span>Step 3 • Enter Identity Details</span>
        </label>
        <span className="text-[11px] font-mono text-gray-500">Live Preview Updates</span>
      </div>

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase mb-1 text-gray-800">
            What's your name? <span className="text-hot-pink">*</span>
          </label>
          <input
            type="text"
            value={details.name}
            onChange={(e) => onChangeDetails({ name: e.target.value })}
            placeholder="e.g. Sahitya Singh"
            className="w-full px-3.5 py-2.5 bg-cream border-2 border-black rounded-xl font-sans text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-hot-pink shadow-sm"
          />
        </div>

        {/* Stack / Role Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono font-bold uppercase text-gray-800">
              Stack / Role <span className="text-hot-pink">*</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {POPULAR_ROLES.slice(0, 3).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onChangeDetails({ role: r })}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-cream border border-black/30 hover:border-black hover:bg-hh-yellow text-gray-700"
                >
                  {r.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={details.role}
              onChange={(e) => onChangeDetails({ role: e.target.value })}
              placeholder="e.g. Full Stack Developer"
              className="w-full px-3.5 py-2.5 bg-cream border-2 border-black rounded-xl font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-hot-pink shadow-sm"
            />
          </div>
        </div>

        {/* Builder Title Field + Generator Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono font-bold uppercase text-gray-800">
              Your Builder Title <span className="text-hot-pink">*</span>
            </label>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={details.title}
              onChange={(e) => onChangeDetails({ title: e.target.value })}
              placeholder="e.g. 🌴 Pixel Surfer"
              className="flex-1 px-3.5 py-2.5 bg-cream border-2 border-black rounded-xl font-sans text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-hot-pink shadow-sm"
            />

            <button
              type="button"
              onClick={handleGenerateTitle}
              className="btn-starburst text-xs px-3.5 py-2.5 rounded-xl font-mono font-bold flex items-center gap-1.5 shrink-0"
              title="Generate a random Goa Builder title"
            >
              <Wand2 className="w-4 h-4 text-hot-pink" />
              <span className="hidden sm:inline">✨ Generate Title</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        </div>

        {/* Badge Theme Options */}
        <div className="pt-2">
          <label className="block text-xs font-mono font-bold uppercase mb-2 text-gray-800 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-goa-green" />
            <span>Card Theme Style</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'emerald', label: 'Goa Green', color: 'bg-[#08733F]' },
              { id: 'sunset', label: 'Sunset Gold', color: 'bg-[#7C1C08]' },
              { id: 'cyber', label: 'Cyber Pink', color: 'bg-[#1A0826]' },
              { id: 'retro', label: 'Retro Pass', color: 'bg-[#1E3A2B]' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeDetails({ theme: t.id as CardTheme })}
                className={`px-2.5 py-2 rounded-xl border-2 border-black text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                  details.theme === t.id
                    ? 'bg-hh-yellow text-black shadow-neo font-extrabold'
                    : 'bg-cream text-gray-800 hover:bg-cream-dark'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border border-black ${t.color}`} />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
