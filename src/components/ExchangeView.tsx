import React, { useState } from 'react';
import { useDB } from '../context/DBContext';
import { useAuth } from '../context/AuthContext';
import { useNav } from '../context/NavContext';
import { 
  Download, ChevronLeft, Send, Upload, FileText, ImageIcon, Play, AlertCircle, Sparkles
} from 'lucide-react';

export const ExchangeHomeView: React.FC = () => {
  const { files } = useDB();
  const { navigate } = useNav();

  const categories = ['Music', 'Wallpapers', 'Games'];

  const getFilesCount = (cat: string) => {
    return files.filter(f => f.category === cat).length;
  };

  const getGeorgianCatName = (cat: string) => {
    if (cat === 'Music') return 'მუსიკა';
    if (cat === 'Wallpapers') return 'სურათები';
    if (cat === 'Games') return 'თამაშები';
    return cat;
  };

  const getCatDesc = (cat: string) => {
    if (cat === 'Music') return 'ნოსტალგიური პოლიფონიური მელოდიები და MP3 ზარები';
    if (cat === 'Wallpapers') return 'რეტრო თემები, კიბერპანკი და ნეონის ფონები';
    if (cat === 'Games') return 'რეტრო და ტექსტური WAP თამაშები';
    return 'მომხმარებლების მიერ ატვირთული რესურსები';
  };

  const getCatIcon = (cat: string) => {
    if (cat === 'Music') return <Play size={22} className="text-pink-400" />;
    if (cat === 'Wallpapers') return <ImageIcon size={22} className="text-amber-400" />;
    return <FileText size={22} className="text-sky-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 border-b border-violet-500/10 pb-3">
        <Download className="text-pink-500 w-5 h-5" />
        <h2 className="text-lg font-bold text-gray-100">ფაილების გაცვლა</h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {categories.map(cat => (
          <div 
            key={cat} 
            className="glass-panel p-5 rounded-2xl border border-violet-500/10 hover:border-violet-500/30 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
            onClick={() => navigate('exchange_cat', { category: cat })}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3 rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-all flex items-center justify-center">
                {getCatIcon(cat)}
              </div>
              <div className="min-w-0">
                <span className="block text-base font-bold text-gray-200 group-hover:text-violet-300 transition-colors">
                  {getGeorgianCatName(cat)}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5">
                  {getCatDesc(cat)}
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-950/30 border border-violet-500/20 text-violet-400 font-semibold">
              {getFilesCount(cat)} ფაილი
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ExchangeCatView: React.FC = () => {
  const { files, uploadFile } = useDB();
  const { currentUser } = useAuth();
  const { params, navigate, goBack } = useNav();
  
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const category = params.category;
  const filteredFiles = files.filter(f => f.category === category);

  const getGeorgianCatName = (cat: string) => {
    if (cat === 'Music') return 'მუსიკა';
    if (cat === 'Wallpapers') return 'სურათები';
    if (cat === 'Games') return 'თამაშები';
    return cat;
  };

  if (!category) {
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
          <span>საქაღალდე ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim() || !fileSize.trim() || !fileDesc.trim()) {
      setError('გთხოვთ შეავსოთ სახელი, ზომა და აღწერა.');
      return;
    }
    if (!currentUser) return;

    uploadFile(
      fileName.trim(), 
      category, 
      fileSize.trim(), 
      fileDesc.trim(), 
      currentUser.username,
      screenshotUrl.trim() || undefined
    );
    setFileName('');
    setFileSize('');
    setFileDesc('');
    setScreenshotUrl('');
    setShowForm(false);
    setError('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <button 
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all" 
          onClick={goBack}
        >
          <ChevronLeft size={14} />
          <span>გაცვლის ზონა</span>
        </button>
      </div>

      <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
        <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
          <span>{getGeorgianCatName(category)}</span>
          <span className="text-xs text-gray-500 font-normal">({filteredFiles.length} ფაილი)</span>
        </h2>
      </div>

      {currentUser ? (
        <div className="relative">
          {!showForm ? (
            <button 
              className="liquid-btn w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-white shadow-lg shadow-violet-500/10" 
              onClick={() => setShowForm(true)}
            >
              <Upload size={16} />
              <span>ფაილის ატვირთვა (+15 მონეტა)</span>
            </button>
          ) : (
            <form 
              onSubmit={handleUpload} 
              className="glass-panel p-5 rounded-2xl border border-violet-500/15 space-y-4 animate-fade-in"
            >
              <div className="flex justify-between items-center border-b border-violet-500/10 pb-2">
                <span className="font-bold text-xs md:text-sm text-gray-200">ატვირთვა</span>
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
                  placeholder="ფაილის სახელი (მაგ. Ringtone.mp3)"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
                  placeholder="ფაილის ზომა (მაგ. 1.5 MB)"
                  value={fileSize}
                  onChange={e => setFileSize(e.target.value)}
                />
                <textarea
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors min-h-[80px] resize-none"
                  placeholder="ფაილის აღწერა"
                  value={fileDesc}
                  onChange={e => setFileDesc(e.target.value)}
                />
                <input
                  type="text"
                  className="w-full bg-violet-950/20 border border-violet-500/10 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-violet-500/40 text-gray-200 placeholder-gray-600 transition-colors"
                  placeholder="სქრინშოტის ლინკი (არასავალდებულო)"
                  value={screenshotUrl}
                  onChange={e => setScreenshotUrl(e.target.value)}
                />
              </div>

              <button type="submit" className="liquid-btn w-full py-2.5 rounded-xl font-bold text-xs md:text-sm text-white">
                ატვირთვა
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="glass-panel p-4 rounded-xl text-center text-xs text-gray-500 border border-violet-500/5">
          გთხოვთ გაიაროთ ავტორიზაცია ფაილების ასატვირთად.
        </div>
      )}

      {/* Grid for Wallpapers, List for Music/Games */}
      {category === 'Wallpapers' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredFiles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 text-xs">
              საქაღალდე ცარიელია.
            </div>
          ) : (
            filteredFiles.map(file => (
              <div 
                key={file.id} 
                className="glass-panel overflow-hidden rounded-2xl border border-violet-500/10 hover:border-violet-500/35 cursor-pointer group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate('exchange_file', { fileId: file.id })}
              >
                <div className="h-32 sm:h-40 overflow-hidden relative">
                  <img 
                    src={file.screenshot || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'} 
                    alt={file.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-3">
                    <span className="text-[10px] text-gray-300 bg-violet-950/60 px-2 py-0.5 rounded-full border border-violet-500/20 backdrop-blur-sm">
                      {file.size}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">
                    {file.name}
                  </h4>
                  <span className="text-[9px] text-gray-500 block mt-1 truncate">
                    გადმოწერა: {file.downloads}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              საქაღალდე ცარიელია.
            </div>
          ) : (
            filteredFiles.map(file => (
              <div 
                key={file.id} 
                className="glass-panel p-4 rounded-2xl border border-violet-500/5 hover:border-violet-500/20 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
                onClick={() => navigate('exchange_file', { fileId: file.id })}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-all flex-shrink-0">
                    <Download size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">
                      {file.name}
                    </span>
                    <span className="block text-[10px] text-gray-500 mt-0.5 truncate">
                      ავტორი: {file.author} &bull; ჩამოტვირთვები: {file.downloads}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-950/20 border border-violet-500/10 text-gray-400 font-semibold">
                  {file.size}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export const ExchangeFileView: React.FC = () => {
  const { files, downloadFile, addFileComment } = useDB();
  const { currentUser } = useAuth();
  const { params, goBack } = useNav();
  
  const [commentText, setCommentText] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const fileId = params.fileId;
  const file = files.find(f => f.id === fileId);

  if (!file) {
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
          <span>ფაილი ვერ მოიძებნა.</span>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    downloadFile(file.id);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 4500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUser) return;
    addFileComment(file.id, currentUser.username, currentUser.avatar, commentText.trim());
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

      <div className="glass-panel p-5 rounded-2xl border border-violet-500/10 space-y-5">
        <div className="border-b border-violet-500/10 pb-3">
          <h2 className="text-base md:text-lg font-bold text-gray-100 truncate">{file.name}</h2>
        </div>

        {file.screenshot && (
          <div className="flex justify-center bg-violet-950/10 p-2.5 rounded-2xl border border-violet-500/5">
            <img 
              src={file.screenshot} 
              alt={file.name} 
              className="max-w-full max-h-[260px] rounded-xl object-contain border border-violet-500/15" 
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-violet-950/20 p-4 rounded-2xl border border-violet-500/5 text-xs leading-relaxed text-gray-300">
          <div><span className="text-gray-500">ზომა:</span> <span className="font-bold text-gray-200">{file.size}</span></div>
          <div><span className="text-gray-500">ატვირთა:</span> <span className="font-bold text-gray-200">{file.author}</span></div>
          <div><span className="text-gray-500">თარიღი:</span> <span className="font-bold text-gray-200">{file.date}</span></div>
          <div><span className="text-gray-500">ჩამოტვირთვები:</span> <span className="font-bold text-gray-200">{file.downloads} ჯერ</span></div>
          <div className="sm:col-span-2 pt-2 border-t border-violet-500/10">
            <span className="text-gray-500 block mb-1">აღწერა:</span> 
            <p className="text-xs text-gray-300 break-words">{file.description}</p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in">
            <Sparkles size={14} className="animate-spin-slow" />
            <span>ჩამოტვირთვა დაიწყო! ფაილი წარმატებით გადმოიწერა (+1 მონეტა).</span>
          </div>
        )}

        <button 
          className="liquid-btn w-full py-3.5 rounded-2xl font-bold text-xs md:text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-500/15" 
          onClick={handleDownload}
        >
          <Download size={16} />
          <span>ჩამოტვირთვა</span>
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-violet-400 tracking-wider uppercase">
          შეფასებები და კომენტარები ({file.comments.length})
        </h3>

        <div className="space-y-3.5">
          {file.comments.length === 0 ? (
            <div className="glass-panel p-6 text-center text-gray-500 text-xs rounded-2xl border border-violet-500/5">
              კომენტარები ჯერ არ არის. დატოვე პირველი შეფასება!
            </div>
          ) : (
            file.comments.map(c => (
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
