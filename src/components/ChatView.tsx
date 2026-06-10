import React, { useState, useEffect, useRef } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { MessageSquare, ChevronLeft, Send, Sparkles, Shield, Clock, Smile, AlertCircle } from 'lucide-react';

export const ChatHomeView: React.FC = () => {
  const { chatRooms } = useDB();
  const { navigate } = useNav();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 border-b border-violet-500/10 pb-3">
        <MessageSquare className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">ჩეთები და სტუმრების წიგნი</h2>
      </div>

      <div 
        className="glass-panel p-5 rounded-2xl border border-violet-500/10 hover:border-violet-500/30 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300"
        onClick={() => navigate('guestbook')}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
            <MessageSquare size={22} />
          </div>
          <div className="min-w-0">
            <span className="block text-base font-bold text-gray-200 group-hover:text-emerald-300 transition-colors">
              სტუმრების წიგნი
            </span>
            <span className="block text-xs text-gray-500 mt-0.5">
              სწრაფი შეტყობინებები, ყველას შეუძლია დატოვოს პოსტი (სტუმრებსაც!)
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400">
          საჯარო
        </span>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-extrabold text-violet-400 mb-3 tracking-wider uppercase">
          აქტიური ჩეთის ოთახები
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {chatRooms.map(room => (
            <div 
              key={room.id} 
              className="glass-panel p-5 rounded-2xl border border-violet-500/10 hover:border-violet-500/30 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
              onClick={() => navigate('chat_room', { roomId: room.id })}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-all">
                  <MessageSquare size={22} />
                </div>
                <div className="min-w-0">
                  <span className="block text-base font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">
                    {room.title}
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5 truncate">
                    {room.description}
                  </span>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-950/30 border border-violet-500/20 text-violet-400 font-semibold">
                {room.messages.length} წერილი
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ChatRoomView: React.FC = () => {
  const { chatRooms, addChatMessage } = useDB();
  const { currentUser } = useAuth();
  const { params, goBack } = useNav();
  
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomId = params.roomId;
  const room = chatRooms.find(r => r.id === roomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages.length]);

  if (!room) {
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
          <span>ჩეთის ოთახი ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;

    addChatMessage(room.id, currentUser.username, currentUser.avatar, text.trim());
    setText('');
    setShowEmoji(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  const emojis = ['😊', '😄', '😂', '😉', '😍', '😎', '😜', '👍', '🔥', '🚀', '💕', '👀', '📱', '🎮', '💡', '🎉'];

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
          onClick={goBack}
        >
          <ChevronLeft size={14} />
          <span>უკან</span>
        </button>
        <span className="text-[11px] text-gray-500 font-medium bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/5">
          საუბრობს: {Math.floor(2 + Math.random() * 4)} წევრი
        </span>
      </div>

      <div className="bg-violet-500/10 border border-violet-500/25 border-b-0 px-4 py-3 rounded-t-2xl flex items-center justify-between">
        <span className="font-bold text-gray-200 text-sm md:text-base">{room.title}</span>
      </div>

      {/* Messages Scroll Box */}
      <div className="flex-1 overflow-y-auto border border-violet-500/10 bg-violet-950/5 p-4 space-y-3.5 custom-scrollbar">
        {room.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
            <MessageSquare size={24} className="text-violet-500/40" />
            <span className="text-xs">ჩეთი ცარიელია. დაწერე პირველი შეტყობინება!</span>
          </div>
        ) : (
          room.messages.map(msg => (
            <div 
              key={msg.id} 
              className="chat-bubble-anim flex gap-3 max-w-[85%] bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/10 rounded-2xl p-3.5 transition-all"
            >
              <img 
                src={msg.avatar} 
                alt={msg.username} 
                className="w-8 h-8 rounded-full object-cover border border-violet-500/30 flex-shrink-0" 
              />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-200 hover:text-violet-400 transition-colors flex items-center gap-1 cursor-pointer">
                    {msg.username}
                    {msg.username === 'admin' && <Shield size={11} className="text-red-500 fill-red-500/10" />}
                  </span>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1">
                    <Clock size={9} />
                    {msg.date}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap select-text">
                  {msg.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input Form */}
      {currentUser ? (
        <form 
          onSubmit={handleSubmit} 
          className="border border-violet-500/10 bg-violet-950/10 p-3 rounded-b-2xl flex flex-col gap-2.5"
        >
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
              placeholder="დაწერე შეტყობინება..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button 
              type="submit" 
              className="liquid-btn p-2.5 rounded-xl text-white flex items-center justify-center flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
          
          <div className="flex gap-2 items-center">
            <button 
              type="button" 
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-all" 
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <Smile size={13} />
              <span>სმაილები</span>
            </button>
          </div>

          {showEmoji && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-violet-950/40 border border-violet-500/10 rounded-xl max-h-[120px] overflow-y-auto">
              {emojis.map(emoji => (
                <button 
                  key={emoji} 
                  type="button" 
                  className="text-base p-1.5 hover:bg-violet-500/20 rounded-lg active:scale-90 transition-all"
                  onClick={() => handleAddEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      ) : (
        <div className="border border-violet-500/10 bg-violet-950/10 p-5 rounded-b-2xl text-center text-xs text-gray-500">
          გთხოვთ გაიაროთ ავტორიზაცია მიმოწერაში მონაწილეობისთვის.
        </div>
      )}
    </div>
  );
};

export const GuestbookView: React.FC = () => {
  const { guestbook, addGuestbookPost } = useDB();
  const { currentUser } = useAuth();
  const { goBack } = useNav();
  
  const [text, setText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('გთხოვთ ჩაწეროთ შეტყობინება.');
      return;
    }
    
    let posterName = 'სტუმარი';
    let posterAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    if (currentUser) {
      posterName = currentUser.username;
      posterAvatar = currentUser.avatar;
    } else {
      if (guestName.trim()) {
        posterName = `სტუმარი_${guestName.trim().substring(0, 10)}`;
      } else {
        posterName = 'ანონიმური სტუმარი';
      }
    }

    addGuestbookPost(posterName, posterAvatar, text.trim());
    setText('');
    setGuestName('');
    setError('');
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

      <div className="flex items-center gap-2 border-b border-violet-500/10 pb-3">
        <Sparkles className="text-emerald-400 w-5 h-5 animate-pulse" />
        <h2 className="text-lg font-bold text-gray-100">სტუმრების წიგნი</h2>
      </div>

      {/* Guestbook posting form */}
      <form onSubmit={handleSubmit} className="glass-panel p-5 rounded-2xl border border-violet-500/15 space-y-4">
        {error && (
          <div className="flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
        
        {!currentUser && (
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium block">
              თქვენი სახელი (არასავალდებულო)
            </label>
            <input
              type="text"
              className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
              placeholder="სტუმარი"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
              maxLength={15}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-medium block">
            შეტყობინება
          </label>
          <textarea
            className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors min-h-[90px] resize-none"
            placeholder="დაწერე შეტყობინება სტუმრების წიგნისთვის..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>

        <button type="submit" className="liquid-btn w-full py-2.5 rounded-xl font-bold text-xs md:text-sm text-white">
          გამოქვეყნება
        </button>
      </form>

      {/* Guestbook entries */}
      <div className="space-y-3">
        {guestbook.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            ჩანაწერები არ არის. იყავი პირველი!
          </div>
        ) : (
          guestbook.map(msg => (
            <div 
              key={msg.id} 
              className="chat-bubble-anim glass-panel p-4 rounded-2xl border border-violet-500/5 flex gap-3 hover:border-violet-500/15 transition-all"
            >
              <img 
                src={msg.avatar} 
                alt={msg.username} 
                className="w-9 h-9 rounded-full object-cover border border-violet-500/20 flex-shrink-0" 
              />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-200">
                    {msg.username}
                  </span>
                  <span className="text-[9px] text-gray-500 flex items-center gap-1">
                    <Clock size={9} />
                    {msg.date}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap select-text">
                  {msg.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
