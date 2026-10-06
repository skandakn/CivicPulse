import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  Square,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  X,
  Minus,
  Maximize2,
  Radio
} from 'lucide-react';
import { voiceChatService, ChatMessage } from '../../services/voiceChatService';
import { useApp } from '../../context/AppContext';

export const FloatingVoiceChatWidget: React.FC = () => {
  const { currentView, setCurrentView, isVoiceChatOpen, setIsVoiceChatOpen } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-floating-msg',
      sender: 'assistant',
      text: 'Namaskara! I am your 24/7 CivicPulse AI Voice Assistant. Speak into your mic or type about road hazards, BBMP complaints, or contractor warranties. I will reply aloud with voice.',
      timestamp: 'Just now',
      suggestedActions: [
        { label: '🚨 Report Pothole', action: 'report_hazard', view: 'REPORT' },
        { label: '🏗️ Check Contractor DLP', action: 'check_dlp', view: 'CONTRACTORS' },
        { label: '🗺️ God\'s Eye Radar', action: 'open_radar', view: 'GODS_EYE' },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speechRate] = useState<number>(1.0);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isVoiceChatOpen) {
      scrollToBottom();
    }
  }, [messages, isThinking, isVoiceChatOpen]);

  // Clean up speech when widget closes
  useEffect(() => {
    if (!isVoiceChatOpen) {
      voiceChatService.stopSpeaking();
      setIsSpeaking(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [isVoiceChatOpen]);

  // Web Speech Recognition Handler
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setRecognitionError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setRecognitionError(`Mic notice: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setRecognitionError('Microphone could not be accessed.');
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    voiceChatService.stopSpeaking();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsThinking(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      const replyText = await voiceChatService.generateReply(conversationHistory);

      const lowerReply = replyText.toLowerCase();
      const actions: ChatMessage['suggestedActions'] = [];
      if (lowerReply.includes('report') || lowerReply.includes('pothole') || lowerReply.includes('hazard')) {
        actions.push({ label: '🚨 Report Hazard', action: 'report', view: 'REPORT' });
      }
      if (lowerReply.includes('contractor') || lowerReply.includes('warranty') || lowerReply.includes('dlp')) {
        actions.push({ label: '🏗️ Audit DLP', action: 'dlp', view: 'CONTRACTORS' });
      }
      if (lowerReply.includes('radar') || lowerReply.includes('cctv') || lowerReply.includes('map')) {
        actions.push({ label: '🗺️ God\'s Eye', action: 'radar', view: 'GODS_EYE' });
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: actions.length > 0 ? actions : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);

      if (isVoiceEnabled) {
        voiceChatService.speakText(
          replyText,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          speechRate
        );
      }
    } catch (err) {
      console.error('[FloatingVoiceChat] Failed to generate AI reply:', err);
      setIsThinking(false);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I had a momentary connection hiccup. Please try asking again or explore the civic radar directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleReplayAudio = (text: string) => {
    voiceChatService.speakText(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      speechRate
    );
  };

  const handleStopSpeaking = () => {
    voiceChatService.stopSpeaking();
    setIsSpeaking(false);
  };

  const QUICK_QUESTIONS = [
    'Report 18cm pothole on Bellandur ORR',
    'Is KMV Infrastructures under DLP warranty?',
    'What are active hazards in Ward 150?',
    'Explain BBMP Clause 45.2 contractor liability',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-body select-none">
      {/* 1. Closed Pill Button (Matches BeatAhead style shown in user screenshot) */}
      {!isVoiceChatOpen ? (
        <button
          onClick={() => setIsVoiceChatOpen(true)}
          className="brut bg-[#C03A3A] hover:bg-[#a82e2e] text-white px-5 py-3 rounded-full flex items-center gap-3 cursor-pointer shadow-[5px_5px_0_0_#121210] border-[2.5px] border-[#121210] group transition-all transform hover:-translate-y-1"
          title="Open 24/7 CivicPulse Voice Assistant"
        >
          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
            <Mic className="w-4.5 h-4.5 stroke-[2.5]" />
          </span>
          <div className="text-left font-display">
            <div className="text-[10px] font-mono tracking-wider font-extrabold text-white/90 uppercase">
              24/7 CIVICPULSE
            </div>
            <div className="text-sm font-extrabold text-white leading-none">
              Voice Assistant
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        </button>
      ) : (
        /* 2. Open Floating Voice Chat Window */
        <div className="w-[360px] sm:w-[420px] max-w-[calc(100vw-32px)] brut bg-white border-[3px] border-[#121210] shadow-[8px_8px_0_0_#121210] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#121210] text-white p-3.5 border-b-[3px] border-[#121210] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 bg-[#C03A3A] border border-white/40 flex items-center justify-center text-white shrink-0">
                <Mic className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-sm text-white truncate">
                    24/7 CIVICPULSE
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold truncate">
                  Voice Assistant · Gemini 3.8
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  const next = !isVoiceEnabled;
                  setIsVoiceEnabled(next);
                  if (!next) handleStopSpeaking();
                }}
                className={`p-1.5 border border-white/30 text-xs font-bold transition-colors cursor-pointer ${
                  isVoiceEnabled ? 'bg-[#2E8C42] text-white' : 'bg-white/20 text-slate-300'
                }`}
                title={isVoiceEnabled ? 'Voice Output ON' : 'Voice Output MUTED'}
              >
                {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeaking}
                  className="px-2 py-1 bg-[#C03A3A] text-white border border-white/30 text-[10px] font-mono font-bold cursor-pointer animate-pulse"
                  title="Stop Audio"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              )}

              <button
                onClick={() => setIsVoiceChatOpen(false)}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 cursor-pointer"
                title="Minimize Assistant"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audio Visualizer Status Banner */}
          <div className="bg-[#191c1a] px-3 py-1.5 border-b-2 border-[#121210] text-white flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking
                    ? 'bg-amber-400 animate-ping'
                    : isListening
                    ? 'bg-red-500 animate-ping'
                    : isThinking
                    ? 'bg-blue-400 animate-pulse'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-[10px] font-bold text-slate-200 uppercase">
                {isSpeaking
                  ? 'SPEAKING ALOUD...'
                  : isListening
                  ? 'LISTENING TO MIC...'
                  : isThinking
                  ? 'GEMINI THINKING...'
                  : 'READY'}
              </span>
            </div>

            {/* Mini Waveform Bars */}
            <div className="flex items-center gap-0.5 h-3">
              {[30, 80, 100, 60, 90, 40].map((h, idx) => (
                <span
                  key={idx}
                  className={`w-0.5 rounded-xs transition-all duration-150 ${
                    isSpeaking
                      ? 'bg-[#E8A030] animate-pulse'
                      : isListening
                      ? 'bg-[#C03A3A] animate-pulse'
                      : 'bg-emerald-500/40'
                  }`}
                  style={{
                    height: isSpeaking || isListening ? `${(h * 0.7) % 12 + 3}px` : '3px',
                    animationDelay: `${idx * 80}ms`,
                  }}
                />
              ))}
            </div>
          </div>

          {recognitionError && (
            <div className="bg-red-100 border-b border-[#C03A3A] text-[#C03A3A] px-3 py-1.5 text-[10px] font-mono font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{recognitionError}</span>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div className="p-3 min-h-[260px] max-h-[340px] overflow-y-auto space-y-3 bg-[#FAFDFB]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-mono text-slate-400">
                    <span>{isUser ? 'YOU' : 'AI'}</span>
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[88%] p-3 border-2 border-[#121210] text-xs leading-relaxed ${
                      isUser
                        ? 'brut bg-[#CFE8D6] text-[#121210] shadow-[2px_2px_0_0_#121210]'
                        : 'brut bg-[#121210] text-[#F8FAFC] shadow-[2px_2px_0_0_#2E8C42]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-1.5">
                        <button
                          onClick={() => handleReplayAudio(msg.text)}
                          className="px-2 py-0.5 bg-[#2E8C42] hover:bg-[#257336] text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer"
                          title="Replay Voice Speech"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>LISTEN</span>
                        </button>

                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1">
                            {msg.suggestedActions.map((act, aIdx) => (
                              <button
                                key={aIdx}
                                onClick={() => {
                                  if (act.view) setCurrentView(act.view as any);
                                }}
                                className="px-1.5 py-0.5 bg-white/10 hover:bg-white/20 text-[#E8A030] text-[9px] font-mono font-bold border border-white/20 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex items-center gap-2 p-2 bg-[#CFE8D6]/40 border border-[#121210] text-[11px] font-mono font-bold text-[#121210]">
                <span className="w-2 h-2 rounded-full bg-[#2E8C42] animate-ping" />
                <span>Formulating voice answer...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1 overflow-x-auto text-[10px] font-mono">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-[#CFE8D6] text-[#121210] border border-[#121210] whitespace-nowrap cursor-pointer shrink-0 font-bold"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-white border-t-2 border-[#121210] flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 border-2 border-[#121210] brut-sm transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-[#C03A3A] text-white animate-pulse shadow-[0_0_8px_rgba(192,58,58,0.6)]'
                  : 'bg-[#CFE8D6] hover:bg-[#b2dec0] text-[#121210]'
              }`}
              title={isListening ? 'Stop Mic' : 'Speak into Microphone'}
            >
              {isListening ? <MicOff className="w-4 h-4 stroke-[2.5]" /> : <Mic className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={isListening ? 'Listening... Speak now!' : 'Ask or speak a road issue...'}
              className="flex-1 bg-slate-50 border-2 border-[#121210] px-2.5 py-2 font-body text-xs font-semibold text-[#121210] placeholder:text-slate-400 focus:outline-none focus:bg-white"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isThinking}
              className="px-3 py-2 bg-[#2E8C42] hover:bg-[#257336] disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-extrabold text-xs border-2 border-[#121210] brut-sm cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
