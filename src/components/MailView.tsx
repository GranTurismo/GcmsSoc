import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import type { PrivateMessage } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { Mail, ChevronLeft, Send, Shield, Clock, MessageSquare, Check, CheckCheck, User } from 'lucide-react';

export const MailView: React.FC = () => {
  const { currentUser, allUsers, privateMessages, sendPrivateMessage, markMessagesAsRead } = useAuth();
  const { params, navigate, goBack } = useNav();
  
  const [activeThreadUser, setActiveThreadUser] = useState<string | null>(params.userId || null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Group messages by contact
  const conversationsMap = new Map<string, {
    contactId: string;
    contactUsername: string;
    contactAvatar: string;
    messages: PrivateMessage[];
    unreadCount: number;
    lastMessage: PrivateMessage;
  }>();

  if (currentUser) {
    privateMessages.forEach(msg => {
      const isSender = msg.senderId === currentUser.id;
      const contactId = isSender ? msg.recipientId : msg.senderId;
      const contactUsername = isSender ? msg.recipientUsername : msg.senderUsername;
      
      // Look up fresh avatar from allUsers if possible
      const freshUser = allUsers.find(u => u.id === contactId);
      const contactAvatar = freshUser ? freshUser.avatar : (isSender ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' : msg.senderAvatar);

      const existing = conversationsMap.get(contactId);
      const isIncomingUnread = !isSender && !msg.isRead;

      if (existing) {
        existing.messages.push(msg);
        if (isIncomingUnread) {
          existing.unreadCount++;
        }
        // Messages are already ordered by CreatedAt from API
        existing.lastMessage = msg;
      } else {
        conversationsMap.set(contactId, {
          contactId,
          contactUsername,
          contactAvatar,
          messages: [msg],
          unreadCount: isIncomingUnread ? 1 : 0,
          lastMessage: msg
        });
      }
    });
  }

  const threads = Array.from(conversationsMap.values()).sort(
    (a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  // When active thread changes, mark messages from that user as read
  useEffect(() => {
    if (activeThreadUser && currentUser) {
      markMessagesAsRead(activeThreadUser);
    }
  }, [activeThreadUser, privateMessages.length]);

  // Scroll to bottom of message logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadUser, privateMessages.length]);

  if (!currentUser) {
    return (
      <div className="space-y-4 p-2 text-center">
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm justify-center">
          <span>წერილების სანახავად გთხოვთ გაიაროთ ავტორიზაცია.</span>
        </div>
        <button 
          onClick={() => navigate('login')} 
          className="liquid-btn px-6 py-2.5 rounded-xl font-bold text-xs md:text-sm text-white"
        >
          ავტორიზაცია
        </button>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeThreadUser) return;
    const success = await sendPrivateMessage(activeThreadUser, messageText.trim());
    if (success) {
      setMessageText('');
    }
  };

  const activeThread = activeThreadUser ? conversationsMap.get(activeThreadUser) : null;
  const activeUser = activeThreadUser ? allUsers.find(u => u.id === activeThreadUser) : null;
  const activeUsername = activeUser ? activeUser.username : (activeThread ? activeThread.contactUsername : '');
  const activeAvatar = activeUser ? activeUser.avatar : (activeThread ? activeThread.contactAvatar : '');

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
          onClick={activeThreadUser ? () => setActiveThreadUser(null) : goBack}
        >
          <ChevronLeft size={14} />
          <span>{activeThreadUser ? 'წერილები' : 'უკან'}</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden glass-panel border border-violet-500/20 rounded-2xl shadow-2xl">
        {/* Threads List Sidebar */}
        <div className={`w-full md:w-80 border-r border-violet-500/15 flex flex-col ${activeThreadUser ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-violet-500/15 bg-violet-950/10 flex items-center gap-2">
            <Mail size={16} className="text-pink-500" />
            <span className="font-extrabold text-sm text-gray-200 uppercase tracking-wider">პირადი წერილები</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-violet-500/5 custom-scrollbar">
            {threads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                <MessageSquare size={20} className="text-violet-500/30" />
                <span>შემოსული წერილები ცარიელია.</span>
              </div>
            ) : (
              threads.map(thread => (
                <div
                  key={thread.contactId}
                  onClick={() => setActiveThreadUser(thread.contactId)}
                  className={`p-4 flex gap-3 cursor-pointer transition-all hover:bg-violet-500/5 items-center ${
                    activeThreadUser === thread.contactId ? 'bg-violet-500/10' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img 
                      src={thread.contactAvatar} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-violet-500/20"
                    />
                    {allUsers.find(u => u.id === thread.contactId)?.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#161127] rounded-full"></span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-gray-200 truncate">{thread.contactUsername}</span>
                      <span className="text-[9px] text-gray-500">{thread.lastMessage.date.split(' ')[1] || thread.lastMessage.date}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'text-violet-300 font-bold' : 'text-gray-400'}`}>
                        {thread.lastMessage.senderId === currentUser.id ? 'შენ: ' : ''}{thread.lastMessage.text}
                      </p>
                      {thread.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messaging Box */}
        <div className={`flex-1 flex flex-col ${!activeThreadUser ? 'hidden md:flex' : 'flex'}`}>
          {activeThreadUser ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-violet-500/15 bg-violet-950/10 flex items-center justify-between">
                <div 
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => navigate('profile', { userId: activeThreadUser })}
                >
                  <img src={activeAvatar} alt="" className="w-8 h-8 rounded-full object-cover border border-violet-500/30" />
                  <div>
                    <span className="font-bold text-xs md:text-sm text-gray-200 group-hover:text-violet-400 transition-colors flex items-center gap-1">
                      {activeUsername}
                      {allUsers.find(u => u.id === activeThreadUser)?.role === 'admin' && (
                        <Shield size={12} className="text-red-500 fill-red-500/10" />
                      )}
                    </span>
                    <span className="block text-[9px] text-violet-400">
                      {allUsers.find(u => u.id === activeThreadUser)?.isOnline ? 'ხაზზეა' : 'ხაზგარეშე'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('profile', { userId: activeThreadUser })}
                  className="p-1.5 rounded-lg border border-violet-500/20 hover:bg-violet-500/10 text-gray-400 hover:text-white transition-all text-[10px] flex items-center gap-1 font-semibold"
                >
                  <User size={12} />
                  <span>პროფილი</span>
                </button>
              </div>

              {/* Messages Scroll Box */}
              <div className="flex-1 overflow-y-auto bg-violet-950/5 p-4 space-y-3.5 custom-scrollbar">
                {activeThread?.messages.map(msg => {
                  const isOwn = msg.senderId === currentUser.id;
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex gap-3 max-w-[85%] rounded-2xl p-3 border transition-all ${
                        isOwn 
                          ? 'ml-auto bg-violet-500/15 border-violet-500/20 text-right flex-row-reverse' 
                          : 'bg-violet-500/5 border-violet-500/10'
                      }`}
                    >
                      {!isOwn && (
                        <img 
                          src={msg.senderAvatar} 
                          alt="" 
                          className="w-7 h-7 rounded-full object-cover border border-violet-500/30 flex-shrink-0 align-self-start" 
                        />
                      )}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className={`flex items-center gap-2 flex-wrap ${isOwn ? 'justify-end' : ''}`}>
                          <span className="text-[10px] font-bold text-gray-300">
                            {isOwn ? 'შენ' : msg.senderUsername}
                          </span>
                          <span className="text-[8px] text-gray-500 flex items-center gap-1">
                            <Clock size={8} />
                            {msg.date.split(' ')[1] || msg.date}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-gray-200 leading-relaxed break-words whitespace-pre-wrap select-text">
                          {msg.text}
                        </p>
                        {isOwn && (
                          <span className="inline-block pt-1 text-gray-500">
                            {msg.isRead ? <CheckCheck size={12} className="text-violet-400" /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSend} className="p-3 border-t border-violet-500/15 bg-violet-950/10 flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
                  placeholder="დაწერე პირადი შეტყობინება..."
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="liquid-btn p-2.5 rounded-xl text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/10"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2 p-6">
              <Mail size={32} className="text-violet-500/20 animate-pulse" />
              <span className="text-xs font-medium">აირჩიეთ საუბარი წერილების წასაკითხად.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
