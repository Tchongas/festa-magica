"use client";

import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface ImageUploadProps {
  id: string;
  value: string | null;
  mimeType?: string | null;
  onChange: (base64: string | null, mimeType?: string | null) => void;
  label?: string;
  placeholder?: string;
  accentColor?: "pink" | "blue";
}

export function ImageUpload({
  id,
  value,
  mimeType,
  onChange,
  label,
  placeholder = "Carregar Foto",
  accentColor = "pink",
}: ImageUploadProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Formato não suportado. Use JPG, PNG ou WebP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      onChange(base64String, file.type);
    };
    e.target.value = '';
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null, null);
  };

  const colorClasses = {
    pink: {
      border: value ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-gray-50 hover:bg-pink-50 hover:border-pink-300",
      icon: "text-pink-500",
    },
    blue: {
      border: value ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300",
      icon: "text-blue-500",
    },
  };

  const previewSrc = value ? `data:${mimeType || 'image/jpeg'};base64,${value}` : null;

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-bold text-gray-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleUpload}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className={cn(
            "flex flex-col items-center justify-center h-64 border-4 border-dashed rounded-[32px] cursor-pointer transition-all",
            colorClasses[accentColor].border
          )}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-full object-cover rounded-[28px]"
            />
          ) : (
            <>
              <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                <Upload className={cn("w-8 h-8", colorClasses[accentColor].icon)} />
              </div>
              <span className="text-gray-400 font-medium">{placeholder}</span>
              <span className="text-xs text-gray-300 mt-1">JPG, PNG ou WebP • máx. {MAX_FILE_SIZE_MB}MB</span>
            </>
          )}
        </label>
        {value && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors z-10"
            title="Remover imagem"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
