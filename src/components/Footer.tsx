import React, { useState, useEffect } from 'react';
import { useNav } from '../context/NavContext';
import { Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useNav();
  const [stats, setStats] = useState({
    time: 0.024,
    queries: 4,
    memory: 1.12
  });

  useEffect(() => {
    setStats({
      time: parseFloat((0.012 + Math.random() * 0.025).toFixed(3)),
      queries: Math.floor(3 + Math.random() * 6),
      memory: parseFloat((1.05 + Math.random() * 0.2).toFixed(2))
    });
  }, [window.location.hash]);

  return (
    <footer className="glass-panel border-t border-violet-500/20 p-6 rounded-b-2xl flex flex-col items-center gap-5 text-center mt-auto">
      <div className="flex gap-4 flex-wrap justify-center text-xs font-semibold text-gray-400">
        <span className="hover:text-violet-400 cursor-pointer transition-colors" onClick={() => navigate('home')}>მთავარი</span>
        <span className="text-gray-600">|</span>
        <span className="hover:text-violet-400 cursor-pointer transition-colors" onClick={() => navigate('library')}>ბიბლიოთეკა</span>
        <span className="text-gray-600">|</span>
        <span className="hover:text-violet-400 cursor-pointer transition-colors" onClick={() => navigate('dating')}>გაცნობა</span>
        <span className="text-gray-600">|</span>
        <span className="hover:text-violet-400 cursor-pointer transition-colors" onClick={() => navigate('leaders')}>ლიდერები</span>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <div className="bg-[#050308] border border-violet-500/20 rounded px-2.5 py-1 text-[10px] font-bold text-green-400 shadow-[0_0_8px_rgba(16,185,129,0.2)] flex items-center gap-1">
          <Flame size={10} className="animate-pulse" />
          <span>რამბლერი [4.2k]</span>
        </div>
        <div className="bg-[#050308] border border-violet-500/20 rounded px-2.5 py-1 text-[10px] font-bold text-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.2)]">
          <span>რეიტინგი [9.8k]</span>
        </div>
        <div className="bg-[#050308] border border-violet-500/20 rounded px-2.5 py-1 text-[10px] font-bold text-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.2)]">
          <span>ინდექსი [CY 70]</span>
        </div>
      </div>

      <div className="text-xs text-gray-400">
        <div className="mb-1">
          &copy; GcmsSoc / ქართული ვებ პორტალი &bull; 2026
        </div>
        <div className="text-[10px] text-violet-400 flex gap-3 justify-center">
          <span>გენერაცია: {stats.time} წმ</span>
          <span>&bull;</span>
          <span>SQL: {stats.queries} მოთხოვნა</span>
          <span>&bull;</span>
          <span>მეხსიერება: {stats.memory} მბ</span>
        </div>
      </div>
    </footer>
  );
};
