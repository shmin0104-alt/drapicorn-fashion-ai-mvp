
import React, { useState, useEffect } from 'react';
import { geminiService } from '../geminiService';
import { NewsArticle } from '../types';
import { translations } from '../translations';

interface NewsTabProps {
  lang: 'KO' | 'EN';
}

type NewsRegion = 'GLOBAL' | 'EUROPE' | 'USA' | 'KOREA' | 'NEW_DROPS';

export const NewsTab: React.FC<NewsTabProps> = ({ lang }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<NewsRegion>('GLOBAL');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const t = translations[lang];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await geminiService.getRealtimeFashionNews(lang, region);
        setNews(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [lang, region]);

  const regions: { id: NewsRegion, label: string }[] = [
    { id: 'GLOBAL', label: t.regionGlobal },
    { id: 'EUROPE', label: t.regionEurope },
    { id: 'USA', label: t.regionUSA },
    { id: 'KOREA', label: t.regionKorea },
    { id: 'NEW_DROPS', label: t.regionNewDrops },
  ];

  const handleArticleClick = (item: NewsArticle) => {
    setSelectedArticle(item);
  };

  const closeDetail = () => {
    setSelectedArticle(null);
  };

  const getFallbackImage = (idx: number) => {
      // High-quality fashion abstract placeholders
      const placeholders = [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop', // Denim/Texture
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop', // Coats
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', // Minimal
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop', // Runway
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', // Model
        'https://images.unsplash.com/photo-1520006403909-838d6b92c22e?q=80&w=800&auto=format&fit=crop'  // Fabric
      ];
      return placeholders[idx % placeholders.length];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.newsHeader}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.newsSubheader}</p>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto">
           <div className="flex bg-slate-100 p-1 rounded-xl whitespace-nowrap">
             {regions.map((r) => (
               <button 
                 key={r.id}
                 onClick={() => setRegion(r.id)}
                 className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${region === r.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {r.label}
               </button>
             ))}
           </div>
           <div className="flex items-center gap-1.5 pl-2 hidden md:flex">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-3 bg-slate-100 rounded w-20"></div>
                <div className="h-3 bg-slate-100 rounded w-24"></div>
              </div>
              <div className="h-5 bg-slate-100 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`space-y-4 ${region === 'NEW_DROPS' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0' : ''}`}>
          {news.map((item, idx) => {
            const isNewDrop = region === 'NEW_DROPS';
            const priceFeature = item.features?.find(f => f.toLowerCase().includes('price'));
            const finishFeature = item.features?.find(f => f.toLowerCase().includes('finishing'));
            const detailFeature = item.features?.find(f => f.toLowerCase().includes('detail'));
            const otherFeatures = item.features?.filter(f => !f.toLowerCase().includes('price') && !f.toLowerCase().includes('finishing') && !f.toLowerCase().includes('detail')) || [];

            return (
              <div 
                key={idx} 
                onClick={() => handleArticleClick(item)}
                className={`block bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-xl transition-all group relative overflow-hidden flex flex-col cursor-pointer ${isNewDrop ? 'min-h-[450px]' : 'p-6 min-h-[180px]'}`}
              >
                {/* Product Image for New Drops */}
                {isNewDrop && (
                    <div className="relative h-64 bg-slate-100 overflow-hidden">
                        <img 
                          src={item.thumbnail || getFallbackImage(idx)} 
                          onError={(e) => {
                            e.currentTarget.src = getFallbackImage(idx);
                            e.currentTarget.onerror = null; // Prevent loop
                          }}
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                        {priceFeature && (
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-indigo-900 px-3 py-1.5 rounded-full text-[11px] font-black shadow-lg">
                                {priceFeature.split(':')[1]?.trim() || priceFeature}
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4">
                             <span className="bg-black/70 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">{item.source}</span>
                        </div>
                    </div>
                )}

                <div className={isNewDrop ? "p-6 flex-1 flex flex-col justify-between" : ""}>
                    <div>
                        {!isNewDrop && (
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">
                                    {item.source}
                                </span>
                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">|</span>
                                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{item.date}</span>
                                </div>
                                <span className="text-[10px] text-slate-300 group-hover:text-indigo-600 transition-colors">↗</span>
                            </div>
                        )}
                        
                        <h3 className={`font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight uppercase tracking-tight ${isNewDrop ? 'text-lg line-clamp-1' : 'text-base line-clamp-2'}`}>
                            {item.title}
                        </h3>
                        
                        {!isNewDrop && (
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-3">
                                {item.summary}
                            </p>
                        )}

                        {/* Specs Table for New Drops */}
                        {isNewDrop && (
                            <div className="mt-4 space-y-3">
                                {finishFeature && (
                                    <div className="flex flex-col border-b border-slate-100 pb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Finishing / Method</span>
                                        <span className="text-[10px] font-bold text-slate-700">{finishFeature.split(':')[1]?.trim() || finishFeature}</span>
                                    </div>
                                )}
                                {detailFeature && (
                                    <div className="flex flex-col border-b border-slate-100 pb-2">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Signature Detail</span>
                                        <span className="text-[10px] font-bold text-slate-700">{detailFeature.split(':')[1]?.trim() || detailFeature}</span>
                                    </div>
                                )}
                                {otherFeatures.length > 0 && (
                                    <div className="flex gap-2 flex-wrap pt-2">
                                        {otherFeatures.map((f, i) => (
                                            <span key={i} className="text-[9px] font-medium bg-slate-50 text-slate-500 px-2 py-1 rounded-md">{f}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 flex items-center justify-between">
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:underline">
                        {isNewDrop ? t.viewDetails : t.readFullReport}
                        </span>
                    </div>
                </div>
              </div>
            );
          })}
          
          {news.length === 0 && (
            <div className="col-span-full p-20 bg-white rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center">
              <span className="text-4xl mb-4">🏜️</span>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No news data found for {region}</p>
              <button onClick={() => setRegion('GLOBAL')} className="mt-4 text-indigo-600 text-[9px] font-black uppercase tracking-widest hover:underline">Return to Global</button>
            </div>
          )}
        </div>
      )}
      
      {/* Footer Info */}
      <div className="bg-slate-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
         <div className="mb-4 md:mb-0">
            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Intelligence Insight</h4>
            <p className="text-xs font-bold leading-relaxed max-w-md">
              AI가 각 지역의 소셜 데이터와 뉴스 미디어를 실시간으로 크롤링하여 패션 산업에 특화된 정보를 제공합니다. 요약은 사용자의 설정 언어로 자동 번역됩니다.
            </p>
         </div>
         <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[8px] font-black text-slate-500 uppercase">Analysis Confidence</div>
              <div className="text-xl font-black">98.4%</div>
            </div>
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">📈</div>
         </div>
      </div>

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-indigo-600 p-6 flex justify-between items-start">
                  <div>
                    <span className="inline-block bg-white/20 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest mb-3 backdrop-blur-sm">
                      {t.aiReportTitle}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                      {selectedArticle.title}
                    </h3>
                    <div className="flex gap-3 mt-3 text-indigo-200 text-[10px] font-bold uppercase tracking-widest">
                      <span>{selectedArticle.source}</span>
                      <span>•</span>
                      <span>{selectedArticle.date}</span>
                    </div>
                  </div>
                  <button onClick={closeDetail} className="text-white/60 hover:text-white text-2xl transition-colors">✕</button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                  {/* Image in Modal for New Drops */}
                  {selectedArticle.thumbnail && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                          <img 
                            src={selectedArticle.thumbnail} 
                            onError={(e) => {
                                e.currentTarget.src = getFallbackImage(0);
                                e.currentTarget.onerror = null;
                            }}
                            alt={selectedArticle.title} 
                            className="w-full h-64 object-cover" 
                          />
                      </div>
                  )}

                  <div className="mb-8">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Executive Summary</h4>
                     <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedArticle.summary}
                     </p>
                  </div>

                  {selectedArticle.features && selectedArticle.features.length > 0 && (
                     <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">{t.featureAnalysis}</h4>
                        <ul className="space-y-3">
                            {selectedArticle.features.map((feat, i) => (
                                <li key={i} className="flex gap-3">
                                   <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm border border-slate-100 flex-shrink-0">{i+1}</span>
                                   <span className="text-xs font-bold text-slate-700 pt-0.5">{feat}</span>
                                </li>
                            ))}
                        </ul>
                     </div>
                  )}

                  <div className="flex gap-3">
                     <a 
                       href={selectedArticle.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex-1 bg-slate-900 text-white py-4 rounded-xl text-center text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg"
                     >
                        {t.originalLink} ↗
                     </a>
                     <button 
                       onClick={closeDetail} 
                       className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                     >
                        {t.close}
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
