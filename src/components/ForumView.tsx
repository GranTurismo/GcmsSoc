import React, { useState, useEffect } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { 
  MessageSquare, ChevronLeft, Eye, 
  Send, Plus, ThumbsUp, Quote, Sparkles 
} from 'lucide-react';

export const ForumHomeView: React.FC = () => {
  const { forumCategories } = useDB();
  const { navigate } = useNav();

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl flex items-center gap-2 shadow-md mb-2">
        <MessageSquare size={16} />
        <span>ფორუმის განყოფილებები</span>
      </div>

      <div className="flex flex-col gap-3">
        {forumCategories.map(cat => {
          const postsCount = cat.topics.reduce((sum, t) => sum + t.posts.length, 0);
          return (
            <div 
              key={cat.id} 
              className="glass-card p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-md" 
              onClick={() => navigate('forum_cat', { catId: cat.id })}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-500/10 rounded-lg text-violet-400">
                  <MessageSquare size={20} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm hover:text-violet-400 transition-colors">{cat.title}</span>
                  <span className="text-xs text-gray-400">{cat.description}</span>
                </div>
              </div>
              <div className="bg-violet-950/20 px-2.5 py-1.5 rounded-xl border border-violet-500/10 text-[10px] text-violet-400 font-bold">
                <span>თემა: {cat.topics.length} / პოსტი: {postsCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ForumCatView: React.FC = () => {
  const { forumCategories, addForumTopic } = useDB();
  const { currentUser, addCoins, addRating } = useAuth();
  const { params, navigate, goBack } = useNav();
  
  const [topicTitle, setTopicTitle] = useState('');
  const [topicText, setTopicText] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const catId = params.catId;
  const category = forumCategories.find(c => c.id === catId);

  if (!category) {
    return (
      <div className="p-6">
        <button className="wap-btn secondary mb-4" onClick={goBack}>
          <ChevronLeft size={16} />
          <span>უკან</span>
        </button>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          განყოფილება ვერ მოიძებნა.
        </div>
      </div>
    );
  }

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicText.trim()) {
      setError('გთხოვთ შეავსოთ ყველა ველი.');
      return;
    }
    if (!currentUser) return;

    addForumTopic(category.id, topicTitle.trim(), currentUser.username, currentUser.avatar, topicText.trim());
    addCoins(10);
    addRating(2);
    setTopicTitle('');
    setTopicText('');
    setShowForm(false);
    setError('');
  };

  return (
    <div className="p-6">
      <button className="px-3.5 py-2 bg-violet-950/20 hover:bg-violet-950/40 text-gray-300 hover:text-white border border-violet-500/10 rounded-xl text-xs flex items-center gap-1.5 transition-all mb-4" onClick={goBack}>
        <ChevronLeft size={14} />
        <span>ფორუმები</span>
      </button>

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl shadow-md">
        <span>{category.title}</span>
      </div>

      <div className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl p-4 flex flex-col gap-4 shadow-xl">
        {currentUser ? (
          <div>
            {!showForm ? (
              <button className="liquid-btn text-white font-semibold text-xs px-4 py-2.5 rounded-lg w-full flex items-center justify-center gap-1.5 shadow-md" onClick={() => setShowForm(true)}>
                <Plus size={14} />
                <span>ახალი თემის შექმნა (+10 ოქრო)</span>
              </button>
            ) : (
              <form onSubmit={handleCreateTopic} className="bg-violet-950/20 border border-violet-500/10 rounded-xl p-4 flex flex-col gap-3 animate-slide-in">
                <div className="flex justify-between items-center pb-2 border-b border-violet-500/10">
                  <span className="font-bold text-xs text-violet-400">თემის შექმნა</span>
                  <button type="button" className="text-red-400 text-xs hover:underline" onClick={() => setShowForm(false)}>
                    გაუქმება
                  </button>
                </div>
                
                {error && <div className="bg-red-500/10 text-red-400 p-2.5 rounded text-xs">{error}</div>}
                
                <input
                  type="text"
                  className="bg-[#120e1e] border border-violet-500/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500"
                  placeholder="თემის სათაური"
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                />
                <textarea
                  className="bg-[#120e1e] border border-violet-500/20 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-violet-500 min-height-[80px]"
                  placeholder="ტექსტი / აღწერა"
                  value={topicText}
                  onChange={e => setTopicText(e.target.value)}
                />
                <button type="submit" className="liquid-btn text-white font-bold text-xs py-2 rounded-lg shadow-md">
                  თემის გამოქვეყნება
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-gray-400 bg-violet-950/20 border border-violet-500/10 rounded-xl">
            თემის შესაქმნელად გთხოვთ გაიაროთ ავტორიზაცია.
          </div>
        )}

        <div className="flex flex-col gap-3 mt-2">
          {category.topics.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              თემები ჯერ არ არის. შექმენით პირველი თემა!
            </div>
          ) : (
            category.topics.map(t => (
              <div 
                key={t.id} 
                className="glass-card p-4 rounded-xl flex justify-between items-center cursor-pointer shadow-md" 
                onClick={() => navigate('forum_topic', { catId: category.id, topicId: t.id })}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                    <MessageSquare size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm hover:text-violet-400 transition-colors">{t.title}</span>
                    <span className="text-xs text-gray-400">
                      ავტორი: {t.author} &bull; პასუხები: {t.posts.length - 1}
                    </span>
                  </div>
                </div>
                <div className="bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/10 text-xs text-violet-400 font-bold flex items-center gap-1">
                  <Eye size={12} />
                  <span>{t.views}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const ForumTopicView: React.FC = () => {
  const { forumCategories, addForumPost, likeForumPost, incrementTopicViews } = useDB();
  const { currentUser, addCoins, addRating } = useAuth();
  const { params, goBack } = useNav();
  
  const [replyText, setReplyText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const catId = params.catId;
  const topicId = params.topicId;
  
  const category = forumCategories.find(c => c.id === catId);
  const topic = category?.topics.find(t => t.id === topicId);

  useEffect(() => {
    if (catId && topicId) {
      incrementTopicViews(catId, topicId);
    }
  }, [catId, topicId]);

  if (!category || !topic) {
    return (
      <div className="p-6">
        <button className="wap-btn secondary mb-4" onClick={goBack}>
          <ChevronLeft size={16} />
          <span>უკან</span>
        </button>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          თემა ვერ მოიძებნა.
        </div>
      </div>
    );
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    addForumPost(category.id, topic.id, currentUser.username, currentUser.avatar, replyText.trim());
    addCoins(3);
    addRating(1);
    setReplyText('');
    setShowEmoji(false);
  };

  const handleQuote = (author: string, text: string) => {
    setReplyText(prev => prev + `[quote]${author} წერს:\n${text}[/quote]\n`);
  };

  const handleAddEmoji = (emoji: string) => {
    setReplyText(prev => prev + emoji);
  };

  const emojis = ['😊', '😄', '😂', '😉', '😍', '😎', '😜', '👍', '🔥', '🚀', '💕', '👀', '📱', '🎮'];

  return (
    <div className="p-6 animate-fade-in">
      <button className="px-3.5 py-2 bg-violet-950/20 hover:bg-violet-950/40 text-gray-300 hover:text-white border border-violet-500/10 rounded-xl text-xs flex items-center gap-1.5 transition-all mb-4" onClick={goBack}>
        <ChevronLeft size={14} />
        <span>უკან თემებზე</span>
      </button>

      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl flex items-center gap-2 shadow-md">
        <Sparkles size={14} className="text-yellow-400" />
        <span>{topic.title}</span>
      </div>

      <div className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl overflow-hidden shadow-xl mb-6">
        <div className="divide-y divide-violet-500/10">
          {topic.posts.map((post) => (
            <div key={post.id} className="p-4 flex flex-col gap-3 chat-bubble-anim">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span className="flex items-center gap-2 font-bold text-violet-400">
                  <img src={post.avatar} alt={post.username} className="w-6 h-6 rounded-full object-cover" />
                  <span>{post.username}</span>
                  {post.username === 'admin' && (
                    <span className="bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase">
                      ადმინი
                    </span>
                  )}
                </span>
                <span>{post.date}</span>
              </div>
              
              <div className="text-xs text-gray-200 pl-8 leading-relaxed whitespace-pre-wrap">
                {post.text.includes('[quote]') ? (
                  (() => {
                    const parts = post.text.split(/\[quote\]|\[\/quote\]/);
                    return parts.map((part, pIdx) => {
                      if (pIdx % 2 === 1) {
                        return (
                          <div 
                            key={pIdx} 
                            className="bg-violet-950/20 border-l-2 border-violet-500 p-2.5 my-1.5 text-[11px] text-gray-400 rounded"
                          >
                            {part}
                          </div>
                        );
                      }
                      return <span key={pIdx}>{part}</span>;
                    });
                  })()
                ) : (
                  post.text
                )}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400 pl-8 pt-1">
                <button 
                  onClick={() => handleQuote(post.username, post.text)}
                  className="hover:text-violet-400 flex items-center gap-1 transition-colors"
                >
                  <Quote size={11} />
                  <span>ციტირება</span>
                </button>

                {currentUser && (
                  <button 
                    onClick={() => likeForumPost(category.id, topic.id, post.id, currentUser.username)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.likes.includes(currentUser.username) ? 'text-pink-500' : 'hover:text-pink-400'
                    }`}
                  >
                    <ThumbsUp size={11} />
                    <span>{post.likes.length > 0 ? `${post.likes.length} მოწონება` : 'მომწონს'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold text-sm px-4 py-3 rounded-t-xl shadow-md">
        <span>პასუხის დაწერა</span>
      </div>

      {currentUser ? (
        <form onSubmit={handleReplySubmit} className="bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl p-4 flex flex-col gap-3 shadow-xl">
          <textarea
            className="w-full bg-[#120e1e] border border-violet-500/20 text-xs px-4 py-2.5 rounded-lg focus:outline-none focus:border-violet-500 min-h-[90px]"
            placeholder="დაწერეთ თქვენი პასუხი..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
          
          <div className="flex justify-between items-center">
            <button 
              type="button" 
              className="px-3.5 py-1.5 bg-violet-950/20 hover:bg-violet-950/40 text-gray-300 border border-violet-500/10 rounded-lg text-xs" 
              onClick={() => setShowEmoji(!showEmoji)}
            >
              😊 სმაილები
            </button>
            <button type="submit" className="liquid-btn text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1">
              <Send size={11} />
              <span>გაგზავნა (+3 ოქრო)</span>
            </button>
          </div>

          {showEmoji && (
            <div className="flex gap-2 flex-wrap bg-violet-950/20 border border-violet-500/10 p-3 rounded-lg animate-fade-in mt-1">
              {emojis.map(emoji => (
                <button 
                  key={emoji} 
                  type="button" 
                  className="text-base hover:scale-125 transition-transform"
                  onClick={() => handleAddEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </form>
      ) : (
        <div className="p-4 text-center text-xs text-gray-400 bg-violet-950/10 border border-violet-500/10 border-t-0 rounded-b-xl shadow-xl">
          პასუხის დასაწერად გთხოვთ გაიაროთ ავტორიზაცია.
        </div>
      )}
    </div>
  );
};
