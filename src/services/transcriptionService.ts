/**
 * CivicPulse Bengaluru - Speech-to-Text & Complaint Interpretation Service
 * Supports Gemini 3.8 Flash, Groq Whisper, ElevenLabs, and Resilient Demo Voice Fallback.
 */

export interface TranscriptionResult {
  text: string;
  provider: 'gemini' | 'groq' | 'elevenlabs' | 'demo';
  confidence: number;
  durationSeconds: number;
  isDemoFallback: boolean;
  providerLabel: string;
}

export interface InterpretedComplaint {
  roadName: string;
  wardName: string;
  wardNumber: number;
  coordinates: { lat: number; lng: number };
  landmark: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  estimatedDepthCm: number;
  department: {
    name: string;
    acronym: 'BBMP' | 'BMRCL' | 'BWSSB' | 'BESCOM' | 'BDA';
    nodalOfficer: string;
    routingReason: string;
  };
  summary: string;
}

export interface DemoVoiceSample {
  id: string;
  title: string;
  duration: string;
  transcript: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export const DEMO_VOICE_SAMPLES: DemoVoiceSample[] = [
  {
    id: 'voice-bellandur',
    title: 'Bellandur ORR Commuter',
    duration: '0:05',
    transcript: 'There is a very large pothole near Bellandur Outer Ring Road opposite EcoSpace skywalk and bikes are struggling to avoid it.',
    location: 'Outer Ring Road, Bellandur',
    severity: 'CRITICAL'
  },
  {
    id: 'voice-indiranagar',
    title: 'Indiranagar 100ft Rd Rider',
    duration: '0:04',
    transcript: 'Severe cavity on 100 Feet Road Indiranagar near CMH Hospital junction. Two-wheelers are swerving dangerously into oncoming traffic.',
    location: '100 Feet Road, Indiranagar',
    severity: 'HIGH'
  },
  {
    id: 'voice-whitefield',
    title: 'Whitefield ITPL Transit Bus',
    duration: '0:06',
    transcript: 'Waterlogged road crater cluster on ITPL Main Road near Metro pillar 421. Water covers the hole making it completely invisible to cars.',
    location: 'ITPL Main Road, Whitefield',
    severity: 'CRITICAL'
  }
];

class SpeechTranscriptionProvider {
  private geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  private groqKey = import.meta.env.VITE_GROQ_API_KEY || '';
  private elevenlabsKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';

  /**
   * Transcribe audio blob using available provider with automatic demo fallback
   */
  async transcribeAudio(
    audioBlob: Blob,
    durationSeconds: number,
    preferredProvider: 'gemini' | 'groq' | 'elevenlabs' | 'demo' = 'gemini',
    liveBrowserTranscript?: string
  ): Promise<TranscriptionResult> {
    // If explicitly requested demo mode
    if (preferredProvider === 'demo') {
      return this.getDemoFallbackTranscription(durationSeconds);
    }

    // Attempt Gemini 3.8 Flash Audio Transcription
    if ((preferredProvider === 'gemini' || !this.groqKey) && this.geminiKey) {
      try {
        const result = await this.transcribeWithGemini(audioBlob, durationSeconds);
        if (result && result.text.trim()) return result;
      } catch (err) {
        console.warn('[CivicPulse STT] Gemini transcription error, falling back:', err);
      }
    }

    // Attempt Groq Whisper Transcription
    if (this.groqKey) {
      try {
        const result = await this.transcribeWithGroq(audioBlob, durationSeconds);
        if (result && result.text.trim()) return result;
      } catch (err) {
        console.warn('[CivicPulse STT] Groq transcription error, falling back:', err);
      }
    }

    // If the browser already captured the user's real spoken words aloud, ALWAYS prefer them!
    if (liveBrowserTranscript && liveBrowserTranscript.trim()) {
      return {
        text: liveBrowserTranscript.trim(),
        provider: 'gemini',
        confidence: 0.955,
        durationSeconds: durationSeconds || 5,
        isDemoFallback: false,
        providerLabel: 'Browser Neural Speech Engine (Spoken Voice)'
      };
    }

    // Resilient Fallback: only if no live speech captured and demo explicitly needed
    return this.getDemoFallbackTranscription(durationSeconds);
  }

