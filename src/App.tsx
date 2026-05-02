import { useState, useEffect } from 'react';
import { words, type Word } from './data/words';
import { GenderChallenge } from './components/GenderChallenge';
import { ProgressTracker } from './components/ProgressTracker';
import { motion } from 'framer-motion';

function App() {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = localStorage.getItem('languageApp_currentIndex');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [errorsFound, setErrorsFound] = useState<Word[]>(() => {
    const saved = localStorage.getItem('languageApp_errorsFound');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('languageApp_currentIndex', currentIndex.toString());
    if (currentIndex >= words.length) {
      setIsCompleted(true);
    }
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('languageApp_errorsFound', JSON.stringify(errorsFound));
  }, [errorsFound]);

  const handleCorrect = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleWrong = (word: Word) => {
    setErrorsFound((prev) => {
      // Prevent duplicates
      if (prev.find(w => w.id === word.id)) return prev;
      return [...prev, word];
    });
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setErrorsFound([]);
    setIsCompleted(false);
    localStorage.removeItem('languageApp_currentIndex');
    localStorage.removeItem('languageApp_errorsFound');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-500/20 rounded-full blur-3xl" />

      <div className="z-10 w-full max-w-md flex flex-col h-full justify-center">
        {!isCompleted ? (
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-700/50 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Challenge Complete!</h2>
            <p className="text-slate-300 mb-6">
              You've completed all {words.length} words.
              {errorsFound.length > 0 ? (
                <span className="block mt-2 text-rose-400">
                  You had {errorsFound.length} mistakes. Keep practicing!
                </span>
              ) : (
                <span className="block mt-2 text-green-400">
                  Perfect score! Amazing job!
                </span>
              )}
            </p>
            
            {errorsFound.length > 0 && (
              <div className="w-full text-left mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase">Words to review:</h3>
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
              onClick={handleReset}
              className="w-full py-4 rounded-xl text-lg font-bold transition-all transform active:scale-95 shadow-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              Start Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
