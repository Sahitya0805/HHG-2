import React, { useState, useRef } from 'react';
import { PhotoData } from '../types';
import { processUploadedFile } from '../utils/imageLoader';
import { Upload, Image as ImageIcon, Camera, RefreshCw, CheckCircle, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  photoData: PhotoData | null;
  onPhotoUploaded: (data: PhotoData) => void;
  onRemovePhoto: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoData,
  onPhotoUploaded,
  onRemovePhoto,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const processed = await processUploadedFile(file);
      onPhotoUploaded(processed);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing photo. Please upload a valid JPG, PNG, or HEIC image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-cream-card text-black border-2 border-black p-6 rounded-2xl shadow-neo mb-6">
      <div className="flex items-center justify-between mb-4">
        <label className="font-mono text-xs font-bold uppercase tracking-wider text-goa-green flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-hot-pink" />
          <span>Step 2 • Upload Photo</span>
        </label>
        <span className="text-[11px] font-mono font-bold text-gray-500">
          JPG • PNG • HEIC
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="border-2 border-dashed border-black bg-hh-yellow/10 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-hot-pink animate-spin" />
          <p className="font-mono text-sm font-bold text-black">Processing photo & converting HEIC...</p>
        </div>
      )}

      {/* Photo Loaded State */}
      {!isLoading && photoData && photoData.previewUrl && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-cream p-4 rounded-xl border border-black/20">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-black overflow-hidden shadow-neo shrink-0 bg-white">
            <img
              src={photoData.previewUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 bg-goa-green text-white p-1 rounded-full border border-black">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h4 className="font-display font-bold text-base text-black flex items-center justify-center sm:justify-start gap-1.5">
              <span>Photo Ready!</span>
              {photoData.isHeic && (
                <span className="bg-hot-pink text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-black">
                  HEIC Converted
                </span>
              )}
            </h4>
            <p className="text-xs font-mono text-gray-600 mt-1">
              Dimensions: {photoData.width} × {photoData.height} px
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-hh-yellow text-black border border-black rounded-lg text-xs font-mono font-bold shadow-neo hover:bg-hh-yellow-hover flex items-center gap-1 transition-transform"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>

              <button
                type="button"
                onClick={onRemovePhoto}
                className="px-3 py-1.5 bg-gray-200 text-gray-800 border border-black rounded-lg text-xs font-mono font-bold hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Drop Zone */}
      {!isLoading && !photoData && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-3 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-hot-pink bg-hot-pink/10 scale-[1.01]'
              : 'border-black/30 hover:border-black bg-cream hover:bg-hh-yellow/10'
          }`}
        >
          <div className="w-14 h-14 bg-hh-yellow border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-neo">
            <Upload className="w-7 h-7 text-black" />
          </div>

          <h4 className="font-display font-bold text-lg text-black">
            Upload your photo
          </h4>
          <p className="text-xs font-sans text-gray-600 mt-1 mb-4">
            Drag & drop here, or tap to choose from your gallery / camera
          </p>

          <button
            type="button"
            className="btn-starburst text-xs px-5 py-2.5 rounded-lg font-mono uppercase tracking-wider inline-flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Choose Photo</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Privacy Note */}
      <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-center gap-1.5 text-[11px] font-mono text-gray-600">
        <ShieldCheck className="w-3.5 h-3.5 text-goa-green" />
        <span>Your photo is processed locally in your browser and is never uploaded to any server.</span>
      </div>
    </div>
  );
};
