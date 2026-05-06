import React, { useState, useEffect, useRef } from 'react';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import { playSuccessSound } from '../utils/audio';

interface VisionQuestProps {
  objectiveWord: string;
  objectiveTranslation: string;
  onComplete: () => void;
  onBack: () => void;
  showOtto: (msg: string, type: 'explaining' | 'happy' | 'sad' | 'thinking', duration?: number) => void;
}

export const VisionQuest: React.FC<VisionQuestProps> = ({
  objectiveWord,
  objectiveTranslation,
  onComplete,
  onBack,
  showOtto
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraAccess(true);
        showOtto(`Vânătoare de comori! Găsește un/o ${objectiveTranslation} (${objectiveWord}) și apasă butonul când l-ai găsit!`, 'explaining', 5000);
      } catch (err) {
        console.error("Camera error:", err);
        setHasCameraAccess(false);
        showOtto('Nu am putut accesa camera. Poți sări peste acest pas.', 'sad', 4000);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFound = () => {
    hapticTap();
    setTimeout(() => {
      hapticSuccess();
      playSuccessSound();
      showOtto('Super! Ai găsit obiectul!', 'happy', 3000);
      onComplete();
    }, 300);
  };

  return (
    <div className="flex flex-col w-full h-full max-w-md mx-auto pt-6 px-4 pb-8">
      <div className="flex items-center mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1 text-center font-bold text-white text-lg">
          Vision Quest
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 w-full flex flex-col items-center text-center relative overflow-hidden">
          <h2 className="text-xl text-slate-300 font-medium mb-1">Găsește:</h2>
          <h1 className="text-4xl font-extrabold text-white mb-6 tracking-wide text-indigo-400">
            {objectiveWord}
          </h1>

          <div className="w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden mb-6 relative border-4 border-slate-700 shadow-inner">
            {hasCameraAccess === null ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                Se pornește camera...
              </div>
            ) : hasCameraAccess === false ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4">
                <span className="text-4xl mb-2">📷🚫</span>
                Fără acces la cameră
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {/* Targeting reticle overlay */}
                <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none rounded-2xl flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-white/50 rounded-xl relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-500 rounded-br-lg"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleFound}
            className="w-full py-4 rounded-2xl text-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:translate-y-1 active:border-b-0 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>📷</span> L-am găsit!
          </button>
          
          <button
            onClick={onComplete}
            className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-300"
          >
            Nu găsesc / Sari peste
          </button>
        </div>
      </div>
    </div>
  );
};
