import React, { useState } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { 
  FileText, ChevronLeft, Calendar, User, 
  Send, Plus, MessageSquare, AlertCircle
} from 'lucide-react';

export const DiariesListView: React.FC = () => {
  const { diaries, addDiary } = useDB();
  const { currentUser, addCoins, addRating } = useAuth();
  const { navigate } = useNav();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const handleCreateDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('გთხოვთ შეავსოთ სათაური და ჩანაწერის ტექსტი.');
      return;
    }
    if (!currentUser) return;

    addDiary(title.trim(), content.trim(), currentUser.username);
    addCoins(15);
    addRating(3);
    setTitle('');
    setContent('');
    setShowForm(false);
    setError('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 border-b border-violet-500/10 pb-3">
        <FileText className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">დღიურები</h2>
      </div>

      {currentUser ? (
        <div className="relative">
          {!showForm ? (
            <button 
              className="liquid-btn w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-white shadow-lg shadow-violet-500/10" 
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              <span>დღიურის დაწერა (+15 მონეტა)</span>
            </button>
          ) : (
            <form 
              onSubmit={handleCreateDiary} 
              className="glass-panel p-5 rounded-2xl border border-violet-500/15 space-y-4 animate-fade-in"
            >
              <div className="flex justify-between items-center border-b border-violet-500/10 pb-2">
                <span className="font-bold text-xs md:text-sm text-gray-200">ახალი დღიურის დაწერა</span>
                <button 
                  type="button" 
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded-lg hover:bg-red-500/5 transition-all" 
                  onClick={() => setShowForm(false)}
                >
                  გაუქმება
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
                  placeholder="დღიურის სათაური"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors min-h-[140px] resize-none"
                  placeholder="დაწერე შენი დღიურის ჩანაწერი აქ..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              <button type="submit" className="liquid-btn w-full py-2.5 rounded-xl font-bold text-xs md:text-sm text-white">
                გამოქვეყნება
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="glass-panel p-4 rounded-xl text-center text-xs text-gray-500 border border-violet-500/5">
          გთხოვთ გაიაროთ ავტორიზაცია დღიურის დასაწერად.
        </div>
      )}

      <div className="space-y-3">
        {diaries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-xs">
            დღიურები ვერ მოიძებნა.
          </div>
        ) : (
          diaries.map(diary => (
            <div 
              key={diary.id} 
              className="glass-panel p-5 rounded-2xl border border-violet-500/5 hover:border-violet-500/25 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
              onClick={() => navigate('diaries_detail', { diaryId: diary.id })}
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-all flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-base font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">
                    {diary.title}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1 break-words leading-relaxed max-w-lg">
                    {diary.content}
                  </p>
                  <span className="block text-[10px] text-gray-600 mt-1.5 font-medium">
                    ავტორი: {diary.author} &bull; {diary.date}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/5 text-xs font-semibold">
                <MessageSquare size={12} className="text-violet-400" />
                <span>{diary.comments.length}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const DiariesDetailView: React.FC = () => {
  const { diaries, addDiaryComment } = useDB();
  const { currentUser } = useAuth();
  const { params, goBack } = useNav();
  const [commentText, setCommentText] = useState('');

  const diaryId = params.diaryId;
  const diary = diaries.find(d => d.id === diaryId);

  if (!diary) {
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
          <span>დღიურის ჩანაწერი ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    addDiaryComment(diary.id, currentUser.username, currentUser.avatar, commentText.trim());
    setCommentText('');
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

      <div className="glass-panel p-5 rounded-2xl border border-violet-500/10 space-y-4">
        <div className="border-b border-violet-500/10 pb-3 flex justify-between items-start gap-4">
          <h2 className="text-base md:text-lg font-bold text-gray-100">{diary.title}</h2>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-violet-400" />
            {diary.date}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-violet-400" />
            ავტორი: {diary.author}
          </span>
        </div>
        
        <p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap select-text pt-2 font-sans border-t border-violet-500/5">
          {diary.content}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-violet-400 tracking-wider uppercase">
          კომენტარები ({diary.comments.length})
        </h3>

        <div className="space-y-3.5">
          {diary.comments.length === 0 ? (
            <div className="glass-panel p-6 text-center text-gray-500 text-xs rounded-2xl border border-violet-500/5">
              კომენტარები ჯერ არ არის. დატოვე პირველი გამოხმაურება!
            </div>
          ) : (
            diary.comments.map(c => (
              <div 
                key={c.id} 
                className="chat-bubble-anim glass-panel p-4 rounded-2xl border border-violet-500/5 flex gap-3 hover:border-violet-500/15 transition-all"
              >
                <img 
                  src={c.avatar} 
                  alt={c.username} 
                  className="w-8 h-8 rounded-full object-cover border border-violet-500/20 flex-shrink-0" 
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-200">{c.username}</span>
                    <span className="text-[9px] text-gray-500">{c.date}</span>
                  </div>
                  <p className="text-xs text-gray-300 break-words whitespace-pre-wrap">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {currentUser ? (
          <form 
            onSubmit={handleCommentSubmit} 
            className="glass-panel p-4 rounded-2xl border border-violet-500/10 flex gap-2"
          >
            <input
              type="text"
              className="flex-1 bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
              placeholder="დაწერე კომენტარი..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
            />
            <button 
              type="submit" 
              className="liquid-btn p-2 rounded-xl text-white flex items-center justify-center flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div className="glass-panel p-4 rounded-xl text-center text-xs text-gray-500 border border-violet-500/5">
            გთხოვთ გაიაროთ ავტორიზაცია კომენტარის დასაწერად.
          </div>
        )}
      </div>
    </div>
  );
};
