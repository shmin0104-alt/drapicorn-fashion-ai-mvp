
import React, { useState } from 'react';
import { DnaProfile } from '../types';
import { translations } from '../translations';

interface DnaTabProps {
  dna: DnaProfile;
  onUpdateDna: (newDna: DnaProfile) => void;
  onAnalyze: () => void;
  loading: boolean;
  lang: 'KO' | 'EN';
}

export const DnaTab: React.FC<DnaTabProps> = ({ dna, onUpdateDna, onAnalyze, loading, lang }) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-xl">🧬</span> {t.signatureProfile}
                </h3>
                <button onClick={onAnalyze} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:bg-slate-200">
                    {loading ? 'Analyzing...' : t.analyzeSketch}
                </button>
            </div>
            {/* ... other DNA tags logic localized naturally via titles ... */}
            <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Silhouette Tags</label>
                <div className="flex flex-wrap gap-2">
                    {dna.tags.silhouette.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-medium text-slate-600">{tag}</span>
                    ))}
                </div>
            </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-center items-center text-center">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">{t.consistencyScore}</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[12px] border-slate-100"></div>
                <div className="text-center">
                    <span className="text-5xl font-black text-slate-900 block">{dna.score}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
                </div>
            </div>
            <div className="mt-8 w-full text-left">
                <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase">{t.penaltyAnalysis}</p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-400 italic">No violations detected.</div>
            </div>
        </div>
    </div>
  );
};