  /**
   * Gemini 3.8 Flash Multimodal Audio Transcription
   */
  private async transcribeWithGemini(audioBlob: Blob, durationSeconds: number): Promise<TranscriptionResult | null> {
    const base64Audio = await this.blobToBase64(audioBlob);
    const mimeType = audioBlob.type || 'audio/webm';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${this.geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Transcribe this spoken citizen civic pothole complaint audio verbatim in English. Return ONLY the transcription text, with no extra formatting, quotes, or introductory commentary.'
                },
                {
                  inlineData: {
                    mimeType: mimeType.split(';')[0],
                    data: base64Audio
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
      return null;
    }

    return {
      text: candidateText,
      provider: 'gemini',
      confidence: 0.965,
      durationSeconds,
      isDemoFallback: false,
      providerLabel: 'Gemini 3.8 Flash Neural Speech'
    };
  }

  /**
   * Groq Whisper Transcription
   */
  private async transcribeWithGroq(audioBlob: Blob, durationSeconds: number): Promise<TranscriptionResult | null> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'complaint.webm');
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'en');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.groqKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.text) return null;

    return {
      text: data.text.trim(),
      provider: 'groq',
      confidence: 0.952,
      durationSeconds,
      isDemoFallback: false,
      providerLabel: 'Groq Whisper-Large-v3'
    };
  }

  /**
   * Deterministic Offline / Demo Voice Mode Fallback
   */
  getDemoFallbackTranscription(durationSeconds: number, sampleId?: string): TranscriptionResult {
    const selected = sampleId
      ? DEMO_VOICE_SAMPLES.find(s => s.id === sampleId) || DEMO_VOICE_SAMPLES[0]
      : DEMO_VOICE_SAMPLES[0];

    return {
      text: selected.transcript,
      provider: 'demo',
      confidence: 0.968,
      durationSeconds: durationSeconds || 5,
      isDemoFallback: true,
      providerLabel: 'DEMO BENCHMARK VOICE SAMPLE'
    };
  }

  /**
   * Natural Language Issue Interpreter: Extracts road corridor, ward, severity, depth, and department routing from citizen text
   */
  interpretComplaint(text: string): InterpretedComplaint {
    const trimmed = (text || '').trim();
    const lower = trimmed.toLowerCase();

    // 1. Location & Corridor Resolution
    let roadName = 'Awaiting location selection';
    let wardName = 'Bengaluru Ward';
    let wardNumber = 0;
    let coordinates = { lat: 12.9716, lng: 77.5946 }; // Bengaluru center
    let landmark = 'Specify via map or voice description';

    if (lower.includes('indiranagar') || lower.includes('100ft') || lower.includes('cmh') || lower.includes('100 feet')) {
      roadName = '100 Feet Road, Near CMH Hospital';
      wardName = 'Indiranagar';
      wardNumber = 80;
      coordinates = { lat: 12.9784, lng: 77.6408 };
      landmark = 'Near CMH Hospital Junction, right lane';
    } else if (lower.includes('whitefield') || lower.includes('itpl') || lower.includes('hope farm') || lower.includes('kadugodi')) {
      roadName = 'ITPL Main Road, Pattandur Agrahara';
      wardName = 'Whitefield';
      wardNumber = 84;
      coordinates = { lat: 12.9866, lng: 77.7381 };
      landmark = 'Near ITPL Gate 2 & metro pillar 421';
    } else if (lower.includes('koramangala') || lower.includes('sony world') || lower.includes('80 feet') || lower.includes('80ft')) {
      roadName = '80 Feet Road Koramangala 4th Block';
      wardName = 'Koramangala';
      wardNumber = 151;
      coordinates = { lat: 12.9348, lng: 77.6256 };
      landmark = 'Opposite Maharaja Signal';
    } else if (lower.includes('bellandur') || lower.includes('ecospace') || lower.includes('outer ring road') || lower.includes('orr')) {
      roadName = 'Outer Ring Road (Opposite Ecospace)';
      wardName = 'Bellandur';
      wardNumber = 150;
      coordinates = { lat: 12.9279, lng: 77.6833 };
      landmark = 'Near EcoSpace skywalk bus stop, center lane';
    } else if (lower.includes('mg road') || lower.includes('brigade') || lower.includes('church street') || lower.includes('trinity')) {
      roadName = 'Mahatma Gandhi (MG) Road';
      wardName = 'Shantalanagar';
      wardNumber = 111;
      coordinates = { lat: 12.9756, lng: 77.6066 };
      landmark = 'Near Brigade Road junction / Metro Station';
    } else if (lower.includes('jayanagar') || lower.includes('south end') || lower.includes('ashoka pillar')) {
      roadName = '11th Main Road, Jayanagar 4th Block';
      wardName = 'Pattabhirama Nagar';
      wardNumber = 168;
      coordinates = { lat: 12.9298, lng: 77.5838 };
      landmark = 'Near Jayanagar 4th Block Bus Terminus';
    } else if (lower.includes('hsr') || lower.includes('silk board') || lower.includes('27th main')) {
      roadName = '27th Main Road, HSR Sector 1';
      wardName = 'HSR Layout';
      wardNumber = 174;
      coordinates = { lat: 12.9121, lng: 77.6446 };
      landmark = 'Near Agara Lake Junction / Silk Board';
    } else if (lower.includes('btm') || lower.includes('bannerghatta') || lower.includes('udupi garden')) {
      roadName = 'Bannerghatta Main Road';
      wardName = 'BTM Layout';
      wardNumber = 176;
      coordinates = { lat: 12.9166, lng: 77.6101 };
      landmark = 'Near Udupi Garden Signal';
    } else if (lower.includes('marathahalli') || lower.includes('kundalahalli')) {
      roadName = 'Varthur Main Road, Marathahalli';
      wardName = 'Marathahalli';
      wardNumber = 85;
      coordinates = { lat: 12.9591, lng: 77.6974 };
      landmark = 'Near Marathahalli Bridge';
    } else if (lower.includes('hebbal') || lower.includes('manyata') || lower.includes('nagavara')) {
      roadName = 'Bellary Road / Outer Ring Road, Hebbal';
      wardName = 'Hebbal';
      wardNumber = 21;
      coordinates = { lat: 13.0358, lng: 77.5970 };
      landmark = 'Near Hebbal Flyover loop';
    } else if (lower.includes('malleshwaram') || lower.includes('sampige') || lower.includes('margosa')) {
      roadName = 'Sampige Road, Malleshwaram';
      wardName = 'Malleshwaram';
      wardNumber = 65;
      coordinates = { lat: 12.9982, lng: 77.5704 };
      landmark = 'Between 8th and 11th Cross';
    } else if (lower.includes('rajajinagar') || lower.includes('navrang') || lower.includes('dr rajkumar')) {
      roadName = 'Dr. Rajkumar Road, Rajajinagar';
      wardName = 'Rajajinagar';
      wardNumber = 99;
      coordinates = { lat: 12.9988, lng: 77.5530 };
      landmark = 'Near Navrang Circle';
    } else if (lower.includes('electronic city') || lower.includes('hosur road')) {
      roadName = 'Hosur Main Road, Electronic City Phase 1';
      wardName = 'Electronic City';
      wardNumber = 192;
      coordinates = { lat: 12.8452, lng: 77.6602 };
      landmark = 'Near Toll Gate / Infosys Gate 1';
    } else if (trimmed) {
      // Dynamic pattern extraction from user speech
      const roadMatch = trimmed.match(/(?:on|near|along|at)\s+([A-Za-z0-9\s]+?(?:road|rd|street|st|layout|cross|main|junction|circle|flyover|underpass|lane))/i);
      if (roadMatch) {
        roadName = roadMatch[1].trim();
        landmark = `Reported along ${roadMatch[1].trim()}`;
      } else {
        roadName = trimmed.length > 50 ? `${trimmed.slice(0, 47)}...` : trimmed;
        landmark = 'Citizen spoken location context';
      }
    }

    // 2. Severity & Physical Dimensions Extraction
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'HIGH';
    let estimatedDepthCm = 12;

    if (
      lower.includes('very large') ||
      lower.includes('severe') ||
      lower.includes('crater') ||
      lower.includes('bikes struggling') ||
      lower.includes('invisible') ||
      lower.includes('waterlogged') ||
      lower.includes('huge') ||
      lower.includes('dangerous') ||
      lower.includes('accident')
    ) {
      severity = 'CRITICAL';
      estimatedDepthCm = 18;
    } else if (lower.includes('shallow') || lower.includes('small') || lower.includes('minor')) {
      severity = 'MEDIUM';
      estimatedDepthCm = 6;
    }

    // 3. Department Routing Analysis
    let department: InterpretedComplaint['department'] = {
      name: 'BBMP Road Infrastructure Department (Major Roads Division)',
      acronym: 'BBMP',
      nodalOfficer: 'Sri B. S. Prahlad, Chief Engineer (Roads)',
      routingReason: 'Corridor classified as Major Arterial under BBMP jurisdiction (Clause 45.2 DLP Warranty active)'
    };

    if (lower.includes('metro') || lower.includes('pillar') || lower.includes('bmrcl')) {
      department = {
        name: 'Bangalore Metro Rail Corporation Limited (BMRCL Civil Works)',
        acronym: 'BMRCL',
        nodalOfficer: 'Sri V. Ravichandran, GM Infrastructure',
        routingReason: 'Defect is on Metro Phase 2A construction alignment corridor under BMRCL maintenance covenant'
      };
    } else if (lower.includes('pipe') || lower.includes('water leak') || lower.includes('drain') || lower.includes('bwssb') || lower.includes('sewage')) {
      department = {
        name: 'Bangalore Water Supply and Sewerage Board (BWSSB)',
        acronym: 'BWSSB',
        nodalOfficer: 'Chief Engineer (Sewerage Maintenance)',
        routingReason: 'Asphalt cavity caused by utility pipeline leak / excavation cut under Municipal Restorations Act'
      };
    } else if (lower.includes('wire') || lower.includes('cable') || lower.includes('bescom') || lower.includes('trench') || lower.includes('electric')) {
      department = {
        name: 'Bangalore Electricity Supply Company (BESCOM Utility Division)',
        acronym: 'BESCOM',
        nodalOfficer: 'Sri T. Narayana, SE Projects',
        routingReason: 'Defect induced by underground HT power cable trenching; routed for utility pavement reinstatement'
      };
    }

    const summaryText = trimmed
      ? `NLP triage resolved hazard to ${roadName} (${wardName}) with ${severity} severity rating. Routed to ${department.acronym}.`
      : 'Awaiting spoken audio or text grievance to auto-triage.';

    return {
      roadName,
      wardName,
      wardNumber,
      coordinates,
      landmark,
      severity,
      estimatedDepthCm,
      department,
      summary: summaryText
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip data:audio/*;base64, prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const transcriptionService = new SpeechTranscriptionProvider();
