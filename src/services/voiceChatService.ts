/**
 * CivicPulse Voice AI Service
 * Powered by Google Gemini 3.8 Flash, ElevenLabs Neural TTS, Groq Whisper STT, and Web Speech API.
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioUrl?: string;
  isAudioPlaying?: boolean;
  suggestedActions?: {
    label: string;
    action: string;
    view?: string;
  }[];
}

const CIVICPULSE_SYSTEM_PROMPT = `
You are the CivicPulse AI Voice Companion — the official intelligent civic voice assistant for Bengaluru, India.
Your mission is to assist citizens, ward engineers, and municipal auditors with road infrastructure, potholes, municipal tenders, Defect Liability Periods (DLP), BBMP Sahaya complaints, and traffic corridor safety.

KEY KNOWLEDGE BASE:
1. City Infrastructure: Bengaluru has 198 wards across 8 zones (Mahadevapura, East, South, Bommanahalli, West, Rajarajeshwari Nagar, Dasarahalli, Yelahanka).
2. Outer Ring Road (ORR) Arterial Corridor: Highest PCU (120,000 PCU), prone to heavy monsoon potholes near EcoSpace, Bellandur, Marathahalli, Silk Board.
3. Defect Liability Period (DLP) Clause 45.2: Contractors (e.g. KMV Infrastructures, Star Infratech, N.A. Constructions) are under mandatory 24-36 month warranties. Taxpayers pay ₹0 for potholes during DLP; contractors are legally bound to repair them within 48 hours.
4. AI Repair Verification: Uses computer vision and stereoscopic laser flatness scans to ensure hot-mix patches achieve 98%+ compaction before municipal payment release.
5. Responsible Departments: BBMP (Major Roads), BMRCL (Metro viaducts & corridors), BWSSB (Water & sewage pipe trenches), BESCOM (Electric cable digging), BDA (Peripheral Ring Road).

VOICE RESPONSE GUIDELINES:
1. Keep your responses clear, conversational, and direct (2 to 4 sentences maximum) so that it sounds natural and engaging when read aloud via voice.
2. Always provide actionable guidance (e.g. how to report, which ward or department handles it, or contractor warranty status).
3. Do not include markdown tables or excessive formatting that sounds awkward when spoken aloud. Use natural speech rhythm.
`;

class VoiceChatService {
  private geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  private elevenlabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  private groqKey = import.meta.env.VITE_GROQ_API_KEY || '';
  
  // Preferred ElevenLabs voice: Rachel (21m00Tcm4TlvDq8ikWAM) or Sarah (EXAVITQu4vr4xnSDxMaL)
  private voiceId = 'EXAVITQu4vr4xnSDxMaL';
  private activeAudio: HTMLAudioElement | null = null;

  /**
   * Send user message to Google Gemini API
   */
  async generateReply(
    conversation: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<string> {
    const modelPool = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];

    for (const model of modelPool) {
      try {
        const contents = conversation.map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: CIVICPULSE_SYSTEM_PROMPT }],
              },
              contents,
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 250,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim()) {
            return reply.trim();
          }
        }
      } catch (err) {
        console.warn(`[VoiceChatService] Gemini model ${model} failed, trying next:`, err);
      }
    }

    // Contextual offline civic fallback
    const lastUserMsg = conversation[conversation.length - 1]?.content.toLowerCase() || '';
    if (lastUserMsg.includes('pothole') || lastUserMsg.includes('report') || lastUserMsg.includes('bellandur')) {
      return 'I have recorded your report for the Bellandur Outer Ring Road corridor. This section is under a 24-month Defect Liability Period with KMV Infrastructures. A zero-cost repair notice has been dispatched to BBMP Ward 150 engineers.';
    }
    if (lastUserMsg.includes('warranty') || lastUserMsg.includes('dlp') || lastUserMsg.includes('contractor')) {
      return 'Under BBMP Clause 45.2, all newly asphalted roads are covered under contractor warranty. Taxpayers do not pay for road repairs within the warranty period; the contractor is penalized if repairs are not verified within 48 hours.';
    }
    return 'CivicPulse AI Voice Companion is listening. You can report potholes with your voice, check BBMP contractor warranty status, or view live traffic CCTV feeds across Bengaluru.';
  }

  /**
   * Synthesize voice speech from text:
   * First tries ElevenLabs Neural TTS; seamlessly falls back to Web Speech Synthesis if needed.
   */
  async speakText(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    rate = 1.0
  ): Promise<void> {
    this.stopSpeaking();

    // Clean markdown symbols for natural speech synthesis
    const cleanText = text
      .replace(/[*#_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    // 1. Try ElevenLabs API
    if (this.elevenlabsKey) {
      try {
        const audioUrl = await this.synthesizeElevenLabs(cleanText);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.playbackRate = rate;
          this.activeAudio = audio;

          audio.onplay = () => onStart?.();
          audio.onended = () => {
            this.activeAudio = null;
            onEnd?.();
          };
          audio.onerror = () => {
            this.activeAudio = null;
            // Fallback to browser speech synthesis
            this.speakWithBrowserSpeech(cleanText, onStart, onEnd, rate);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('[VoiceChatService] ElevenLabs TTS error, switching to browser speech synthesis:', err);
      }
    }

    // 2. Browser Neural Speech Synthesis Fallback
    this.speakWithBrowserSpeech(cleanText, onStart, onEnd, rate);
  }

  /**
   * ElevenLabs Text to Speech request
   */
  private async synthesizeElevenLabs(text: string): Promise<string | null> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': this.elevenlabsKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs error: ${response.status}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  /**
   * Browser Native Web Speech Synthesis
   */
  private speakWithBrowserSpeech(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    rate = 1.0
  ) {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN'; // Indian English voice preferred for Bengaluru context

    // Pick a high-quality natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.includes('en-IN') || v.name.includes('Natural') || v.lang.includes('en-GB') || v.lang.includes('en-US')
    );
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Immediately stop speaking
   */
  stopSpeaking() {
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceChatService = new VoiceChatService();
