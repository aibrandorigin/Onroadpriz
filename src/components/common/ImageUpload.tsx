import React, { useState, useRef } from 'react';
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, Sparkles, Check, Camera } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { AndroidNativeService } from '../../services/androidNativeService';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  coverIndex?: number;
  onSetCover?: (index: number) => void;
}

const AUTOMOTIVE_PRESET_IMAGES = [
  { label: 'White SUV Front 3/4', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Black Thar 4x4', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Luxury Sedan Front', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Clean Dashboard & Interior', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Stealth Cruiser Bike', url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Commercial Truck', url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80' },
  { label: 'JCB Backhoe Heavy', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80' }
];

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 20,
  coverIndex = 0,
  onSetCover
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleCaptureCamera = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length >= maxImages) return;
    if (Capacitor.isNativePlatform()) {
      setUploading(true);
      const dataUrl = await AndroidNativeService.captureImage('camera');
      setUploading(false);
      if (dataUrl) {
        onChange([...images, dataUrl].slice(0, maxImages));
      }
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleChooseGallery = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length >= maxImages) return;
    if (Capacitor.isNativePlatform()) {
      setUploading(true);
      const dataUrl = await AndroidNativeService.captureImage('photos');
      setUploading(false);
      if (dataUrl) {
        onChange([...images, dataUrl].slice(0, maxImages));
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const processFiles = (files: File[]) => {
    setUploading(true);
    const newImages: string[] = [];
    let count = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
        }
        count++;
        if (count === files.length) {
          const combined = [...images, ...newImages].slice(0, maxImages);
          onChange(combined);
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (coverIndex >= updated.length && onSetCover) {
      onSetCover(Math.max(0, updated.length - 1));
    }
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;
    onChange(reordered);
    if (coverIndex === index && onSetCover) onSetCover(target);
    else if (coverIndex === target && onSetCover) onSetCover(index);
  };

  const handleAddPreset = (url: string) => {
    if (images.includes(url)) return;
    if (images.length >= maxImages) return;
    onChange([...images, url]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-[#77101F] bg-[#77101F]/5' 
            : 'border-[#DCE3EC] hover:border-[#77101F] bg-[#F7F9FC] hover:bg-[#F5F7FA]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#77101F]/10 flex items-center justify-center text-[#77101F] mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#101828] font-display">
            {uploading ? 'Processing Images...' : 'Upload Vehicle Photos via Camera or Gallery'}
          </h4>
          <p className="text-xs text-[#667085] mt-1 max-w-sm">
            High quality exterior and interior angles increase buyer enquiries by 300%. (JPG, PNG, WebP up to {maxImages} photos)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
            <button
              type="button"
              onClick={handleCaptureCamera}
              className="px-3.5 py-2 bg-[#77101F] hover:bg-[#5E0B17] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Take Photo (Camera)</span>
            </button>
            <button
              type="button"
              onClick={handleChooseGallery}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#101828] border border-[#DCE3EC] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#77101F]" />
              <span>Choose from Gallery</span>
            </button>
            <span className="text-xs font-bold px-3 py-1.5 bg-white border border-[#DCE3EC] rounded-xl text-[#101828]">
              {images.length} / {maxImages} Photos
            </span>
          </div>
        </div>
      </div>

      {/* Automotive Preset Gallery Drawer */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs font-bold text-[#77101F] hover:text-[#5E0B17] flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#77101F]/5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showPresets ? 'Hide Sample Gallery' : 'Need Sample Photos? Choose from Catalog'}</span>
        </button>
        <span className="text-[11px] text-[#98A2B3]">Photos save with listing</span>
      </div>

      {showPresets && (
        <div className="p-4 bg-[#F7F9FC] rounded-2xl border border-[#DCE3EC] animate-in fade-in duration-200">
          <p className="text-xs font-bold text-[#101828] mb-2.5">
            Click any authentic automotive photography sample to append to your listing:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {AUTOMOTIVE_PRESET_IMAGES.map((preset, idx) => {
              const alreadyAdded = images.includes(preset.url);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddPreset(preset.url)}
                  disabled={alreadyAdded}
                  className={`group relative rounded-xl overflow-hidden border text-left aspect-video transition-all ${
                    alreadyAdded ? 'opacity-40 cursor-not-allowed border-[#DCE3EC]' : 'border-[#DCE3EC] hover:border-[#77101F] hover:shadow-xs'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 text-[10px] text-white font-semibold">
                    <span className="truncate">{preset.label}</span>
                  </div>
                  {alreadyAdded && (
                    <div className="absolute top-1 right-1 bg-[#087F5B] text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded Images Grid with Reordering & Cover Badge */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, index) => {
            const isCover = (coverIndex ?? 0) === index;
            return (
              <div
                key={index}
                className={`relative group rounded-xl overflow-hidden border bg-white shadow-2xs aspect-[4/3] ${
                  isCover ? 'border-2 border-[#77101F]' : 'border-[#DCE3EC]'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge if Cover */}
                {isCover && (
                  <span className="absolute top-2 left-2 bg-[#77101F] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Cover Photo
                  </span>
                )}

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {!isCover && onSetCover && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSetCover(index); }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#101828] text-xs font-bold"
                      title="Set as Main Cover"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(index, 'left'); }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#101828]"
                      title="Move Left"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(index, 'right'); }}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#101828]"
                      title="Move Right"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(index); }}
                    className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
