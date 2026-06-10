import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { Heart, ChevronLeft, Search, Mail, Send, Check } from 'lucide-react';

export const DatingView: React.FC = () => {
  const { allUsers, currentUser } = useAuth();
  const { navigate, goBack } = useNav();
  
  const [searchSex, setSearchSex] = useState<'Male' | 'Female'>('Female');
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(30);
  const [searchCity, setSearchCity] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<User[]>([]);

  // Messaging Modal State
  const [activeMessageUser, setActiveMessageUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = allUsers.filter(u => {
      if (currentUser && u.id === currentUser.id) return false;
      
      const sexMatch = u.sex === searchSex;
      const ageMatch = u.age >= minAge && u.age <= maxAge;
      const cityMatch = searchCity.trim() 
        ? u.city.toLowerCase().includes(searchCity.trim().toLowerCase())
        : true;
        
      return sexMatch && ageMatch && cityMatch;
    });

    setResults(filtered);
    setSearched(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    setSentSuccess(true);
    setMessageText('');
    setTimeout(() => {
      setSentSuccess(false);
      setActiveMessageUser(null);
    }, 2000);
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
        <Heart className="text-pink-500 w-5 h-5 animate-pulse" />
        <h2 className="text-lg font-bold text-gray-100">გაცნობა</h2>
      </div>

      <form onSubmit={handleSearch} className="glass-panel p-5 rounded-2xl border border-violet-500/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium block">ვეძებ</label>
            <select 
              className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 focus:bg-[#161127] transition-all"
              value={searchSex}
              onChange={e => setSearchSex(e.target.value as 'Male' | 'Female')}
            >
              <option value="Female">გოგონებს</option>
              <option value="Male">ბიჭებს</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium block">ქალაქი</label>
            <input
              type="text"
              className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
              placeholder="მაგ. თბილისი"
              value={searchCity}
              onChange={e => setSearchCity(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium block">ასაკი -დან</label>
            <input
              type="number"
              className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/40 text-gray-200 transition-colors"
              value={minAge}
              onChange={e => setMinAge(parseInt(e.target.value) || 18)}
              min="18"
              max="99"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium block">-მდე</label>
            <input
              type="number"
              className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/40 text-gray-200 transition-colors"
              value={maxAge}
              onChange={e => setMaxAge(parseInt(e.target.value) || 30)}
              min="18"
              max="99"
            />
          </div>
        </div>

        <button type="submit" className="liquid-btn w-full py-3 rounded-xl font-bold text-xs md:text-sm text-white flex items-center justify-center gap-2">
          <Search size={16} />
          <span>ძებნა</span>
        </button>
      </form>

      {searched && (
        <div className="space-y-3.5">
          <h3 className="text-sm font-extrabold text-violet-400 tracking-wider uppercase border-b border-violet-500/10 pb-2">
            ძებნის შედეგები ({results.length})
          </h3>

          <div className="space-y-3">
            {results.length === 0 ? (
              <div className="glass-panel p-6 text-center text-gray-500 text-xs rounded-2xl border border-violet-500/5">
                მომხმარებლები მოცემული კრიტერიუმით ვერ მოიძებნა.
              </div>
            ) : (
              results.map(u => (
                <div 
                  key={u.id} 
                  className="glass-panel p-4 rounded-2xl border border-violet-500/5 hover:border-violet-500/20 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
                  onClick={() => navigate('profile', { userId: u.id })}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={u.avatar} 
                      alt={u.username} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/30 group-hover:scale-105 transition-transform" 
                    />
                    <div className="min-w-0">
                      <span className="block text-sm font-bold text-gray-200 group-hover:text-violet-300 transition-colors">
                        {u.username}, {u.age} წლის
                      </span>
                      <span className="block text-[10px] text-gray-500 mt-0.5">
                        {u.city} &bull; რეიტინგი: {u.rating}
                      </span>
                      <span className="block text-[10px] text-pink-400 mt-1 italic font-medium truncate max-w-[180px] sm:max-w-xs">
                        "{u.status}"
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0" onClick={(e) => {
                    e.stopPropagation();
                    if (!currentUser) {
                      navigate('login');
                    } else {
                      setActiveMessageUser(u);
                    }
                  }}>
                    <button className="liquid-btn px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                      <Mail size={13} />
                      <span>წერილი</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Message Modal Overlay */}
      {activeMessageUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel border border-violet-500/20 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-violet-500/10 pb-2">
              <span className="font-bold text-xs md:text-sm text-gray-200">წერილის გაგზავნა: {activeMessageUser.username}</span>
              <button 
                onClick={() => setActiveMessageUser(null)}
                className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded-lg hover:bg-red-500/5 transition-all"
              >
                გაუქმება
              </button>
            </div>

            {sentSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-emerald-400 text-center gap-2 animate-fade-in">
                <Check size={36} className="text-emerald-400 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20" />
                <span className="text-xs font-bold">შეტყობინება წარმატებით გაიგზავნა!</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <textarea
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors min-h-[100px] resize-none"
                  placeholder={`მისწერე პირადი შეტყობინება ${activeMessageUser.username}-ს...`}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                />
                <button type="submit" className="liquid-btn w-full py-2.5 rounded-xl font-bold text-xs md:text-sm text-white flex items-center justify-center gap-1.5">
                  <Send size={13} />
                  <span>გაგზავნა</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
