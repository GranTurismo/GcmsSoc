import React, { useState, useEffect } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { FileText, MessageSquare, ChevronLeft, Calendar, User, Eye, Send } from 'lucide-react';

export const NewsListView: React.FC = () => {
  const { news } = useDB();
  const { navigate } = useNav();

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl flex items-center gap-2 shadow-md mb-2">
        <FileText size={16} />
        <span>საიტის სიახლეები / სიახლეები</span>
      </div>

      <div className="flex flex-col gap-3">
        {news.map(item => (
          <div 
            key={item.id} 
            className="glass-card p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-md" 
            onClick={() => navigate('news_detail', { newsId: item.id })}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400">
                <FileText size={20} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm hover:text-violet-400 transition-colors">{item.title}</span>
                <span className="text-xs text-gray-400">
                  {item.date} &bull; ავტორი: {item.author}
                </span>
              </div>
            </div>
            <div className="bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/10 text-xs text-violet-400 font-bold flex items-center gap-1">
              <MessageSquare size={12} />
              <span>{item.comments.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const NewsDetailView: React.FC = () => {
  const { news, addNewsComment, incrementNewsViews } = useDB();
  const { currentUser } = useAuth();
  const { params, goBack } = useNav();
  const [commentText, setCommentText] = useState('');
  
  const newsId = params.newsId;
  const item = news.find(n => n.id === newsId);

  useEffect(() => {
    if (newsId) {
      incrementNewsViews(newsId);
    }
  }, [newsId]);

  if (!item) {
    return (
      <div className="p-6">
        <button className="wap-btn secondary mb-4" onClick={goBack}>
          <ChevronLeft size={16} />
          <span>უკან დაბრუნება</span>
        </button>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          სიახლე ვერ მოიძებნა.
        </div>
      </div>
    );
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    addNewsComment(item.id, currentUser.username, currentUser.avatar, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="p-6">
      <button className="px-3.5 py-2 bg-violet-950/20 hover:bg-violet-950/40 text-gray-300 hover:text-white border border-violet-500/10 rounded-xl text-xs flex items-center gap-1.5 transition-all mb-4" onClick={goBack}>
        <ChevronLeft size={14} />
        <span>უკან</span>
      </button>

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl shadow-md">
        <span>{item.title}</span>
      </div>

      <div className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl p-5 mb-6 shadow-xl">
        <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 mb-4 pb-3 border-b border-violet-500/10">
          <span className="flex items-center gap-1">
            <Calendar size={12} className="text-violet-400" />
            {item.date}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} className="text-violet-400" />
            ავტორი: {item.author}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={12} className="text-violet-400" />
            ნახვები: {item.views}
          </span>
        </div>
        
        <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap">
          {item.content}
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl shadow-md">
        <span className="flex items-center gap-1.5">
          <MessageSquare size={14} />
          <span>კომენტარები ({item.comments.length})</span>
        </span>
      </div>

      <div className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl overflow-hidden shadow-xl">
        {item.comments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            კომენტარები ჯერ არ არის. იყავით პირველი!
          </div>
        ) : (
          <div className="divide-y divide-violet-500/10">
            {item.comments.map(c => (
              <div key={c.id} className="p-4 flex flex-col gap-2 chat-bubble-anim">
                <div className="flex justify-between items-center text-[10px] text-gray-400">
                  <span className="flex items-center gap-1.5 font-bold text-violet-400">
                    <img src={c.avatar} alt={c.username} className="w-5 h-5 rounded-full object-cover" />
                    <span>{c.username}</span>
                  </span>
                  <span>{c.date}</span>
                </div>
                <div className="text-xs text-gray-200 pl-6.5">{c.text}</div>
              </div>
            ))}
          </div>
        )}

        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="p-4 border-t border-violet-500/10 bg-violet-950/20">
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-[#120e1e] border border-violet-500/20 text-sm px-4 py-2 rounded-lg focus:outline-none focus:border-violet-500"
                placeholder="დაწერეთ კომენტარი..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button type="submit" className="liquid-btn text-white p-2.5 rounded-lg shadow-md hover:scale-105">
                <Send size={16} />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 text-center text-xs text-gray-400 bg-violet-950/20 border-t border-violet-500/10">
            კომენტარის დასაწერად გთხოვთ გაიაროთ ავტორიზაცია.
          </div>
        )}
      </div>
    </div>
  );
};
