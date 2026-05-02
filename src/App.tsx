import { useState, useEffect } from 'react';
import { words, type Word, puzzles } from './data/words';
import { GenderChallenge } from './components/GenderChallenge';
import { ProgressTracker } from './components/ProgressTracker';
import { SentencePuzzle } from './components/SentencePuzzle';
import { Otto, type OttoState } from './components/Otto';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

type ViewMode = 'words' | 'sentences';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('words');
  const [ottoState, setOttoState] = useState<OttoState>({ message: '', type: 'neutral', isVisible: false });

  const showOtto = (message: string, type: OttoState['type'] = 'explaining', duration = 3500) => {
    setOttoState({ message, type, isVisible: true });
    setTimeout(() => {
      setOttoState(prev => ({ ...prev, isVisible: false }));
    }, duration);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#818cf8', '#34d399', '#fbbf24', '#f87171']
    });
  };

  // --- UNIT 1: Words ---
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('languageApp_currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [errorsFound, setErrorsFound] = useState<Word[]>(() => {
    const saved = localStorage.getItem('languageApp_errorsFound');
    return saved ? JSON.parse(saved) : [];
  });

  const isWordsCompleted = currentIndex >= words.length;

  useEffect(() => {
    localStorage.setItem('languageApp_currentIndex', currentIndex.toString());
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('languageApp_errorsFound', JSON.stringify(errorsFound));
  }, [errorsFound]);

  const handleCorrect = () => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
    // Check for 5-in-a-row milestone
    if (newIndex % 5 === 0 && newIndex < words.length) {
      triggerConfetti();
      showOtto('Genial! Ești pe drumul cel bun. Continuă tot așa!', 'happy', 3000);
    } else if (newIndex === words.length) {
      triggerConfetti();
      showOtto('Felicitări! Ai terminat vocabularul!', 'happy', 4000);
    }
  };

  const handleWrong = (word: Word) => {
    setErrorsFound((prev) => {
      if (prev.find(w => w.id === word.id)) return prev;
      return [...prev, word];
    });
    showOtto(`Nu-i problemă! Cuvântul corect era "${word.article}". Gândește-te la o imagine cu acea culoare!`, 'explaining');
  };

  const handleResetWords = () => {
    setCurrentIndex(0);
    setErrorsFound([]);
    localStorage.removeItem('languageApp_currentIndex');
    localStorage.removeItem('languageApp_errorsFound');
  };

  // --- UNIT 2: Sentences ---
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(() => {
    const saved = localStorage.getItem('languageApp_currentPuzzleIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [puzzleErrors, setPuzzleErrors] = useState<number>(() => {
    const saved = localStorage.getItem('languageApp_puzzleErrors');
    return saved ? parseInt(saved, 10) : 0;
  });

  const isPuzzlesCompleted = currentPuzzleIndex >= puzzles.length;

  useEffect(() => {
    localStorage.setItem('languageApp_currentPuzzleIndex', currentPuzzleIndex.toString());
  }, [currentPuzzleIndex]);

  useEffect(() => {
    localStorage.setItem('languageApp_puzzleErrors', puzzleErrors.toString());
  }, [puzzleErrors]);

  const handlePuzzleCorrect = () => {
    const newIndex = currentPuzzleIndex + 1;
    setCurrentPuzzleIndex(newIndex);
    
    if (newIndex === puzzles.length) {
      triggerConfetti();
      showOtto('Gramatică perfectă! Ai terminat propozițiile!', 'happy', 4000);
    }
  };

  const handlePuzzleWrong = () => {
    setPuzzleErrors(prev => prev + 1);
    showOtto('Ups! În germană, verbul fuge mereu pe locul 2. Mai încearcă, poți să o faci!', 'explaining');
  };

  const handleResetPuzzles = () => {
    setCurrentPuzzleIndex(0);
    setPuzzleErrors(0);
    localStorage.removeItem('languageApp_currentPuzzleIndex');
    localStorage.removeItem('languageApp_puzzleErrors');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 sm:p-12 relative overflow-hidden font-sans">
      <Otto state={ottoState} />

      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />

      {/* Mode Toggle */}
      <div className="z-20 w-full max-w-sm flex bg-slate-800/80 p-1.5 rounded-full border border-slate-700/50 mb-8 mt-4 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setViewMode('words')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all",
            viewMode === 'words' ? "bg-indigo-600 text-white shadow-md scale-[1.02]" : "text-slate-400 hover:text-white"
          )}
        >
          1. Cuvinte
        </button>
        <button
          onClick={() => setViewMode('sentences')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all",
            viewMode === 'sentences' ? "bg-indigo-600 text-white shadow-md scale-[1.02]" : "text-slate-400 hover:text-white"
          )}
        >
          2. Propoziții
        </button>
      </div>

      <div className="z-10 w-full max-w-md flex flex-col flex-1 justify-center">
        <AnimatePresence mode="wait">
          {viewMode === 'words' && (
            <motion.div
              key="words-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col w-full h-full justify-center"
            >
              {!isWordsCompleted ? (
                <>
                  <ProgressTracker current={currentIndex} total={words.length} />
                  {currentIndex < words.length && (
                    <GenderChallenge
                      word={words[currentIndex]}
                      onCorrect={handleCorrect}
                      onWrong={handleWrong}
                    />
                  )}
                </>
              ) : (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Unitate Completă!</h2>
                  <p className="text-slate-300 mb-6">
                    Ai parcurs toate cele {words.length} cuvinte, în ritmul tău.
                    {errorsFound.length === 0 && (
                      <span className="block mt-2 text-green-400 font-bold">Incredibil! Nu ai făcut nicio greșeală!</span>
                    )}
                  </p>
                  
                  {errorsFound.length > 0 && (
                    <div className="w-full text-left mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      <p className="text-sm text-slate-400 mb-2">Cuvinte de revizuit:</p>
                      <ul className="space-y-2">
                        {errorsFound.map(word => (
                          <li key={word.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                            <span className="font-semibold text-white">{word.german}</span>
                            <span className={
                              word.article === 'der' ? 'text-blue-400 font-bold' :
                              word.article === 'die' ? 'text-red-400 font-bold' :
                              'text-green-400 font-bold'
                            }>{word.article}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={handleResetWords}
                    className="w-full py-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg active:scale-95"
                  >
                    Exersează din nou
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'sentences' && (
            <motion.div
              key="sentences-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col w-full h-full justify-center"
            >
              {!isPuzzlesCompleted ? (
                <>
                  <ProgressTracker current={currentPuzzleIndex} total={puzzles.length} />
                  {currentPuzzleIndex < puzzles.length && (
                    <SentencePuzzle
                      puzzle={puzzles[currentPuzzleIndex]}
                      onCorrect={handlePuzzleCorrect}
                      onWrong={handlePuzzleWrong}
                    />
                  )}
                </>
              ) : (
                <div className="bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Propoziții Complete!</h2>
                  <p className="text-slate-300 mb-6">
                    Munca ta a dat roade! Acum stăpânești ordinea corectă a verbelor.
                  </p>

                  <button
                    onClick={handleResetPuzzles}
                    className="w-full py-4 rounded-2xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg active:scale-95"
                  >
                    Exersează din nou
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
