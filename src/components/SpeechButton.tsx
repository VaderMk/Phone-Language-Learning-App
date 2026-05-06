import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listenForSpeech, isSpeechRecognitionSupported, type SpeechResult } from '../utils/speech';
import { hapticTap, hapticSuccess, hapticError } from '../utils/haptics';

interface SpeechButtonProps {
  /** The text the user should say (used for comparison). */
  expectedText: string;
  /** Language for recognition (default: de-DE). */
  lang?: string;
  /** Called with the result after speech is processed. */
  onResult: (result: SpeechResult) => void;
  /** Optional: compact mode for inline use. */
  compact?: boolean;
}

// Sound wave bars for the listening animation
const WAVE_BARS = 5;

export const SpeechButton: React.FC<SpeechButtonProps> = ({
  expectedText,
  lang = 'de-DE',
  onResult,
  compact = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastResult, setLastResult] = useState<SpeechResult | null>(null);

  const supported = isSpeechRecognitionSupported();

  const handleListen = useCallback(async () => {
    if (isListening || !supported) return;

    hapticTap();
    setIsListening(true);
    setLastResult(null);

    try {
      const result = await listenForSpeech(expectedText, lang);
      setLastResult(result);

      if (result.isMatch) {
        hapticSuccess();
      } else if (result.transcript) {
        hapticError();
      }

      onResult(result);
    } catch {
      onResult({ transcript: '', confidence: 0, isMatch: false });
    } finally {
      setIsListening(false);
    }
  }, [isListening, supported, expectedText, lang, onResult]);

  if (!supported) {
    return null; // Gracefully hide on unsupported browsers
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main mic button */}
      <motion.button
        onClick={handleListen}
        disabled={isListening}
        whileTap={{ scale: 0.9 }}
        className={`
          relative flex items-center justify-center rounded-full transition-all
          ${compact ? 'w-14 h-14' : 'w-20 h-20'}
          ${isListening
            ? 'bg-red-500/20 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
            : 'bg-indigo-500/20 border-2 border-indigo-400 hover:bg-indigo-500/30 active:bg-indigo-500/40'
          }
        `}
      >
        {/* Pulse ring when listening */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full border-2 border-red-400`}
            />
          )}
        </AnimatePresence>

        {/* Mic icon */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`
            ${compact ? 'w-6 h-6' : 'w-8 h-8'}
            ${isListening ? 'text-red-400' : 'text-indigo-300'}
          `}
          animate={isListening ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <rect x="9" y="1" width="6" height="12" rx="3" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </motion.svg>
      </motion.button>

      {/* Sound wave animation — shows when actively listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-end justify-center gap-[3px] h-8"
          >
            {Array.from({ length: WAVE_BARS }).map((_, i) => (
              <motion.div
                key={i}
                className="w-[4px] rounded-full bg-gradient-to-t from-red-500 to-amber-400"
                animate={{
                  height: [8, 20 + Math.random() * 12, 6, 24 + Math.random() * 8, 10],
                }}
                transition={{
                  duration: 0.6 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript feedback */}
      <AnimatePresence>
        {lastResult && lastResult.transcript && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-medium px-4 py-2 rounded-xl text-center max-w-[260px] ${
              lastResult.isMatch
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
            }`}
          >
            {lastResult.isMatch ? (
              <span>✓ <em>„{lastResult.transcript}"</em></span>
            ) : (
              <span>Am auzit: <em>„{lastResult.transcript}"</em></span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      {!compact && !isListening && !lastResult && (
        <span className="text-xs text-slate-500 font-medium">Apasă și vorbește</span>
      )}
      {isListening && (
        <span className="text-xs text-red-400 font-medium animate-pulse">Ascult…</span>
      )}
    </div>
  );
};
