import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { 
  Users, ChevronLeft, Coins, 
  Star, Heart, Mail, Check, Send, Edit3, Shield, AlertCircle, Calendar, MapPin
} from 'lucide-react';

export const OnlineUsersListView: React.FC = () => {
  const { allUsers } = useAuth();
  const { navigate, goBack } = useNav();

  const onlineUsers = allUsers.filter(u => u.isOnline);

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
        <Users className="text-pink-500 w-5 h-5 animate-pulse" />
        <h2 className="text-lg font-bold text-gray-100">საიტზე მყოფები ({onlineUsers.length})</h2>
      </div>

      <div className="space-y-3">
        {onlineUsers.length === 0 ? (
          <div className="glass-panel p-6 text-center text-gray-500 text-xs rounded-2xl border border-violet-500/5">
            საიტზე მომხმარებლები არ არიან.
          </div>
        ) : (
          onlineUsers.map(u => (
            <div 
              key={u.id} 
              className="glass-panel p-4 rounded-2xl border border-violet-500/5 hover:border-violet-500/20 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
              onClick={() => navigate('profile', { userId: u.id })}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative">
                  <img 
                    src={u.avatar} 
                    alt={u.username} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-violet-500/30 group-hover:scale-105 transition-transform" 
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#06040a] rounded-full"></span>
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-gray-200 group-hover:text-violet-300 transition-colors flex items-center gap-1">
                    {u.username}
                    {u.role === 'admin' && <Shield size={11} className="text-red-500 fill-red-500/10" />}
                  </span>
                  <span className="block text-[10px] text-violet-400 mt-0.5 truncate max-w-[150px] sm:max-w-xs font-medium">
                    აკეთებს: {u.currentAction || 'ათვალიერებს საიტს'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-gray-500 bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/5 font-semibold">
                {u.sex === 'Male' ? 'კაცი' : 'ქალი'}, {u.age} წ.
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const ProfileView: React.FC = () => {
  const { 
    currentUser, allUsers, updateStatus, updateAvatar, 
    updateBio, giveGift, sendPrivateMessage 
  } = useAuth();
  
  const { params, navigate, goBack } = useNav();
  
  const [editMode, setEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState(currentUser?.status || '');
  const [newAvatar, setNewAvatar] = useState(currentUser?.avatar || '');
  const [newBio, setNewBio] = useState(currentUser?.bio || '');

  // Gifts and DM states
  const [giftSuccess, setGiftSuccess] = useState(false);
  const [giftError, setGiftError] = useState('');
  const [activeMessageUser, setActiveMessageUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const userId = params.userId || currentUser?.id;
  const user = allUsers.find(u => u.id === userId);

  if (!user) {
    return (
      <div className="space-y-4 p-2">
        <button 
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
          onClick={goBack}
        >
          <ChevronLeft size={14} />
          <span>უკან</span>
        </button>
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={16} />
          <span>მომხმარებლის პროფილი ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === user.id;

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(newStatus);
    updateAvatar(newAvatar);
    updateBio(newBio);
    setEditMode(false);
  };

  const handleGiveGift = async () => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    if (currentUser.coins < 10) {
      setGiftError('საჩუქრის გასაგზავნად გჭირდებათ მინიმუმ 10 მონეტა!');
      setTimeout(() => setGiftError(''), 3000);
      return;
    }

    const success = await giveGift(user.id);
    if (success) {
      setGiftSuccess(true);
      setTimeout(() => setGiftSuccess(false), 3000);
    } else {
      setGiftError('საჩუქრის გაგზავნა ვერ მოხერხდა.');
      setTimeout(() => setGiftError(''), 3000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeMessageUser) return;
    const success = await sendPrivateMessage(activeMessageUser.id, messageText.trim());
    if (success) {
      setSentSuccess(true);
      setMessageText('');
      setTimeout(() => {
        setSentSuccess(false);
        setActiveMessageUser(null);
      }, 2000);
    }
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

      <div className="glass-panel p-5 rounded-2xl border border-violet-500/10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-500 shadow-xl" 
            />
            {user.isOnline ? (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#161127] rounded-full"></span>
            ) : (
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-gray-600 border-2 border-[#161127] rounded-full"></span>
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-100 flex items-center justify-center sm:justify-start gap-1.5">
              {user.username}
              {user.role === 'admin' && <span title="ადმინისტრატორი"><Shield size={16} className="text-red-500 fill-red-500/10" /></span>}
            </h2>
            <div className="text-xs text-violet-400 bg-violet-950/20 border border-violet-500/10 px-3 py-1.5 rounded-xl font-medium inline-block max-w-[280px] sm:max-w-md truncate">
              {user.status}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold pt-1.5">
              <span className="flex items-center gap-1 text-violet-400 bg-violet-950/20 border border-violet-500/5 px-2.5 py-1 rounded-full">
                <Star size={12} fill="#a78bfa" className="text-violet-400" />
                <span>რეიტინგი: {user.rating}</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full">
                <Coins size={12} className="text-amber-400" />
                <span>მონეტები: {user.coins}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-violet-950/20 p-4 rounded-2xl border border-violet-500/5 text-xs text-gray-300 leading-relaxed">
          <div><span className="text-gray-500">სქესი:</span> <span className="font-semibold text-gray-200">{user.sex === 'Male' ? 'მამრობითი' : 'მდედრობითი'}</span></div>
          <div><span className="text-gray-500">ასაკი:</span> <span className="font-semibold text-gray-200">{user.age} წლის</span></div>
          <div className="flex items-center gap-1.5"><MapPin size={12} className="text-violet-400" /> <span className="text-gray-500">ქალაქი:</span> <span className="font-semibold text-gray-200">{user.city}</span></div>
          <div className="flex items-center gap-1.5"><Calendar size={12} className="text-violet-400" /> <span className="text-gray-500">რეგისტრაცია:</span> <span className="font-semibold text-gray-200">{user.regDate}</span></div>
          {user.bio && (
            <div className="sm:col-span-2 pt-2 border-t border-violet-500/10">
              <span className="text-gray-500 block mb-1">ჩემ შესახებ:</span> 
              <p className="text-gray-300 break-words">{user.bio}</p>
            </div>
          )}
          {user.isOnline && (
            <div className="sm:col-span-2 pt-2 border-t border-violet-500/10 text-emerald-400 flex items-center gap-1.5 font-medium">
              <span>მოქმედება:</span>
              <span className="text-gray-200">{user.currentAction || 'ათვალიერებს საიტს'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isOwnProfile ? (
          <div>
            {!editMode ? (
              <button 
                className="liquid-btn w-full py-3 rounded-xl font-bold text-xs md:text-sm text-white flex items-center justify-center gap-2" 
                onClick={() => setEditMode(true)}
              >
                <Edit3 size={16} />
                <span>პროფილის რედაქტირება</span>
              </button>
            ) : (
              <form onSubmit={handleProfileUpdate} className="glass-panel p-5 rounded-2xl border border-violet-500/15 space-y-4 animate-fade-in">
                <div className="font-bold text-sm text-gray-200 border-b border-violet-500/10 pb-2">კაბინეტის მონაცემების შეცვლა</div>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium block">სტატუსის ტექსტი</label>
                  <input
                    type="text"
                    className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/40 text-gray-200 transition-colors"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium block">ავატარის ლინკი</label>
                  <input
                    type="text"
                    className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/40 text-gray-200 transition-colors"
                    value={newAvatar}
                    onChange={e => setNewAvatar(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-medium block">ჩემ შესახებ / აღწერა</label>
                  <textarea
                    className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 transition-colors min-h-[100px] resize-none"
                    value={newBio}
                    onChange={e => setNewBio(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="liquid-btn flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white">შენახვა</button>
                  <button 
                    type="button" 
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
                    onClick={() => setEditMode(false)}
                  >
                    გაუქმება
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              className="liquid-btn flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white flex items-center justify-center gap-1.5 shadow-md"
              onClick={() => {
                if (!currentUser) navigate('login');
                else setActiveMessageUser(user);
              }}
            >
              <Mail size={15} />
              <span>პირადი წერილი</span>
            </button>

            <button 
              className="flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm border border-pink-500/25 hover:bg-pink-500/5 text-pink-400 transition-all flex items-center justify-center gap-1.5"
              onClick={handleGiveGift}
            >
              <Heart size={15} fill={giftSuccess ? '#ec4899' : 'none'} className="text-pink-500 animate-pulse" />
              <span>საჩუქარი (-10 მონეტა)</span>
            </button>
          </div>
        )}

        {giftSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in">
            <Check size={14} className="bg-emerald-500/20 p-0.5 rounded-full" />
            <span>საჩუქარი გაგზავნილია! {user.username}-მა მიიღო 10 მონეტა და +1 რეიტინგი.</span>
          </div>
        )}
        {giftError && (
          <div className="flex items-center gap-1.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-fade-in">
            <AlertCircle size={14} />
            <span>{giftError}</span>
          </div>
        )}
      </div>

      {/* DM Modal Overlay */}
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
