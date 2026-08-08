import React from 'react';
import { ImageAdjustment } from '../types';
import { Sliders, ZoomIn, Move, RotateCcw } from 'lucide-react';

interface CanvasAdjusterProps {
  adjustment: ImageAdjustment;
  onChangeAdjustment: (updated: Partial<ImageAdjustment>) => void;
  onReset: () => void;
}

export const CanvasAdjuster: React.FC<CanvasAdjusterProps> = ({
  adjustment,
  onChangeAdjustment,
  onReset,
}) => {
  return (
    <div className="bg-cream-card text-black border-2 border-black p-4 rounded-xl shadow-neo mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs font-bold uppercase text-goa-green flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-hot-pink" />
          <span>Fine-Tune Photo Positioning</span>
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-mono text-gray-600 hover:text-black hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Position</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Zoom Slider */}
        <div>
          <label className="text-[11px] font-mono font-bold text-gray-700 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <ZoomIn className="w-3 h-3" /> Zoom
            </span>
            <span>{Math.round(adjustment.zoom * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={adjustment.zoom}
            onChange={(e) => onChangeAdjustment({ zoom: parseFloat(e.target.value) })}
            className="w-full accent-hot-pink cursor-pointer"
          />
        </div>

        {/* Pan Horizontal */}
        <div>
          <label className="text-[11px] font-mono font-bold text-gray-700 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3" /> Pan X
            </span>
            <span>{adjustment.offsetX}px</span>
          </label>
          <input
            type="range"
            min="-200"
            max="200"
            step="5"
            value={adjustment.offsetX}
            onChange={(e) => onChangeAdjustment({ offsetX: parseInt(e.target.value) })}
            className="w-full accent-goa-green cursor-pointer"
          />
        </div>

        {/* Pan Vertical */}
        <div>
          <label className="text-[11px] font-mono font-bold text-gray-700 flex items-center justify-between mb-1">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 rotate-90" /> Pan Y
            </span>
            <span>{adjustment.offsetY}px</span>
          </label>
          <input
            type="range"
            min="-200"
            max="200"
            step="5"
            value={adjustment.offsetY}
            onChange={(e) => onChangeAdjustment({ offsetY: parseInt(e.target.value) })}
            className="w-full accent-goa-green cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
