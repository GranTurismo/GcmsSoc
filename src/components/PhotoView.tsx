import React, { useState } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { 
  Image as ImageIcon, ChevronLeft, Calendar, Heart, 
  Send, Plus, X, AlertCircle
} from 'lucide-react';

export const PhotoAlbumsView: React.FC = () => {
  const { photos, addPhoto, likePhoto, addPhotoComment } = useDB();
  const { currentUser } = useAuth();
  const { goBack } = useNav();
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  
  // Lightbox modal state
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const activePhoto = photos.find(p => p.id === activePhotoId);

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim() || !caption.trim()) {
      setError('გთხოვთ შეავსოთ ფოტოს ლინკი და აღწერა.');
      return;
    }
    if (!currentUser) return;

    addPhoto(photoUrl.trim(), caption.trim(), currentUser.username);
    setPhotoUrl('');
    setCaption('');
    setShowForm(false);
    setError('');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser || !activePhotoId) return;
    addPhotoComment(activePhotoId, currentUser.username, currentUser.avatar, commentText.trim());
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

      <div className="flex items-center gap-2.5 border-b border-violet-500/10 pb-3">
        <ImageIcon className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">ფოტოალბომები</h2>
      </div>

      {currentUser ? (
        <div className="relative">
          {!showForm ? (
            <button 
              className="liquid-btn w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-white shadow-lg shadow-violet-500/10" 
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} />
              <span>ფოტოს დამატება (+5 მონეტა)</span>
            </button>
          ) : (
            <form 
              onSubmit={handleUploadPhoto} 
              className="glass-panel p-5 rounded-2xl border border-violet-500/15 space-y-4 animate-fade-in"
            >
              <div className="flex justify-between items-center border-b border-violet-500/10 pb-2">
                <span className="font-bold text-xs md:text-sm text-gray-200">ახალი ფოტოს ატვირთვა</span>
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
                  placeholder="ფოტოს ლინკი (მაგ. Unsplash-დან)"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
                  placeholder="აღწერა"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
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
          გთხოვთ გაიაროთ ავტორიზაცია ფოტოების ასატვირთად.
        </div>
      )}

      {/* Grid of photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 text-xs">
            ფოტოები ჯერ არ არის.
          </div>
        ) : (
          photos.map(photo => (
            <div 
              key={photo.id}
              className="glass-panel overflow-hidden rounded-2xl border border-violet-500/10 hover:border-violet-500/35 cursor-pointer group hover:scale-[1.03] transition-all duration-300 p-2"
              onClick={() => setActivePhotoId(photo.id)}
            >
              <div className="h-28 overflow-hidden rounded-xl relative">
                <img 
                  src={photo.url} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="pt-2 px-1">
                <span className="block text-xs font-bold text-gray-200 truncate group-hover:text-violet-300 transition-colors">
                  {photo.caption}
                </span>
                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                  <span>{photo.author}</span>
                  <span className="flex items-center gap-1">
                    <Heart size={10} fill={photo.likes.length > 0 ? '#ec4899' : 'none'} className={photo.likes.length > 0 ? 'text-pink-500' : 'text-gray-500'} />
                    {photo.likes.length}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox / Comment modal */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xl glass-panel border border-violet-500/20 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-violet-500/10">
              <span className="font-bold text-sm text-gray-200 truncate max-w-[80%]">
                ატვირთა: {activePhoto.author}
              </span>
              <button 
                onClick={() => setActivePhotoId(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-violet-500/10 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scroll Box */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="flex justify-center bg-violet-950/10 p-2 rounded-xl border border-violet-500/5">
                <img 
                  src={activePhoto.url} 
                  alt={activePhoto.caption} 
                  className="max-w-full max-h-[300px] rounded-lg object-contain"
                />
              </div>

              <div className="bg-violet-950/20 p-4 rounded-xl border border-violet-500/5 space-y-3">
                <p className="text-xs md:text-sm text-gray-300 leading-relaxed break-words">{activePhoto.caption}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-violet-400" />
                    {activePhoto.date}
                  </span>

                  {currentUser && (
                    <button 
                      onClick={() => likePhoto(activePhoto.id, currentUser.username)}
                      className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border border-violet-500/10 transition-all hover:bg-violet-500/5 ${
                        activePhoto.likes.includes(currentUser.username) 
                          ? 'text-pink-500 border-pink-500/20 bg-pink-500/5' 
                          : 'text-gray-400'
                      }`}
                    >
                      <Heart size={12} fill={activePhoto.likes.includes(currentUser.username) ? '#ec4899' : 'none'} />
                      <span>{activePhoto.likes.length} მოწონება</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Comments Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-violet-400 tracking-wider uppercase">
                  კომენტარები ({activePhoto.comments.length})
                </h4>

                <div className="space-y-3">
                  {activePhoto.comments.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      კომენტარები ჯერ არ არის. დაწერე პირველი!
                    </div>
                  ) : (
                    activePhoto.comments.map(c => (
                      <div 
                        key={c.id} 
                        className="chat-bubble-anim glass-panel p-3.5 rounded-xl border border-violet-500/5 flex gap-2.5 hover:border-violet-500/15 transition-all"
                      >
                        <img 
                          src={c.avatar} 
                          alt={c.username} 
                          className="w-7 h-7 rounded-full object-cover border border-violet-500/20 flex-shrink-0" 
                        />
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-gray-200">{c.username}</span>
                            <span className="text-[9px] text-gray-500">{c.date}</span>
                          </div>
                          <p className="text-xs text-gray-300 break-words whitespace-pre-wrap">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Comment Box */}
            {currentUser ? (
              <form 
                onSubmit={handleCommentSubmit} 
                className="border-t border-violet-500/10 bg-violet-950/10 p-4 flex gap-2"
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
              <div className="border-t border-violet-500/10 bg-violet-950/10 p-4 text-center text-xs text-gray-500">
                გთხოვთ გაიაროთ ავტორიზაცია კომენტარის დასაწერად.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
