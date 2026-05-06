/**
 * Speech Recognition — Web Speech API Wrapper
 * 
 * Provides a clean React-friendly interface for voice input.
 * Compares spoken text against expected text using fuzzy matching.
 */

// TypeScript declarations for Web Speech API (not in lib.dom by default)
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  isMatch: boolean;
}

// ─── Feature Detection ──────────────────────────────────────

export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// ─── Fuzzy Match ────────────────────────────────────────────

/**
 * Normalize a string for comparison:
 * lowercase, trim, remove punctuation, collapse whitespace.
 */
const normalize = (s: string): string =>
  s.toLowerCase()
    .trim()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ');

/**
 * Levenshtein distance between two strings.
 * Used for fuzzy matching spoken text against expected.
 */
const levenshtein = (a: string, b: string): number => {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

/**
 * Check if spoken text is a close-enough match to the expected text.
 * Tolerance: ≤ 20% character errors (for accents, minor slips).
 */
export const isCloseMatch = (spoken: string, expected: string, tolerance = 0.2): boolean => {
  const a = normalize(spoken);
  const b = normalize(expected);
  if (a === b) return true;
  
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;
  
  return (dist / maxLen) <= tolerance;
};

// ─── Recognition Engine ─────────────────────────────────────

export const createRecognition = (lang = 'de-DE'): SpeechRecognitionInstance | null => {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) return null;

  const recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang;
  recognition.maxAlternatives = 3;

  return recognition;
};

/**
 * Listen for speech and return the best transcript.
 * Promise-based for easy async/await usage.
 * Auto-stops after speech ends or after a timeout.
 */
export const listenForSpeech = (
  expectedText: string,
  lang = 'de-DE',
  timeoutMs = 8000
): Promise<SpeechResult> => {
  return new Promise((resolve, reject) => {
    const recognition = createRecognition(lang);
    if (!recognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        recognition.abort();
        resolve({ transcript: '', confidence: 0, isMatch: false });
      }
    }, timeoutMs);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);

      // Check all alternatives for the best match
      const results = event.results[0];
      let bestMatch: SpeechResult = { transcript: '', confidence: 0, isMatch: false };

      for (let i = 0; i < results.length; i++) {
        const alt = results[i];
        const match = isCloseMatch(alt.transcript, expectedText);
        if (match && alt.confidence > bestMatch.confidence) {
          bestMatch = { transcript: alt.transcript, confidence: alt.confidence, isMatch: true };
        }
        // Keep the highest confidence result even if no match
        if (!bestMatch.isMatch && alt.confidence > bestMatch.confidence) {
          bestMatch = { transcript: alt.transcript, confidence: alt.confidence, isMatch: false };
        }
      }

      resolve(bestMatch);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);

      // 'no-speech' and 'aborted' are not real errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        resolve({ transcript: '', confidence: 0, isMatch: false });
      } else {
        reject(new Error(`Speech recognition error: ${event.error}`));
      }
    };

    recognition.onend = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ transcript: '', confidence: 0, isMatch: false });
      }
    };

    recognition.start();
  });
};
