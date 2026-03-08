import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { getGenAI } from '../services/geminiService';
import { Modality, LiveServerMessage } from '@google/genai';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const startListening = async () => {
    try {
      setIsConnecting(true);
      const ai = getGenAI();
      
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        callbacks: {
          onopen: () => console.log('Live API connected'),
          onmessage: (msg: LiveServerMessage) => console.log('Live API message:', msg),
          onclose: () => console.log('Live API closed'),
          onerror: (err: any) => console.error('Live API error:', err)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful morning digest assistant. You can read the digest to the user or answer their questions.",
        },
      });

      processor.onaudioprocess = (e) => {
        if (!isListening) return;
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        sessionPromise.then((session) => {
          session.sendRealtimeInput({
            media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        });
      };

      const session = await sessionPromise;
      sessionRef.current = session;
      
      // We don't have full audio playback implemented here for simplicity, 
      // but we would handle onmessage to play audio chunks.
      
      setIsConnecting(false);
      setIsListening(true);
    } catch (e) {
      console.error("Error starting voice assistant:", e);
      setIsConnecting(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (sessionRef.current) {
      // sessionRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={isConnecting}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isListening ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="w-6 h-6 text-white" />
        ) : (
          <Mic className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
