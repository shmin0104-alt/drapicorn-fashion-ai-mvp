
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white hover:border-indigo-400 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept="image/*"
      />
      {previewUrl ? (
        <img src={previewUrl} alt="Preview" className="max-h-[280px] rounded-lg shadow-sm object-contain" />
      ) : (
        <div className="text-center">
          <div className="text-4xl mb-3">📁</div>
          <p className="text-slate-600 font-medium">스케치 이미지를 업로드하세요</p>
          <p className="text-slate-400 text-sm mt-1">드래그 앤 드롭 또는 클릭</p>
        </div>
      )}
    </div>
  );
};
