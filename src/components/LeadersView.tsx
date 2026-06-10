import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { Award, ChevronLeft, Coins, Star, Trophy } from 'lucide-react';

export const LeadersView: React.FC = () => {
  const { allUsers } = useAuth();
  const { navigate, goBack } = useNav();
  const [tab, setTab] = useState<'rating' | 'wealth'>('rating');

  const sortedUsers = [...allUsers].sort((a, b) => {
    if (tab === 'rating') return b.rating - a.rating;
    return b.coins - a.coins;
  });

  const getRankBadge = (index: number) => {
    if (index === 0) return <span title="ოქროს თასი"><Trophy size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" /></span>;
    if (index === 1) return <span title="ვერცხლის თასი"><Trophy size={18} className="text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.3)]" /></span>;
    if (index === 2) return <span title="ბრინჯაოს თასი"><Trophy size={18} className="text-amber-700 drop-shadow-[0_0_8px_rgba(180,83,9,0.3)]" /></span>;
    return <span className="text-xs font-bold text-gray-500 w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <button 
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
        onClick={goBack}
      >
        <ChevronLeft size={14} />
        <span>უკან</span>
      </button>

      <div className="flex items-center gap-2.5 border-b border-violet-500/10 pb-3">
        <Award className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">ლიდერები</h2>
      </div>

      {/* Tab selectors */}
      <div className="flex bg-violet-950/20 border border-violet-500/10 p-1 rounded-xl gap-1">
        <button 
          onClick={() => setTab('rating')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
            tab === 'rating' 
              ? 'bg-violet-500/20 text-white border border-violet-500/20 shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-violet-500/5'
          }`}
        >
          <Star size={13} className={tab === 'rating' ? 'text-violet-400' : 'text-gray-500'} />
          <span>ტოპ რეიტინგი</span>
        </button>
        <button 
          onClick={() => setTab('wealth')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
            tab === 'wealth' 
              ? 'bg-violet-500/20 text-white border border-violet-500/20 shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-violet-500/5'
          }`}
        >
          <Coins size={13} className={tab === 'wealth' ? 'text-amber-400' : 'text-gray-500'} />
          <span>ტოპ მდიდარი</span>
        </button>
      </div>

      {/* Leaders List */}
      <div className="space-y-3">
        {sortedUsers.map((u, idx) => (
          <div 
            key={u.id} 
            onClick={() => navigate('profile', { userId: u.id })}
            className={`glass-panel p-4 rounded-2xl border flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300 ${
              idx === 0 
                ? 'border-amber-500/25 bg-amber-500/[0.02] hover:border-amber-500/40 shadow-lg shadow-amber-500/[0.02]' 
                : idx === 1 
                ? 'border-gray-300/20 bg-gray-300/[0.01] hover:border-gray-300/35'
                : idx === 2 
                ? 'border-amber-700/20 bg-amber-700/[0.01] hover:border-amber-700/35'
                : 'border-violet-500/5'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex items-center justify-center w-6">
                {getRankBadge(idx)}
              </div>
              <img 
                src={u.avatar} 
                alt={u.username} 
                className={`w-10 h-10 rounded-full object-cover border group-hover:scale-105 transition-transform ${
                  idx === 0 
                    ? 'border-amber-400/50' 
                    : idx === 1 
                    ? 'border-gray-300/40' 
                    : idx === 2 
                    ? 'border-amber-700/40' 
                    : 'border-violet-500/20'
                }`} 
              />
              <div className="min-w-0">
                <span className="font-bold text-sm text-gray-200 group-hover:text-violet-300 transition-colors flex items-center gap-1.5">
                  {u.username}
                  {idx === 0 && (
                    <span className="text-[9px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/25 font-bold uppercase tracking-wider">
                      VIP
                    </span>
                  )}
                </span>
                <span className="block text-[10px] text-gray-500 mt-0.5 truncate max-w-[150px] sm:max-w-xs">
                  სტატუსი: "{u.status}"
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              {tab === 'rating' ? (
                <div className="flex items-center gap-1 bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/10 text-violet-400 font-bold text-xs">
                  <Star size={12} fill="#a78bfa" className="text-violet-400" />
                  <span>{u.rating}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10 text-amber-400 font-bold text-xs">
                  <Coins size={12} className="text-amber-400" />
                  <span>{u.coins}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
