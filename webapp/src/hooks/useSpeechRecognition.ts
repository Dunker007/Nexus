import { useState, useEffect, useRef, useCallback } from 'react';

// Define minimal types here, deeper types will be in @/types
interface UseSpeechRecognitionProps {
    onResult?: (transcript: string) => void;
    onEnd?: () => void;
    continuous?: boolean;
    lang?: string;
}

export function useSpeechRecognition({
    onResult,
    onEnd,
    continuous = false,
    lang = 'en-US'
}: UseSpeechRecognitionProps = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef<any>(null); // Keeping any for now to avoid compilation blocks

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = continuous;
            recognition.interimResults = true;
            recognition.lang = lang;

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
                if (onResult) onResult(transcriptText);
            };

            recognition.onend = () => {
                setIsListening(false);
                if (onEnd) onEnd();
            };

            recognitionRef.current = recognition;
        }
    }, [continuous, lang, onResult, onEnd]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error('Speech recognition start failed:', e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        toggleListening,
        hasSupport: typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
}
