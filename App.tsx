
import React, { useState, useEffect, useRef } from 'react';
// Firebase Imports
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import { ToolType, ItemType, GenerationResult, PreviewOptions, ModelMeasurements, TechPackMeta, Variation, MarketReaction, CommunityPost, NewsArticle } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ToolGrid } from './components/ToolGrid';
import { IdeaTab } from './components/IdeaTab';
import { ChatTab } from './components/ChatTab';
import { ReactTab } from './components/ReactTab';
import { CommunityTab } from './components/CommunityTab';
import { NewsTab } from './components/NewsTab';
import { geminiService } from './geminiService';
import { LOADING_MESSAGES } from './constants';
import { translations } from './translations';

// --- (TechPackSheet Component remains unchanged) ---
interface TechPackSheetProps {
  data: any;
  meta: TechPackMeta;
  flatSketchUrl?: string;
  selectedFactory: any | null;
  onSelectFactory: (factory: any) => void;
  lang: 'KO' | 'EN';
}

const TechPackSheet: React.FC<TechPackSheetProps> = ({ data, meta, flatSketchUrl, selectedFactory, onSelectFactory, lang }) => {
  if (!data || !data.docs) return null;
  const t = translations[lang];

  return (
    <div className="space-y-12">
      {data.docs.map((doc: any, idx: number) => {
        const isBottom = doc.part === 'BOTTOM' || doc.part === 'JEANS';
        return (
          <div key={idx} className="bg-white text-slate-900 border border-slate-400 p-0 shadow-xl overflow-hidden print:shadow-none print:border-2">
            <div className="bg-slate-100 border-b border-slate-400 p-4 flex justify-between items-center">
              <h1 className="text-2xl font-black uppercase tracking-wider">{doc.part} TECH PACK</h1>
              <div className="text-right text-[10px] font-mono">
                <p><span className="font-bold">Date:</span> {meta.requestDate}</p>
                <p><span className="font-bold">Season:</span> {meta.season}</p>
                <p><span className="font-bold">Style:</span> {meta.styleNo}</p>
              </div>
            </div>
            {/* ... rest of the component is identical, so it's omitted for brevity ... */}
          </div>
        );
      })}
    </div>
  );
};


type TabId = 'PRODUCTION' | 'IDEA' | 'CHAT' | 'REACT' | 'COMMUNITY' | 'NEWS';

