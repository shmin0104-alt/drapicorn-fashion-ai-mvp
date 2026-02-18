
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatPartner, TechPackMeta, QCReport } from '../types';
import { translations } from '../translations';
import { geminiService } from '../geminiService';

interface ChatTabProps {
  meta: TechPackMeta;
  lang: 'KO' | 'EN';
}

export const ChatTab: React.FC<ChatTabProps> = ({ meta, lang }) => {
  const t = translations[lang];
  const [activePartnerId, setActivePartnerId] = useState<string>('partner-1');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showQCModal, setShowQCModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // QC State
  const [qcSampleRound, setQcSampleRound] = useState('1st Sample');
  const [qcImage, setQcImage] = useState<string | null>(null);
  const [qcCorrections, setQcCorrections] = useState<string[]>(['']);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qcFileInputRef = useRef<HTMLInputElement>(null);

  const [partners] = useState<ChatPartner[]>([
    { id: 'partner-1', name: lang === 'KO' ? '서울 성동 패턴실' : 'Seoul Pattern Lab', role: 'Main Factory', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', status: 'ONLINE', unreadCount: 0 },
    { id: 'partner-2', name: lang === 'KO' ? '대구 원단업체 (김부장)' : 'Daegu Fabric (Mr. Kim)', role: 'Material Supplier', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack', status: 'BUSY', unreadCount: 2 },
    { id: 'partner-3', name: lang === 'KO' ? '베트남 봉제공장 B' : 'Vietnam Sewing Factory B', role: 'Mass Production', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', status: 'OFFLINE', unreadCount: 0 },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'msg-0', sender: 'FACTORY', text: lang === 'KO' ? `안녕하세요 디자이너님! "${meta.itemName}" 작업지시서 확인했습니다. 몇 가지 체크할 게 있어서 연락드립니다.` : `Hello Designer! I checked the tech pack for "${meta.itemName}". I have a few questions.`, timestamp: '09:41', isRead: true }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string, qcReport?: QCReport) => {
    const content = text || inputText;
    if (!content.trim() && !qcReport) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: qcReport ? 'QC_REPORT' : 'TEXT',
      qcData: qcReport
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate network delay then AI response
    try {
      const responseText = await geminiService.getFactoryResponse([...messages, newMsg], meta, lang);
      
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'FACTORY',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: true
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000); // 1.5 ~ 2.5s delay
    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  const handleQcImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQcImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCorrectionChange = (index: number, val: string) => {
      const newCorrections = [...qcCorrections];
      newCorrections[index] = val;
      setQcCorrections(newCorrections);
  };

  const addCorrectionField = () => {
      setQcCorrections([...qcCorrections, '']);
  };

  const submitQC = () => {
      const report: QCReport = {
          sampleRound: qcSampleRound,
          image: qcImage || undefined,
          corrections: qcCorrections.filter(c => c.trim() !== ''),
          status: 'SENT'
      };
      handleSend(t.qcSentMessage, report);
      setShowQCModal(false);
      // Reset
      setQcImage(null);
      setQcCorrections(['']);
  };

  const startQuickCall = () => {
      setShowCallModal(true);
      setTimeout(() => {
          setShowCallModal(false);
          // Auto add a message that call ended
          const callMsg: ChatMessage = {
             id: `sys-${Date.now()}`,
             sender: 'USER',
             text: `📞 ${t.callEnded} (3:42)`,
             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             isRead: true,
             type: 'TEXT'
          };
          setMessages(prev => [...prev, callMsg]);
      }, 4000);
  };

  const activePartner = partners.find(p => p.id === activePartnerId);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden h-[800px] flex animate-in fade-in duration-500 relative">
      
      {/* QC Modal */}
      {showQCModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90%]">
                  <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                      <h3 className="font-black text-sm uppercase tracking-widest">{t.sendQC}</h3>
                      <button onClick={() => setShowQCModal(false)}>✕</button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.sampleRound}</label>
                          <select 
                            value={qcSampleRound} 
                            onChange={(e) => setQcSampleRound(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none"
                          >
                              <option>1st Sample</option>
                              <option>2nd Sample (Main)</option>
                              <option>Pre-Production (PP)</option>
                          </select>
                      </div>
                      
                      <div 
                        onClick={() => qcFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors relative overflow-hidden"
                      >
                          {qcImage ? (
                              <img src={qcImage} className="w-full h-full object-cover" />
                          ) : (
                              <>
                                <span className="text-2xl mb-2">📸</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t.uploadSample}</span>
                              </>
                          )}
                          <input type="file" ref={qcFileInputRef} className="hidden" accept="image/*" onChange={handleQcImageUpload} />
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.correctionPoints}</label>
                          <div className="space-y-2">
                              {qcCorrections.map((txt, idx) => (
                                  <div key={idx} className="flex gap-2">
                                      <span className="w-6 h-8 flex items-center justify-center text-[10px] font-black text-slate-300 bg-slate-100 rounded-lg">{idx+1}</span>
                                      <input 
                                        type="text" 
                                        value={txt}
                                        onChange={(e) => handleCorrectionChange(idx, e.target.value)}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs outline-none focus:border-indigo-400"
                                      />
                                  </div>
                              ))}
                          </div>
                          <button onClick={addCorrectionField} className="mt-2 text-[10px] font-bold text-indigo-600 hover:underline">{t.addCorrection}</button>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-100">
                      <button onClick={submitQC} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-colors">{t.sendToFactory}</button>
                  </div>
              </div>
          </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 p-2 mb-8 relative">
                  <img src={activePartner?.avatar} className="w-full h-full rounded-full bg-slate-700 object-cover" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500 animate-ping"></div>
              </div>
              <h2 className="text-2xl font-black mb-2">{activePartner?.name}</h2>
              <p className="text-sm font-medium opacity-60 animate-pulse">{t.calling}</p>
              <div className="mt-16 flex gap-8">
                  <button className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-transform" onClick={() => setShowCallModal(false)}>✕</button>
              </div>
          </div>
      )}

      {/* Sidebar - Partner List */}
      <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.factoryList}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {partners.map(p => (
            <div 
              key={p.id} 
              onClick={() => setActivePartnerId(p.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-white ${activePartnerId === p.id ? 'bg-white border-l-4 border-indigo-600 shadow-sm' : 'border-l-4 border-transparent'}`}
            >
              <div className="relative">
                <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl bg-slate-200" />
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-white rounded-full ${p.status === 'ONLINE' ? 'bg-green-500' : p.status === 'BUSY' ? 'bg-orange-400' : 'bg-slate-400'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate">{p.name}</h3>
                <p className="text-[10px] text-slate-500 truncate">{p.role}</p>
              </div>
              {p.unreadCount > 0 && (
                <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{p.unreadCount}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#b2c7da]/20 relative"> 
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
           <div className="flex items-center gap-3">
              <img src={activePartner?.avatar} className="w-8 h-8 rounded-lg bg-slate-100" />
              <div>
                <h3 className="text-xs font-black text-slate-900">{activePartner?.name}</h3>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                   <span className={`w-1.5 h-1.5 rounded-full ${activePartner?.status === 'ONLINE' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                   {activePartner?.status === 'ONLINE' ? t.online : t.offline}
                </span>
              </div>
           </div>
           <div className="flex items-center gap-2">
               <button onClick={startQuickCall} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors">
                  📞
               </button>
               <button className="text-slate-400 hover:text-slate-600">
                  <span className="text-xl">⋮</span>
               </button>
           </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#9bbbd4]/10">
           {messages.map((msg) => {
             const isMe = msg.sender === 'USER';
             const isQC = msg.type === 'QC_REPORT';

             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                 {!isMe && (
                   <img src={activePartner?.avatar} className="w-8 h-8 rounded-lg bg-slate-200 mr-2 mt-1" />
                 )}
                 <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[9px] text-slate-500 mb-1 ml-1">{activePartner?.name}</span>}
                    
                    {/* QC Report Card Style */}
                    {isQC && msg.qcData ? (
                        <div className="bg-white rounded-2xl border border-indigo-100 shadow-md overflow-hidden min-w-[240px]">
                            <div className="bg-indigo-600 p-3 flex justify-between items-center">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">QC / Correction</span>
                                <span className="text-[9px] font-bold text-indigo-200">{msg.qcData.sampleRound}</span>
                            </div>
                            <div className="p-3">
                                {msg.qcData.image && (
                                    <div className="mb-3 rounded-lg overflow-hidden border border-slate-100">
                                        <img src={msg.qcData.image} className="w-full h-32 object-cover" />
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {msg.qcData.corrections.map((pt, i) => (
                                        <div key={i} className="flex gap-2 items-start">
                                            <span className="text-[10px] font-black text-red-500 mt-0.5">#{i+1}</span>
                                            <span className="text-xs text-slate-700 leading-tight">{pt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{t.qcStatusSent}</span>
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            </div>
                        </div>
                    ) : (
                        /* Standard Message Bubble */
                        <div className="flex items-end gap-1.5">
                            {isMe && <span className="text-[9px] text-slate-400 font-medium mb-1">{msg.timestamp}</span>}
                            <div className={`px-4 py-2.5 text-xs font-medium leading-relaxed shadow-sm relative ${
                            isMe 
                                ? 'bg-[#FEE500] text-slate-900 rounded-l-2xl rounded-tr-2xl' // Kakao Yellowish
                                : 'bg-white text-slate-800 rounded-r-2xl rounded-tl-2xl border border-slate-100'
                            }`}>
                            {msg.text}
                            </div>
                            {!isMe && <span className="text-[9px] text-slate-400 font-medium mb-1">{msg.timestamp}</span>}
                        </div>
                    )}
                 </div>
               </div>
             );
           })}
           {isTyping && (
             <div className="flex justify-start animate-pulse">
                <img src={activePartner?.avatar} className="w-8 h-8 rounded-lg bg-slate-200 mr-2 mt-1" />
                <div className="bg-white px-4 py-3 rounded-r-2xl rounded-tl-2xl border border-slate-100 flex gap-1 items-center">
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                   <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-200 relative">
           {showActionMenu && (
               <div className="absolute bottom-20 left-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 grid grid-cols-1 gap-1 w-48 animate-in slide-in-from-bottom-5 z-20">
                   <button 
                     onClick={() => { setShowQCModal(true); setShowActionMenu(false); }}
                     className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left"
                   >
                       <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">📝</span>
                       <span className="text-xs font-bold text-slate-700">{t.sendQC}</span>
                   </button>
               </div>
           )}

           <div className="relative flex items-end gap-2">
              <button 
                onClick={() => setShowActionMenu(!showActionMenu)}
                className={`p-3 transition-colors rounded-full ${showActionMenu ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <span className="text-xl transition-transform duration-200" style={{ transform: showActionMenu ? 'rotate(45deg)' : 'none' }}>⊕</span>
              </button>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t.chatPlaceholder}
                className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-100 resize-none h-[42px] max-h-24 overflow-hidden"
                style={{ height: '42px', minHeight: '42px' }}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className={`p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${inputText.trim() ? 'bg-[#FEE500] text-slate-900 hover:bg-[#FDD835]' : 'bg-slate-200 text-slate-400'}`}
              >
                Send
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
