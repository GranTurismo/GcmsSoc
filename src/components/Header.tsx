import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { useDB } from '../context/DBContext';
import { 
  Sparkles, LogIn, UserPlus, LogOut, Mail, 
  User, Shield, Coins, Sun, Moon, Users 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout, unreadMailCount } = useAuth();
  const { navigate } = useNav();
  const { forumCategories } = useDB();

  useEffect(() => {
    const savedTheme = localStorage.getItem('dcms_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dcms_theme', newTheme);
  };

  const totalTopics = forumCategories.reduce((sum, cat) => sum + cat.topics.length, 0);
  const totalPosts = forumCategories.reduce(
    (sum, cat) => sum + cat.topics.reduce((tSum, t) => tSum + t.posts.length, 0),
    0
  );

  return (
    <header className="glass-panel border-b border-violet-500/20 p-6 rounded-t-2xl">
      <div className="flex justify-between items-center mb-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('home')}
        >
          <Sparkles className="text-pink-500 w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-2xl bg-gradient-to-r from-violet-400 via-pink-400 to-amber-300 bg-clip-text text-transparent tracking-tight">
            GcmsSoc
          </span>
        </div>
        
        <button 
          className="p-2.5 rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-400 hover:text-white transition-all duration-300"
          onClick={toggleTheme} 
          aria-label="თემის შეცვლა"
        >
          <Sun className="w-5 h-5 hidden dark:block" />
          <Moon className="w-5 h-5 block dark:hidden" />
        </button>
      </div>

      <div className="flex gap-3 flex-wrap text-xs text-gray-400 mb-5">
        <div 
          className="bg-violet-950/20 hover:bg-violet-950/40 px-3 py-1.5 rounded-full border border-violet-500/10 cursor-pointer flex items-center gap-1.5 transition-all"
          onClick={() => navigate('online')}
        >
          <Users size={12} className="text-violet-400" />
          <span>აქტიური: 4 / 28</span>
        </div>
        <div className="bg-violet-950/20 px-3 py-1.5 rounded-full border border-violet-500/10">
          <span>თემები: {totalTopics}</span>
        </div>
        <div className="bg-violet-950/20 px-3 py-1.5 rounded-full border border-violet-500/10">
          <span>პოსტები: {totalPosts}</span>
        </div>
      </div>

      {currentUser ? (
        <div className="bg-violet-950/10 border border-violet-500/10 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.username} 
              className="w-11 h-11 rounded-full object-cover border-2 border-violet-500 shadow-lg cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => navigate('profile', { userId: currentUser.id })}
            />
            <div>
              <div 
                className="font-bold flex items-center gap-1.5 cursor-pointer hover:text-violet-400 transition-colors"
                onClick={() => navigate('profile', { userId: currentUser.id })}
              >
                {currentUser.username}
                {currentUser.role === 'admin' && (
                  <span title="ადმინისტრატორი">
                    <Shield size={14} className="text-red-500 fill-red-500/10" />
                  </span>
                )}
              </div>
              <div className="text-xs text-violet-400 max-w-[200px] truncate">
                {currentUser.status}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-sm">
            <span 
              className="flex items-center gap-1.5 text-violet-300 hover:text-violet-100 cursor-pointer transition-colors" 
              onClick={() => navigate('profile', { userId: currentUser.id })}
            >
              <User size={15} />
              <span>კაბინეტი</span>
            </span>
            
            <span 
              className="flex items-center gap-1.5 text-violet-300 hover:text-violet-100 cursor-pointer relative transition-colors" 
              onClick={() => navigate('chat_home')}
            >
              <Mail size={15} />
              <span>ფოსტა</span>
              {unreadMailCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-bounce">
                  {unreadMailCount}
                </span>
              )}
            </span>

            <span className="flex items-center gap-1.5 text-yellow-400">
              <Coins size={15} className="animate-spin-slow" />
              <span className="font-bold">{currentUser.coins}</span>
            </span>

            <button 
              className="p-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all hover:scale-105" 
              onClick={logout} 
              title="გასვლა"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-violet-950/10 border border-violet-500/10 rounded-2xl p-4 flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm text-gray-400">სტუმრის რეჟიმი</span>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 text-xs font-semibold text-white rounded-xl border border-violet-500/20 hover:bg-violet-500/10 transition-all flex items-center gap-1.5"
              onClick={() => navigate('login')}
            >
              <LogIn size={12} />
              <span>შესვლა</span>
            </button>
            <button 
              className="liquid-btn px-4 py-2 text-xs font-semibold text-white rounded-xl flex items-center gap-1.5"
              onClick={() => navigate('register')}
            >
              <UserPlus size={12} />
              <span>რეგისტრაცია</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
