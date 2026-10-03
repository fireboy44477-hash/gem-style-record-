import React, { useState, useRef } from 'react';
import { GemstoneItem } from '../types/gem';
import { GEM_SPECIMEN_IMAGES } from '../assets/gemImages';
import { Camera, Upload, Image as ImageIcon, X, Check, Trash2, Sparkles } from 'lucide-react';

interface GemPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  gem: GemstoneItem | null;
  onSavePhoto: (gemId: string, imageUrl: string | undefined) => void;
}

export const GemPhotoModal: React.FC<GemPhotoModalProps> = ({
  isOpen,
  onClose,
  gem,
  onSavePhoto,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(gem?.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreviewUrl(gem?.imageUrl);
  }, [gem, isOpen]);

  if (!isOpen || !gem) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress file to base64 Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.width;
        let h = img.height;

        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewUrl(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSavePhoto(gem.id, previewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Gemstone Photography</h3>
              <p className="text-xs text-slate-400">
                {gem.variety} ({gem.lotNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current / Preview Image Viewport */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          {previewUrl ? (
            <img src={previewUrl} alt={gem.variety} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-6 space-y-2 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-xs">No picture added for this stone yet.</p>
            </div>
          )}

          {previewUrl && (
            <button
              onClick={() => setPreviewUrl(undefined)}
              className="absolute top-3 right-3 p-1.5 bg-black/70 hover:bg-rose-900/80 text-rose-300 rounded-lg backdrop-blur-sm border border-slate-700 transition"
              title="Remove photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* File Picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Photo</span>
          </button>

          {/* Camera Capture on Phone */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 transition"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Take Photo</span>
          </button>
        </div>

        {/* Quick Presets for Fine Gem Varieties */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Or select high-definition specimen photograph:
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setPreviewUrl(GEM_SPECIMEN_IMAGES.sapphire)}
              className="rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 p-0.5 group"
              title="Ceylon Royal Blue Sapphire"
            >
              <img src={GEM_SPECIMEN_IMAGES.sapphire} alt="Sapphire" className="w-full aspect-square object-cover rounded" />
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">Sapphire</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewUrl(GEM_SPECIMEN_IMAGES.padparadscha)}
              className="rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 p-0.5 group"
              title="Ceylon Padparadscha Sapphire"
            >
              <img src={GEM_SPECIMEN_IMAGES.padparadscha} alt="Padparadscha" className="w-full aspect-square object-cover rounded" />
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">Padparadscha</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewUrl(GEM_SPECIMEN_IMAGES.ruby)}
              className="rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 p-0.5 group"
              title="Burma Pigeon Blood Ruby"
            >
              <img src={GEM_SPECIMEN_IMAGES.ruby} alt="Ruby" className="w-full aspect-square object-cover rounded" />
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">Burma Ruby</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewUrl(GEM_SPECIMEN_IMAGES.emerald)}
              className="rounded-lg overflow-hidden border border-slate-700 hover:border-cyan-400 p-0.5 group"
              title="Colombian Muzo Emerald"
            >
              <img src={GEM_SPECIMEN_IMAGES.emerald} alt="Emerald" className="w-full aspect-square object-cover rounded" />
              <span className="text-[9px] text-slate-400 block truncate mt-0.5">Emerald</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Save Photo</span>
          </button>
        </div>

      </div>
    </div>
  );
};
