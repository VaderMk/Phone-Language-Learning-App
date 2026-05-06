import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { hapticTap, hapticSuccess } from '../utils/haptics';
import { playSuccessSound } from '../utils/audio';

interface Message {
  id: string;
  sender: 'otto' | 'user';
  text: string;
}

export const OttoChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a scenario
  useEffect(() => {
    setMessages([
      { id: '1', sender: 'otto', text: 'Guten Tag! Eu sunt Otto, partenerul tău de conversație.' },
      { id: '2', sender: 'otto', text: 'Hai să exersăm! Sunt ospătar la un restaurant. Ce dorești să comanzi?' }
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    hapticTap();
    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');

    // Simulate AI response logic
    setTimeout(() => {
      const lower = newUserMsg.text.toLowerCase();
      let reply = '';
      
      if (lower.includes('bitte') && (lower.includes('wasser') || lower.includes('kaffee') || lower.includes('bier') || lower.includes('apfel'))) {
        reply = 'Perfect! Comanda ta a fost preluată. 🍔 E foarte bine că ai folosit "bitte".';
        hapticSuccess();
        playSuccessSound();
      } else if (lower.includes('wasser') || lower.includes('kaffee')) {
        reply = 'Am înțeles comanda. Dar nu uita să adaugi "bitte" (vă rog) la final pentru a fi politicos!';
      } else {
        reply = 'Hmm, nu sunt sigur că am înțeles. Încearcă ceva simplu, cum ar fi "Wasser, bitte" (Apă, vă rog).';
      }
      
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'otto', text: reply }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans">
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center shadow-md">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white active:scale-95 transition-transform">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 text-center font-bold text-white text-lg flex items-center justify-center gap-2">
          <span>🦉</span> Chat cu Otto
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-2xl text-[15px] shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Scrie-i lui Otto..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-5 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:active:scale-100 active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
