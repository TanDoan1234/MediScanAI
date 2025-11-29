import React, { useState, useEffect } from 'react';
import { X, Zap, ScanLine } from 'lucide-react';

export default function ScanOverlay({ onClose, onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return prev + 4; 
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-between py-6 animate-in fade-in duration-200">
      <div className="flex justify-between w-full px-6 pt-4">
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
          <X className="w-6 h-6" />
        </button>
        <button className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
          <Zap className="w-6 h-6 fill-current" />
        </button>
      </div>
      <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-teal-500/30 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-900/50"></div>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle className="text-teal-500/20 stroke-current" strokeWidth="4" fill="none" cx="50" cy="50" r="48" />
          <circle className="text-teal-400 transition-[stroke-dashoffset] duration-100 ease-linear stroke-current" strokeWidth="4" strokeLinecap="round" fill="none" cx="50" cy="50" r="48" strokeDasharray="301.59" strokeDashoffset={301.59 - (progress / 100) * 301.59} />
        </svg>
        <div className="absolute w-full h-1 bg-teal-400/80 shadow-[0_0_10px_rgba(45,212,191,0.8)] animate-[scan-line_1.5s_ease-in-out_infinite]"></div>
        <div className="z-10 flex flex-col items-center justify-center">
          <ScanLine className="w-16 h-16 text-teal-300 animate-pulse mb-2" />
          <span className="text-teal-100 text-lg font-medium">{progress}%</span>
        </div>
      </div>
      <div className="flex flex-col items-center w-full px-6 pb-6">
        <span className="text-white text-base font-medium mb-8 animate-pulse">Đang quét AI...</span>
        <div className="flex justify-center w-full items-center">
          <button className="w-18 h-18 p-1 bg-transparent rounded-full border-4 border-white flex items-center justify-center shadow-lg transform active:scale-95 transition">
            <div className="w-14 h-14 bg-white rounded-full"></div>
          </button>
        </div>
      </div>
    </div>
  );
}

