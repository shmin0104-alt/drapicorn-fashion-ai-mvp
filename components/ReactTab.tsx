
import React, { useState, useEffect } from 'react';
import { MarketReaction } from '../types';
import { translations } from '../translations';

interface ReactTabProps {
  reaction: MarketReaction | null;
  onSimulate: () => void;
  loading: boolean;
  lang: 'KO' | 'EN';
}

export const ReactTab: React.FC<ReactTabProps> = ({ reaction, onSimulate, loading, lang }) => {
  const t = translations[lang];
  const [backers, setBackers] = useState<number>(0);
  const [currentAmount, setCurrentAmount] = useState<number>(0);

  useEffect(() => {
    if (reaction) {
      setBackers(reaction.backers);
      setCurrentAmount(reaction.currentAmount);
    }
  }, [reaction]);

  const handleBuy = () => {
    setBackers(prev => prev + 1);
    setCurrentAmount(prev => prev + 189); // Simulate price increase
  };

  const fundingPercent = reaction ? reaction.fundingRate : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-200 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-xl">🛍️</span> {t.abPolling}
                </h3>
             </div>
             {!reaction ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <p className="text-4xl mb-4">🔮</p>
                    <p className="text-slate-500 font-medium mb-4">{lang === 'KO' ? "AI가 예상 예약 구매량과 펀딩 달성률을 예측합니다." : "AI predicts pre-order volume and funding success rate."}</p>
                    <button onClick={onSimulate} disabled={loading} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">
                        {loading ? 'Analyzing Demand...' : t.simulateLaunch}
                    </button>
                </div>
             ) : (
                <div className="flex-1 flex flex-col justify-center gap-6">
                   {/* Funding Progress */}
                   <div className="bg-slate-50 rounded-2xl p-6">
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-4xl font-black text-indigo-600">{fundingPercent}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">of ${reaction.targetAmount.toLocaleString()} Goal</span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${Math.min(fundingPercent, 100)}%` }}
                          ></div>
                      </div>
                      <div className="flex justify-between mt-4 text-center">
                          <div>
                              <div className="text-lg font-black text-slate-900">${currentAmount.toLocaleString()}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Pledged</div>
                          </div>
                          <div>
                              <div className="text-lg font-black text-slate-900">{backers.toLocaleString()}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Backers</div>
                          </div>
                          <div>
                              <div className="text-lg font-black text-slate-900">14</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Days Left</div>
                          </div>
                      </div>
                   </div>

                   {/* Demographics */}
                   <div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Demographics</h4>
                       <div className="space-y-2">
                           {reaction.demographics?.map((demo, idx) => (
                               <div key={idx} className="flex items-center gap-3">
                                   <span className="text-[10px] font-bold text-slate-500 w-16 text-right">{demo.label}</span>
                                   <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-slate-800 rounded-full" style={{ width: `${demo.percent}%` }}></div>
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-900 w-8">{demo.percent}%</span>
                               </div>
                           ))}
                       </div>
                   </div>
                </div>
             )}
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-between">
                 <div>
                     <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{t.projectedWaitlist}</h3>
                     <div className="text-5xl font-black mb-1 text-emerald-400">
                        {reaction ? `${fundingPercent}%` : '-'}
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2">
                        {lang === 'KO' ? "현재 트렌드 기반 AI 예측 달성률" : "AI Projected Success Rate based on trends"}
                     </p>
                 </div>
                 <div className="mt-8 flex gap-3">
                     <button className="flex-1 bg-white text-slate-900 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-colors">
                         {t.earlyAccess}
                     </button>
                     <button 
                       onClick={handleBuy}
                       disabled={!reaction}
                       className="flex-1 bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <span>💳</span> {t.buyNow}
                     </button>
                 </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t.aiFeedback}</h3>
                {reaction ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                            <span className="text-[9px] font-black text-green-600 uppercase block mb-1">Market Strength</span>
                            <p className="text-xs text-green-800 font-medium leading-relaxed">"{reaction.feedback.praise}"</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <span className="text-[9px] font-black text-red-600 uppercase block mb-1">Improvements</span>
                            <p className="text-xs text-red-800 font-medium leading-relaxed">"{reaction.feedback.complaint}"</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {reaction.chips.map(chip => (
                                <span key={chip} className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">#{chip}</span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase">No data available</div>
                )}
            </div>
        </div>
    </div>
  );
};
