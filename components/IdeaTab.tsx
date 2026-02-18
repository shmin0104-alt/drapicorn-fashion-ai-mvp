
import React, { useState, useRef } from 'react';
import { Variation } from '../types';
import { translations } from '../translations';
import { ImageUploader } from './ImageUploader';

interface IdeaTabProps {
  onGenerateVariations: (axes: string[], intensity: number, refImage?: string) => void;
  variations: Variation[];
  loading: boolean;
  onSelectVariation: (v: Variation) => void;
  lang: 'KO' | 'EN';
  sketchPreview: string | null;
  onSketchSelect: (base64: string) => void;
}

export const IdeaTab: React.FC<IdeaTabProps> = ({ onGenerateVariations, variations, loading, onSelectVariation, lang, sketchPreview, onSketchSelect }) => {
  const [axes, setAxes] = useState<string[]>(['Neckline', 'Length']);
  const [intensity, setIntensity] = useState(3);
  const [refImage, setRefImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];
  
  const allAxes = ['Neckline', 'Sleeve', 'Waist', 'Length', 'Closure', 'Material'];

  const toggleAxis = (axis: string) => {
    if (axes.includes(axis)) setAxes(axes.filter(a => a !== axis));
    else if (axes.length < 3) setAxes([...axes, axis]);
  };

  const handleRefUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRefImage((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Base Sketch</h3>
            {/* Reusing Global Image Uploader */}
            <ImageUploader onImageSelect={onSketchSelect} previewUrl={sketchPreview} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.variationControl}</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-2 block">{t.variationAxes}</label>
                    <div className="flex flex-wrap gap-2">
                        {allAxes.map(axis => (
                            <button key={axis} onClick={() => toggleAxis(axis)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${axes.includes(axis) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}>{axis}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-2 block flex justify-between">
                        <span>{t.variationIntensity}</span>
                        <span>{intensity} / 5</span>
                    </label>
                    <input type="range" min="1" max="5" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between"><span>{t.moodboardTitle}</span></h3>
            {refImage ? (
                <div className="relative group"><img src={`data:image/png;base64,${refImage}`} alt="Mood Ref" className="w-full h-32 object-cover rounded-xl border border-slate-200" /><button onClick={() => setRefImage(null)} className="absolute top-2 right-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</button></div>
            ) : (
                <div onClick={() => fileInputRef.current?.click()} className="h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"><span className="text-xl mb-1">🖼️</span><span className="text-[10px] text-slate-400 font-bold">{t.uploadRef}</span><input type="file" className="hidden" ref={fileInputRef} onChange={handleRefUpload} accept="image/*" /></div>
            )}
            <p className="text-[9px] text-slate-400 mt-2 leading-relaxed">{t.refHelper}</p>
        </div>

        <button 
            onClick={() => onGenerateVariations(axes, intensity, refImage || undefined)}
            disabled={loading} 
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${loading ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
        >
            {loading ? 'Thinking...' : t.generateVariations}
        </button>
      </div>

      <div className="lg:col-span-8">
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {variations.length === 0 && !loading && (
                <div className="col-span-3 flex flex-col items-center justify-center h-96 text-slate-300">
                    <span className="text-4xl mb-2">💡</span>
                    <span className="text-xs font-bold uppercase tracking-widest">No Variations Generated</span>
                </div>
            )}
            {variations.map((v) => (
                <div key={v.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-3 relative">
                        <img src={v.thumbnail} className="w-full h-full object-cover" alt="Variation" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => onSelectVariation(v)} className="bg-white text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase">{t.select}</button>
                        </div>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 mb-1 truncate">{v.title}</h4>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
};
