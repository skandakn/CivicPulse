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
  MapPin,
  Building2,
  CheckCircle2,
  Radio,
  FileText
} from 'lucide-react';
import { voiceChatService, ChatMessage } from '../../services/voiceChatService';
import { useApp } from '../../context/AppContext';

export const CivicPulseVoiceChat: React.FC = () => {
  const { setCurrentView, incidents, loadDemoCase } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Namaskara! I am your CivicPulse AI Voice Companion. You can speak into your microphone or type any question about road hazards, Defect Liability warranties, or BBMP Sahaya complaints. I will speak the answer aloud for you.',
      timestamp: 'Just now',
      suggestedActions: [
        { label: '🚨 Report Bellandur Pothole', action: 'report_hazard', view: 'REPORT' },
        { label: '🏗️ Check Contractor DLP', action: 'check_dlp', view: 'CONTRACTORS' },
        { label: '🗺️ Open God\'s Eye Map', action: 'open_radar', view: 'GODS_EYE' },
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      voiceChatService.stopSpeaking();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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
      setRecognitionError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Indian English for Bengaluru context

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
        console.warn('[VoiceChat] Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setRecognitionError(`Microphone notice: ${event.error}. Please check permissions.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[VoiceChat] Recognition init error:', err);
      setRecognitionError('Microphone could not be accessed.');
      setIsListening(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    // Stop active listening or speaking
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
      // Build conversation for Gemini
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.sender,
        content: m.text,
      }));

      // Generate response via Gemini
      const replyText = await voiceChatService.generateReply(conversationHistory);

      // Infer suggested civic actions
      const lowerReply = replyText.toLowerCase();
      const actions: ChatMessage['suggestedActions'] = [];
      if (lowerReply.includes('report') || lowerReply.includes('pothole') || lowerReply.includes('hazard')) {
        actions.push({ label: '🚨 Report This Hazard', action: 'report', view: 'REPORT' });
      }
      if (lowerReply.includes('contractor') || lowerReply.includes('warranty') || lowerReply.includes('dlp')) {
        actions.push({ label: '🏗️ Audit Contractor DLP', action: 'dlp', view: 'CONTRACTORS' });
      }
      if (lowerReply.includes('radar') || lowerReply.includes('cctv') || lowerReply.includes('map')) {
        actions.push({ label: '🗺️ Open God\'s Eye Radar', action: 'radar', view: 'GODS_EYE' });
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

      // Automatically reply with voice if enabled
      if (isVoiceEnabled) {
        voiceChatService.speakText(
          replyText,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          speechRate
        );
      }
    } catch (err) {
      console.error('[VoiceChat] Failed to generate AI reply:', err);
      setIsThinking(false);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I am experiencing a momentary connection issue. You can still report potholes or explore contractor DLPs directly.',
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
    'Report an 18cm pothole on Bellandur Outer Ring Road',
    'Is KMV Infrastructures under 24-month DLP warranty?',
    'What are the high-risk corridors in Ward 150?',
    'Explain BBMP Clause 45.2 contractor liability',
    'How does AI repair compaction verification work?',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* 1. Header Banner */}
      <div className="brut bg-white border-[3px] border-[#121210] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[5px_5px_0_0_#121210]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2E8C42] border-2 border-[#121210] brut-sm flex items-center justify-center text-white shrink-0">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-xl sm:text-2xl text-[#121210] tracking-tight">
                CIVICPULSE AI VOICE CHATBOT
              </h1>
              <span className="px-2 py-0.5 bg-[#2E8C42] text-white border border-[#121210] text-[10px] font-mono font-bold">
                GEMINI 3.8 FLASH
              </span>
            </div>
            <p className="text-xs text-[#121210]/70 font-mono mt-0.5 font-bold">
              Voice-Enabled Civic Helpline · BBMP Sahaya Redressal · DLP Warranty Verification
            </p>
          </div>
        </div>

        {/* Global Voice Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => {
              const next = !isVoiceEnabled;
              setIsVoiceEnabled(next);
              if (!next) handleStopSpeaking();
            }}
            className={`px-3 py-1.5 border-2 border-[#121210] brut-sm font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isVoiceEnabled ? 'bg-[#2E8C42] text-white' : 'bg-slate-200 text-[#121210]'
            }`}
            title={isVoiceEnabled ? 'Voice Replies Active' : 'Voice Replies Muted'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{isVoiceEnabled ? 'VOICE ON' : 'VOICE MUTED'}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="px-3 py-1.5 border-2 border-[#121210] bg-[#C03A3A] hover:bg-red-700 text-white brut-sm font-bold text-xs flex items-center gap-1.5 cursor-pointer animate-pulse"
              title="Stop Speaking"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP VOICE</span>
            </button>
          )}

          <button
            onClick={() => {
              voiceChatService.stopSpeaking();
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'assistant',
                  text: 'Conversation reset. How can I assist you with Bengaluru civic infrastructure or road repairs today?',
                  timestamp: 'Just now',
                },
              ]);
            }}
            className="p-2 border-2 border-[#121210] bg-white hover:bg-slate-100 text-[#121210] brut-sm cursor-pointer"
            title="Reset Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Voice State & Audio Waveform Visualizer */}
      <div className="brut bg-[#121210] border-[2.5px] border-[#121210] p-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[4px_4px_0_0_#2E8C42]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isSpeaking
                  ? 'bg-amber-400 animate-ping'
                  : isListening
                  ? 'bg-red-500 animate-ping'
                  : isThinking
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {isSpeaking
                ? 'VOICE AGENT SPEAKING...'
                : isListening
                ? 'LISTENING TO MICROPHONE...'
                : isThinking
                ? 'GEMINI 3.8 FLASH PROCESSING...'
                : 'VOICE AGENT READY'}
            </span>
          </div>

          <span className="hidden md:inline text-white/40">|</span>

          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>ELEVENLABS + BROWSER NEURAL SPEECH</span>
          </div>
        </div>

        {/* Dynamic Waveform Bars */}
        <div className="flex items-center gap-1 h-5 px-3 bg-black/60 border border-white/20">
          {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((h, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-xs transition-all duration-150 ${
                isSpeaking
                  ? 'bg-[#E8A030] animate-pulse'
                  : isListening
                  ? 'bg-[#C03A3A] animate-pulse'
                  : 'bg-[#2E8C42]/40'
              }`}
              style={{
                height: isSpeaking || isListening ? `${(h * 0.8) % 18 + 4}px` : '4px',
                animationDelay: `${idx * 70}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {recognitionError && (
        <div className="brut-sm bg-red-100 border-2 border-[#C03A3A] text-[#C03A3A] p-2.5 text-xs font-mono font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{recognitionError}</span>
        </div>
      )}

      {/* 3. Messages Chat Feed */}
      <div className="brut bg-white border-[3px] border-[#121210] p-4 sm:p-5 min-h-[420px] max-h-[580px] overflow-y-auto space-y-4 shadow-[4px_4px_0_0_#121210]">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                  {isUser ? 'YOU (CITIZEN)' : 'CIVICPULSE AI'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[80%] p-3.5 sm:p-4 border-2 border-[#121210] font-body text-sm leading-relaxed ${
                  isUser
                    ? 'brut bg-[#CFE8D6] text-[#121210] shadow-[3px_3px_0_0_#121210]'
                    : 'brut bg-[#121210] text-[#F8FAFC] shadow-[3px_3px_0_0_#2E8C42]'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Assistant Message Voice Replay & Action Chips */}
                {!isUser && (
                  <div className="mt-3 pt-2.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleReplayAudio(msg.text)}
                      className="px-2.5 py-1 bg-[#2E8C42] hover:bg-[#257336] text-white text-[11px] font-mono font-bold border border-white/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Speak Message Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>LISTEN VOICE</span>
                    </button>

                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.suggestedActions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => {
                              if (act.view) setCurrentView(act.view as any);
                            }}
                            className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[#E8A030] text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>{act.label}</span>
                            <ArrowRight className="w-3 h-3" />
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
          <div className="flex items-center gap-2 p-3 bg-[#CFE8D6]/40 border-2 border-[#121210] brut-sm max-w-sm">
            <div className="w-3 h-3 rounded-full bg-[#2E8C42] animate-ping" />
            <span className="font-mono text-xs font-bold text-[#121210]">
              Synthesizing response & formulating voice audio...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Suggestion Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] font-mono font-bold text-[#121210] uppercase shrink-0 px-1">
          SUGGESTIONS:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 text-[11px] font-mono font-bold bg-white hover:bg-[#CFE8D6] border-2 border-[#121210] brut-sm text-[#121210] whitespace-nowrap cursor-pointer transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 5. Input Bar with Live Mic Button */}
      <div className="brut bg-white border-[3px] border-[#121210] p-3 flex items-center gap-2.5 shadow-[5px_5px_0_0_#121210]">
        <button
          onClick={toggleListening}
          className={`p-3 border-2 border-[#121210] brut-sm transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-[#C03A3A] text-white animate-pulse shadow-[0_0_12px_rgba(192,58,58,0.6)]'
              : 'bg-[#CFE8D6] hover:bg-[#b2dec0] text-[#121210]'
          }`}
          title={isListening ? 'Click to stop listening' : 'Click to speak via microphone'}
        >
          {isListening ? <MicOff className="w-5 h-5 stroke-[2.5]" /> : <Mic className="w-5 h-5 stroke-[2.5]" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder={
            isListening
              ? 'Listening to your voice... Speak now!'
              : 'Type or speak: ask about potholes, DLP warranties, or BBMP Sahaya...'
          }
          className="flex-1 bg-slate-50 border-2 border-[#121210] px-3.5 py-2.5 font-body text-sm font-semibold text-[#121210] placeholder:text-slate-400 focus:outline-none focus:bg-white"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isThinking}
          className="px-4 py-2.5 bg-[#2E8C42] hover:bg-[#257336] disabled:opacity-40 disabled:cursor-not-allowed text-white font-display font-extrabold text-sm border-2 border-[#121210] brut-sm cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>SEND</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
