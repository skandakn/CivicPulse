import React, { useState } from 'react';
import { Mic, X, MessageSquare, Volume2, Bot, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingVoiceChatWidget: React.FC = () => {
  const { currentView, setCurrentView } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  // If already on the dedicated VOICE_CHAT page, don't show duplicate floating button
  if (currentView === 'VOICE_CHAT' || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 select-none">
      <button
        onClick={() => setCurrentView('VOICE_CHAT')}
        className="brut bg-[#121210] hover:bg-[#1a1c1a] text-white px-4 py-2.5 flex items-center gap-2.5 cursor-pointer shadow-[4px_4px_0_0_#2E8C42] border-2 border-[#CFE8D6] group transition-transform hover:-translate-y-0.5"
        title="Open AI Voice Chatbot (Voice Replies)"
      >
        <span className="w-7 h-7 rounded-full bg-[#2E8C42] border border-white flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
          <Mic className="w-4 h-4" />
        </span>
        <div className="text-left font-mono">
          <div className="text-xs font-extrabold flex items-center gap-1.5 text-white">
            <span>AI VOICE AGENT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-[9px] text-[#CFE8D6] font-bold">
            TALK & REPLIES WITH VOICE
          </div>
        </div>
      </button>

      <button
        onClick={() => setIsDismissed(true)}
        className="p-1.5 bg-white border-2 border-[#121210] text-[#121210] hover:bg-slate-100 brut-sm cursor-pointer"
        title="Hide Voice Widget"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