const App: React.FC = () => {
  // --- NEW AUTHENTICATION STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Existing States ---
  const [activeTab, setActiveTab] = useState<TabId>('PRODUCTION');
  const [lang, setLang] = useState<'KO' | 'EN'>('KO');
  const [sketchBase64, setSketchBase64] = useState<string | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  
  // ... (all other existing states remain the same)
  const [topSwatches, setTopSwatches] = useState<{base64: string, preview: string}[]>([]);
  const [bottomSwatches, setBottomSwatches] = useState<{base64: string, preview: string}[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(ToolType.AI_PACK);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [useHighRes, setUseHighRes] = useState(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [marketReaction, setMarketReaction] = useState<MarketReaction | null>(null);
  const [selectedFactory, setSelectedFactory] = useState<any | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const [measurements, setMeasurements] = useState<ModelMeasurements>({ height: '175', weight: '65', chest: '92', waist: '78', hip: '92', shoulder: '42', armLength: '62', inseam: '80' });
  const [meta, setMeta] = useState<TechPackMeta>({ brandName: 'Drapicorn Lab', itemName: '', styleNo: `DP-${Math.floor(Math.random() * 9000 + 1000)}`, season: '25SS', requestDate: new Date().toISOString().split('T')[0], dueDate: '', quantity: '1pc', sizeLabel: 'F', requester: 'Designer', manager: 'AI Agent', additionalNotes: '' });
  const [options, setOptions] = useState<PreviewOptions>({ itemType: 'TOP' as ItemType, lang: lang, fit: 'regular', length: 'basic', measurements: measurements });
  
  const topSwatchInputRef = useRef<HTMLInputElement>(null);
  const bottomSwatchInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  // --- NEW FIREBASE AUTHENTICATION LOGIC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in.
        setUser(currentUser);
        // Check if user exists in Firestore, if not, create them
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: new Date()
          });
        }
      } else {
        // User is signed out.
        setUser(null);
      }
      setAuthLoading(false);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToastMsg(t.loginSuccess, 'success');
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      showToastMsg(t.loginFailure, 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      showToastMsg(t.logoutSuccess, 'info');
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };


  // --- (All other functions like handleGenerate, handleSketchSelect, etc. remain the same) ---
  const showToastMsg = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(msg); setToastType(type); setShowToast(true); setTimeout(() => setShowToast(false), 4000);
  };
  const handleSketchSelect = (base64: string) => { setSketchBase64(base64); setSketchPreview(`data:image/png;base64,${base64}`); setResult(null); };
  const handleGenerate = async () => {
    if (!user) return showToastMsg(t.loginRequired, 'error');
    if (!sketchBase64) return showToastMsg(lang === 'KO' ? "스케치를 업로드하세요." : "Please upload a sketch.", 'error');
    if (!meta.itemName.trim()) return showToastMsg(lang === 'KO' ? "아이템명을 입력하세요." : "Please enter an item name.", 'error');

    setLoading(true); setResult(null);
    try {
      const response = await geminiService.processFashionTask(selectedTool || ToolType.AI_PACK, sketchBase64, { ...options, measurements }, [], [], meta, 'GENERATE');
      setResult(response);

      // --- NEW: Save result to Firestore ---
      const resultDocRef = doc(db, "users", user.uid, "projects", meta.styleNo);
      await setDoc(resultDocRef, {
          meta,
          result: response,
          createdAt: new Date()
      });

      showToastMsg(lang === 'KO' ? "데이터 생성 및 저장이 완료되었습니다." : "Generation and save complete.", 'success');
    } catch (error: any) {
      showToastMsg(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the functions are unchanged)

  if (authLoading) {
      return (
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-100">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg shadow-lg mb-4 animate-pulse">🦄</div>
              <p className="text-xs font-bold text-slate-400">Authenticating...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#dae0e6] text-slate-900 font-sans selection:bg-indigo-100 pb-20">
       {showToast && ( /* Toast unchanged */ )}

      {/* Nav - MODIFIED for Login/Logout */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-lg shadow-lg">🦄</div>
            <h1 className="text-base font-black tracking-tighter uppercase">{t.brandName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setLang('KO')} className={`px-3 py-1 rounded text-[10px] font-black transition-all ${lang === 'KO' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>KO</button>
                <button onClick={() => setLang('EN')} className={`px-3 py-1 rounded text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
            </div>
            
            {/* --- NEW AUTH BUTTON LOGIC --- */}
            {user ? (
                <div className="flex items-center gap-2">
                    <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-7 h-7 rounded-full border-2 border-slate-200" />
                    <button onClick={handleSignOut} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-100 hover:text-red-600">{t.logout}</button>
                </div>
            ) : (
                <button onClick={handleGoogleSignIn} className="px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700">
                    {t.login}
                </button>
            )}

          </div>
        </div>
      </header>

      {/* --- Main Content (conditionally rendered) --- */}
      {user ? (
        <>
            <nav className="max-w-7xl mx-auto px-6 mt-6 flex gap-2 overflow-x-auto no-scrollbar">
                {/* Nav tabs unchanged */}
            </nav>
            <main className="max-w-7xl mx-auto px-6 py-6">
                {/* All the tab content logic remains here */}
            </main>
        </>
      ) : (
        <div className="max-w-lg mx-auto mt-20 text-center bg-white p-12 rounded-3xl shadow-xl border border-slate-200">
            <div className="text-5xl mb-6">🦄</div>
            <h2 className="text-xl font-black text-slate-800 mb-2">{t.welcomeTitle}</h2>
            <p className="text-sm text-slate-500 mb-8">{t.welcomeMessage}</p>
            <button onClick={handleGoogleSignIn} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg">
                {t.googleLogin}
            </button>
        </div>
      )}

    </div>
  );
};

export default App;
