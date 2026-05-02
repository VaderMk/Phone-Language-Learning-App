import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OttoState {
  message: string;
  type: 'neutral' | 'happy' | 'sad' | 'explaining' | 'thinking';
  isVisible: boolean;
}

interface OttoProps {
  state: OttoState;
}

export const OttoCoach: React.FC<OttoProps> = ({ state }) => {
  const getAvatar = () => {
    switch (state.type) {
      case 'happy': return '🎉';
      case 'thinking': return '🤔';
      case 'sad': return '🥺';
      case 'explaining': return '💡';
      default: return '🦉';
    }
  };

  return (
    <AnimatePresence>
      {state.isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-6 left-0 right-0 px-6 z-50 flex flex-col items-center pointer-events-none"
        >
          <div className="bg-indigo-50 text-indigo-900 font-bold px-6 py-4 rounded-3xl rounded-br-none shadow-2xl max-w-sm mb-2 relative border-2 border-indigo-200">
            {state.message}
            <div className="absolute -bottom-[10px] right-8 w-4 h-4 bg-indigo-50 border-b-2 border-r-2 border-indigo-200 transform rotate-45"></div>
          </div>
          <div className="flex justify-end w-full max-w-sm pr-4">
            <motion.div 
              animate={state.type === 'happy' ? { y: [0, -10, 0] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-indigo-300 overflow-hidden"
            >
              {getAvatar()}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
