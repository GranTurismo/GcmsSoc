import React from 'react';
import { useDB } from '../context/DBContext';
import { useNav } from '../context/NavContext';
import { BookOpen, ChevronLeft, Eye, Calendar, User, AlertCircle } from 'lucide-react';

export const LibraryListView: React.FC = () => {
  const { library } = useDB();
  const { navigate, goBack } = useNav();

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
        <BookOpen className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">ბიბლიოთეკა</h2>
      </div>

      <div className="space-y-3">
        {library.map(art => (
          <div 
            key={art.id} 
            className="glass-panel p-5 rounded-2xl border border-violet-500/5 hover:border-violet-500/25 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
            onClick={() => navigate('library_detail', { articleId: art.id })}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-all flex-shrink-0">
                <BookOpen size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-base font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">
                  {art.title}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  კატეგორია: {art.category} &bull; თარიღი: {art.date}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 bg-violet-950/20 px-2.5 py-1 rounded-full border border-violet-500/5 text-xs font-semibold">
              <Eye size={12} className="text-violet-400" />
              <span>{art.views}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LibraryDetailView: React.FC = () => {
  const { library } = useDB();
  const { params, goBack } = useNav();

  const articleId = params.articleId;
  const article = library.find(a => a.id === articleId);

  if (!article) {
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
          <span>სტატია ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  // Increment views
  article.views += 1;

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
          <h2 className="text-base md:text-lg font-bold text-gray-100">{article.title}</h2>
        </div>

        <div className="flex flex-wrap gap-4 text-[10px] text-gray-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-violet-400" />
            {article.date}
          </span>
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-violet-400" />
            ავტორი: {article.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye size={12} className="text-violet-400" />
            ნახვები: {article.views}
          </span>
        </div>
        
        <p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words whitespace-pre-wrap select-text pt-2 font-sans border-t border-violet-500/5">
          {article.content}
        </p>
      </div>
    </div>
  );
};
