import { useState, useEffect } from 'react';
import { words, type Word, puzzles } from './data/words';
import { GenderChallenge } from './components/GenderChallenge';
import { ProgressTracker } from './components/ProgressTracker';
import { SentencePuzzle } from './components/SentencePuzzle';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

type ViewMode = 'words' | 'sentences';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('words');

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
    setCurrentIndex((prev) => prev + 1);
  };

  const handleWrong = (word: Word) => {
    setErrorsFound((prev) => {
      if (prev.find(w => w.id === word.id)) return prev;
      return [...prev, word];
    });
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
    setCurrentPuzzleIndex(prev => prev + 1);
  };

  const handlePuzzleWrong = () => {
    setPuzzleErrors(prev => prev + 1);
  };

  const handleResetPuzzles = () => {
    setCurrentPuzzleIndex(0);
    setPuzzleErrors(0);
    localStorage.removeItem('languageApp_currentPuzzleIndex');
    localStorage.removeItem('languageApp_puzzleErrors');
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />

      {/* Mode Toggle */}
      <div className="z-20 w-full max-w-sm flex bg-slate-800/80 p-1 rounded-full border border-slate-700/50 mb-8 mt-4 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setViewMode('words')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all",
            viewMode === 'words' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
          )}
        >
          1. Cuvinte
        </button>
        <button
          onClick={() => setViewMode('sentences')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all",
            viewMode === 'sentences' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
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
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Unitate Completă!</h2>
                  <p className="text-slate-300 mb-6">
                    Ai parcurs toate cele {words.length} cuvinte.
                    {errorsFound.length > 0 ? (
                      <span className="block mt-2 text-rose-400">Ai avut {errorsFound.length} greșeli.</span>
                    ) : (
                      <span className="block mt-2 text-green-400">Scor perfect!</span>
                    )}
                  </p>
                  
                  {errorsFound.length > 0 && (
                    <div className="w-full text-left mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                      <ul className="space-y-2">
                        {errorsFound.map(word => (
                          <li key={word.id} className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
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
                    className="w-full py-4 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Reia exercițiul
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
                <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Propoziții Complete!</h2>
                  <p className="text-slate-300 mb-6">
                    Ai terminat de ordonat toate cele {puzzles.length} propoziții.
                    {puzzleErrors > 0 ? (
                      <span className="block mt-2 text-rose-400">Ai greșit regula Verbului (poziția 2) de {puzzleErrors} ori.</span>
                    ) : (
                      <span className="block mt-2 text-green-400">Te-ai descurcat excelent, gramatică perfectă!</span>
                    )}
                  </p>

                  <button
                    onClick={handleResetPuzzles}
                    className="w-full py-4 rounded-xl text-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Reia propozițiile
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
