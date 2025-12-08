export { };

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }

    // Basic type definitions if strict typing is desired later
    interface SpeechRecognitionEvent extends Event {
        resultIndex: number;
        results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionResultList {
        [index: number]: SpeechRecognitionResult;
        length: number;
    }

    interface SpeechRecognitionResult {
        [index: number]: SpeechRecognitionAlternative;
        isFinal: boolean;
        length: number;
    }

    interface SpeechRecognitionAlternative {
        transcript: string;
        confidence: number;
    }
}
