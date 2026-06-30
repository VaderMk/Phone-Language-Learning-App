import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { speakGerman } from '../utils/tts';
import { getAdventureLines } from '../data/grammar-practice';

interface Choice {
  text: string;
  isCorrect: boolean;
  errorMessage?: string;
}

interface DialogueStep {
  characterName: string;
  characterEmoji: string;
  germanText: string;
  translation: string;
  choices: Choice[];
}

const adventureScripts: Record<string, DialogueStep[]> = {
  u1_a1: [
    {
      characterName: 'Barista Klaus',
      characterEmoji: '👨‍🍳',
      germanText: 'Guten Morgen! Was trinken Sie?',
      translation: 'Bună dimineața! Ce beți?',
      choices: [
        { text: 'Ich trinke Kaffee', isCorrect: true },
        { text: 'Ich Kaffee trinke', isCorrect: false, errorMessage: 'Atenție la topică! Verbul "trinke" trebuie să stea pe locul 2 în propoziție.' },
        { text: 'Ich esse Kaffee', isCorrect: false, errorMessage: 'Kaffee înseamnă cafea. Cafeaua se bea (trinke), nu se mănâncă (esse)!' }
      ]
    },
    {
      characterName: 'Barista Klaus',
      characterEmoji: '👨‍🍳',
      germanText: 'Sehr gut. Und was essen Sie?',
      translation: 'Foarte bine. Și ce mâncați?',
      choices: [
        { text: 'Ich esse einen Apfel', isCorrect: true },
        { text: 'Ich trinke einen Apfel', isCorrect: false, errorMessage: 'Un măr (Apfel) se mănâncă (esse), nu se bea (trinke).' },
        { text: 'Ich einen Apfel esse', isCorrect: false, errorMessage: 'Nu uita! Verbul "esse" trebuie să fie mereu pe locul 2.' }
      ]
    }
  ],
  u2_a1: [
    {
      characterName: 'Frau Schmidt',
      characterEmoji: '👵',
      germanText: 'Hallo! Hast du einen Hund?',
      translation: 'Salut! Ai un câine?',
      choices: [
        { text: 'Ja, ich habe einen Hund', isCorrect: true },
        { text: 'Ich einen Hund habe', isCorrect: false, errorMessage: 'Verbul "habe" (am) trebuie așezat pe locul 2!' },
        { text: 'Nein, ich trinke einen Hund', isCorrect: false, errorMessage: 'Nu poți "bea" un câine! Folosește "habe" (a avea).' }
      ]
    }
  ]
};

// Fallback script if the node doesn't have one defined yet
const fallbackScript: DialogueStep[] = [
  {
    characterName: 'Ghidi',
    characterEmoji: '🎒',
    germanText: 'Hallo! Bist du bereit?',
    translation: 'Salut! Ești pregătit?',
    choices: [
      { text: 'Ja!', isCorrect: true },
      { text: 'Nein...', isCorrect: false, errorMessage: 'Curaj! E doar un exercițiu de probă.' }
    ]
  }
];

interface AdventureModeProps {
  nodeId: string;
  onComplete: () => void;
  showOtto: (msg: string, type: 'explaining' | 'sad' | 'happy' | 'thinking') => void;
}

export const AdventureMode: React.FC<AdventureModeProps> = ({ nodeId, onComplete, showOtto }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generated, setGenerated] = useState<DialogueStep[] | null>(null);

  const hasScript = Boolean(adventureScripts[nodeId]);

  // For nodes without a hand-written story, build a comprehension dialogue
  // from real example sentences ("read the German, pick the meaning").
  useEffect(() => {
    if (hasScript) return;
    let active = true;
    getAdventureLines(nodeId).then((lines) => {
      if (!active || lines.length === 0) return;
      setGenerated(
        lines.map((line) => ({
          characterName: 'Otto',
          characterEmoji: '🦉',
          germanText: line.de,
          translation: line.ro,
          choices: line.options.map((o) => ({
            text: o.text,
            isCorrect: o.correct,
            errorMessage: 'Nu chiar. Recitește propoziția germană și ascult-o din nou.',
          })),
        })),
      );
    });
    return () => {
      active = false;
    };
  }, [nodeId, hasScript]);

  const script = adventureScripts[nodeId] || generated || fallbackScript;
  const step = script[currentStepIndex];

  useEffect(() => {
    // Small delay to feel natural before speaking
    const timer = setTimeout(() => {
      speakGerman(step.germanText);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentStepIndex, step]);

  const handleChoice = (choice: Choice) => {
    // Scripted choices are German, so speak them. Generated choices are the
    // Romanian meaning — speaking those with a German voice would be gibberish.
    if (hasScript) speakGerman(choice.text);

    if (choice.isCorrect) {
      if (currentStepIndex < script.length - 1) {
        setTimeout(() => setCurrentStepIndex((prev) => prev + 1), 1000);
      } else {
        setTimeout(() => onComplete(), 1000);
      }
    } else {
      showOtto(choice.errorMessage || 'Mai încearcă o dată!', 'explaining');
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-4 px-4 pb-12">
      <AnimatePresence mode="wait">
        <motion.div 
          key={`dialog-${currentStepIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex flex-col items-center flex-1"
        >
          {/* Character avatar */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center text-6xl mb-4 border-4 border-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] relative"
          >
            {step.characterEmoji}
          </motion.div>
          <h3 className="text-xl font-bold text-violet-400 mb-6">{step.characterName}</h3>
          
          {/* Chat bubble */}
          <div className="bg-slate-800 p-6 rounded-3xl mb-auto w-full relative before:content-[''] before:absolute before:-top-4 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-slate-800 shadow-xl">
            <h2 className="text-2xl font-black text-white text-center mb-2">{step.germanText}</h2>
            <p className="text-slate-400 text-center text-sm font-medium">{step.translation}</p>
            <button 
              onClick={() => speakGerman(step.germanText)} 
              className="absolute top-3 right-4 text-slate-500 hover:text-white p-2"
            >
              🔊
            </button>
          </div>

          {/* Choices */}
          <div className="flex flex-col w-full gap-4 mt-8">
            {step.choices.map((choice, i) => (
              <motion.button 
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChoice(choice)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-5 px-6 rounded-2xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all text-left flex items-center justify-between shadow-md"
              >
                <span className="text-lg">{choice.text}</span>
                <span className="text-2xl opacity-40">💬</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
