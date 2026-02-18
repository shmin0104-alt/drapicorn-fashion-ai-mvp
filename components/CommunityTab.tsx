
import React, { useState } from 'react';
import { CommunityPost } from '../types';
import { translations } from '../translations';

interface CommunityTabProps {
  posts: CommunityPost[];
  onVote: (id: string, type: 'UP' | 'DOWN') => void;
  onShareDesign?: () => void;
  canShare: boolean;
  lang: 'KO' | 'EN';
}

export const CommunityTab: React.FC<CommunityTabProps> = ({ posts, onVote, onShareDesign, canShare, lang }) => {
  const [filter, setFilter] = useState<'HOT' | 'NEW' | 'TOP'>('HOT');
  const [activeBoard, setActiveBoard] = useState<string | null>(null);
  const t = translations[lang];

  const POPULAR_BOARDS = [
    { name: lang === 'KO' ? '컨셉_갤러리' : 'Concept_Gallery', icon: '🎨', color: 'bg-orange-500' },
    { name: lang === 'KO' ? '기술_아카이브' : 'Tech_Archive', icon: '📐', color: 'bg-indigo-500' },
    { name: lang === 'KO' ? '매뉴팩처링_허브' : 'Manufacturing_Hub', icon: '🏭', color: 'bg-emerald-500' }
  ];

  const filteredPosts = posts
    .filter(p => !activeBoard || p.boardName === activeBoard)
    .sort((a, b) => {
        if (filter === 'NEW') return b.id.localeCompare(a.id);
        if (filter === 'TOP') return (b.likes - b.downvotes) - (a.likes - a.downvotes);
        return (b.likes + b.views) - (a.likes + a.views);
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
      <aside className="lg:col-span-3 space-y-6 hidden lg:block">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-10 bg-indigo-600 px-4 flex items-center">
                <span className="text-white text-[10px] font-black uppercase tracking-widest">{t.galleries}</span>
            </div>
            <div className="p-2">
                {POPULAR_BOARDS.map((board) => (
                    <button 
                        key={board.name}
                        onClick={() => setActiveBoard(activeBoard === board.name ? null : board.name)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${activeBoard === board.name ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'}`}
                    >
                        <div className={`w-8 h-8 ${board.color} rounded-lg flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform`}>{board.icon}</div>
                        <span className={`text-xs font-bold uppercase tracking-tight ${activeBoard === board.name ? 'text-indigo-600' : 'text-slate-600'}`}>
                            {board.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.trendingTags}</h4>
            <div className="flex flex-wrap gap-2">
                {['#TECHWEAR', '#FABRIC', '#SS25', '#SUSTAINABLE'].map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-500 hover:text-indigo-600 cursor-pointer">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
      </aside>

      <div className="lg:col-span-9 space-y-4">
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                {(['HOT', 'NEW', 'TOP'] as const).map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 md:flex-none px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            {canShare && (
                <button onClick={onShareDesign} className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                    {t.createThread}
                </button>
            )}
        </div>

        <div className="space-y-4">
            {filteredPosts.map((post) => {
                const karma = post.likes - post.downvotes;
                return (
                    <div key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-400 transition-colors flex shadow-sm group">
                        <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-4 gap-2">
                            <button onClick={() => onVote(post.id, 'UP')} className="text-xl text-slate-300 hover:text-orange-500 transition-colors">▲</button>
                            <span className={`text-[11px] font-black ${karma > 100 ? 'text-orange-600' : karma < 0 ? 'text-indigo-600' : 'text-slate-800'}`}>{karma}</span>
                            <button onClick={() => onVote(post.id, 'DOWN')} className="text-xl text-slate-300 hover:text-indigo-500 transition-colors">▼</button>
                        </div>
                        <div className="flex-1 p-4 flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-tighter">r/{post.boardName}</span>
                                    <span className="text-[10px] text-slate-400">• u/{post.author}</span>
                                    <span className="text-[10px] text-slate-400">{post.timestamp}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">{post.title}</h3>
                                <div className="flex items-center gap-5 pt-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.comments} {t.comments}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{post.views} {t.views}</span>
                                </div>
                            </div>
                            <div className="md:w-48 lg:w-56 aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 relative group/img">
                                <img src={post.image} className="w-full h-full object-cover" alt="Thread" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                     <span className="bg-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">{t.expandImage}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
