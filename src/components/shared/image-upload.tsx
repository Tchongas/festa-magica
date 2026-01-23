"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToBase64 } from "@/lib/utils";

interface ImageUploadProps {
  id: string;
  value: string | null;
  onChange: (base64: string | null) => void;
  label?: string;
  placeholder?: string;
  accentColor?: "pink" | "blue";
}

export function ImageUpload({
  id,
  value,
  onChange,
  label,
  placeholder = "Carregar Foto",
  accentColor = "pink",
}: ImageUploadProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      onChange(base64);
    }
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
          accept="image/*"
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
          {value ? (
            <img
              src={`data:image/jpeg;base64,${value}`}
              alt="Preview"
              className="w-full h-full object-cover rounded-[28px]"
            />
          ) : (
            <>
              <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                <Upload className={cn("w-8 h-8", colorClasses[accentColor].icon)} />
              </div>
              <span className="text-gray-400 font-medium">{placeholder}</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
