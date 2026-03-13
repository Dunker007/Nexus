import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

export function VoiceControlWidget() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => (prev + finalTranscript).slice(-200)); // Keep last 200 chars
        }
      };

      recognition.onerror = (event: any) => {
        setError(event.error === 'no-speech' ? 'No speech detected' : 'Recognition error');
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Voice control not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Status Indicator */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isListening
          ? 'bg-cyan-500/10 border-cyan-500/30'
          : 'bg-[#12121a] border-white/5'
      }`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'
            }`} />
            {isListening && (
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-white/70">
            {isListening ? 'Listening...' : 'Voice Control'}
          </span>
        </div>
        {isListening && <Volume2 size={14} className="text-cyan-400 animate-pulse" />}
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl bg-[#12121a] border border-white/5 p-3">
        {!isSupported ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-red-400/60">
              <AlertCircle size={24} />
              <p className="text-xs font-mono text-center">Voice control not supported</p>
            </div>
          </div>
        ) : error && !isListening ? (
          <div className="flex items-center gap-2 text-orange-400/60">
            <AlertCircle size={14} />
            <span className="text-xs font-mono">{error}</span>
          </div>
        ) : transcript ? (
          <div className="text-xs text-white/80 leading-relaxed">{transcript}</div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-white/20">
              <Mic size={24} />
              <p className="text-[10px] font-mono uppercase tracking-wider">
                {isListening ? 'Speak now...' : 'Click to start'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={14} /> Stop
            </>
          ) : (
            <>
              <Mic size={14} /> Start
            </>
          )}
        </button>
        {transcript && (
          <button
            onClick={clearTranscript}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
