import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DBProvider, useDB } from './context/DBContext';
import { NavProvider, useNav } from './context/NavContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages/Modules Imports
import { LoginView, RegisterView } from './components/AuthViews';
import { NewsListView, NewsDetailView } from './components/NewsView';
import { ForumHomeView, ForumCatView, ForumTopicView } from './components/ForumView';
import { ChatHomeView, ChatRoomView, GuestbookView } from './components/ChatView';
import { ExchangeHomeView, ExchangeCatView, ExchangeFileView } from './components/ExchangeView';
import { DiariesListView, DiariesDetailView } from './components/DiariesView';
import { PhotoAlbumsView } from './components/PhotoView';
import { DatingView } from './components/DatingView';
import { LeadersView } from './components/LeadersView';
import { OnlineUsersListView, ProfileView } from './components/OnlineView';
import { LibraryListView, LibraryDetailView } from './components/LibraryView';
import { AdminPanelView } from './components/AdminPanelView';

// Home Specific Icons
import { 
  MessageSquare, FileText, Download, Users, Award, 
  BookOpen, Image as ImageIcon, Heart, Sparkles, ChevronRight 
} from 'lucide-react';

const MENU_ITEMS = [
  { page: 'forum_home', title: 'ფორუმი', desc: 'დისკუსიები ტექნოლოგიებზე, თამაშებზე და სხვა თემებზე', icon: <MessageSquare size={18} /> },
  { page: 'chat_home', title: 'ჩეთი და სტუმრები', desc: 'ცოცხალი მიმოწერა, ოთახები და სტუმრების წიგნი', icon: <Sparkles size={18} /> },
  { page: 'exchange_home', title: 'ფაილების გაცვლა', desc: 'თამაშები, მუსიკა, სურათები და სასარგებლო ფაილები', icon: <Download size={18} /> },
  { page: 'diaries', title: 'დღიურები', desc: 'მომხმარებელთა პირადი ჩანაწერები და დღიურები', icon: <FileText size={18} /> },
  { page: 'photo_albums', title: 'ფოტოალბომები', desc: 'მომხმარებლების ფოტოები და ალბომები', icon: <ImageIcon size={18} /> },
  { page: 'dating', title: 'გაცნობა', desc: 'იპოვეთ ახალი მეგობრები და მეწყვილეები კითხვარით', icon: <Heart size={18} className="text-pink-500" /> },
  { page: 'leaders', title: 'ლიდერები', desc: 'საიტის ყველაზე მდიდარი და რეიტინგული წევრები', icon: <Award size={18} /> },
  { page: 'online', title: 'საიტზეა', desc: 'ონლაინ მომხმარებლების სია და მათი მოქმედებები', icon: <Users size={18} /> },
  { page: 'library', title: 'ბიბლიოთეკა', desc: 'საინტერესო სტატიები, WAP სახელმძღვანელოები და კოდები', icon: <BookOpen size={18} /> }
];

const HomeView: React.FC = () => {
  const { navigate } = useNav();

  return (
    <div className="space-y-6">
      {/* Latest news snapshot */}
      <NewsListView />

      {/* Main navigation links (mobile/tablet only, hidden on desktop sidebar layout) */}
      <div className="lg:hidden">
        <h3 className="font-extrabold text-sm text-violet-400 mb-4 tracking-wider uppercase border-b border-violet-500/10 pb-2">
          მთავარი ნავიგაცია
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MENU_ITEMS.map(item => (
            <div 
              key={item.page} 
              className="glass-panel p-4 rounded-xl border border-violet-500/10 hover:border-violet-500/30 flex items-center justify-between cursor-pointer group hover:scale-[1.01] transition-all duration-300" 
              onClick={() => navigate(item.page)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-pink-400 transition-all">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-bold text-gray-200 group-hover:text-violet-300 transition-colors truncate">{item.title}</span>
                  <span className="block text-[10px] text-gray-500 truncate">{item.desc}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { page, navigate } = useNav();
  const { allUsers } = useAuth();
  const { news } = useDB();

  const renderContent = () => {
    switch (page) {
      case 'home':
        return <HomeView />;
      case 'news_detail':
        return <NewsDetailView />;
      case 'forum_home':
        return <ForumHomeView />;
      case 'forum_cat':
        return <ForumCatView />;
      case 'forum_topic':
        return <ForumTopicView />;
      case 'chat_home':
        return <ChatHomeView />;
      case 'chat_room':
        return <ChatRoomView />;
      case 'guestbook':
        return <GuestbookView />;
      case 'exchange_home':
        return <ExchangeHomeView />;
      case 'exchange_cat':
        return <ExchangeCatView />;
      case 'exchange_file':
        return <ExchangeFileView />;
      case 'diaries':
        return <DiariesListView />;
      case 'diaries_detail':
        return <DiariesDetailView />;
      case 'photo_albums':
        return <PhotoAlbumsView />;
      case 'dating':
        return <DatingView />;
      case 'leaders':
        return <LeadersView />;
      case 'online':
        return <OnlineUsersListView />;
      case 'profile':
        return <ProfileView />;
      case 'library':
        return <LibraryListView />;
      case 'library_detail':
        return <LibraryDetailView />;
      case 'admin_panel':
        return <AdminPanelView />;
      case 'login':
        return <LoginView />;
      case 'register':
        return <RegisterView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#06040a] text-gray-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background blobs for premium depth */}
      <div className="glow-bubble-1"></div>
      <div className="glow-bubble-2"></div>
      
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 relative z-10">
        <Header />
        
        {/* Main 3-column Portal Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Sidebar - Navigation (Desktop only) */}
          <aside className="lg:col-span-3 hidden lg:flex flex-col gap-4 sticky top-6">
            <div className="glass-panel p-5 rounded-2xl border border-violet-500/20 shadow-xl">
              <h3 className="font-extrabold text-sm text-violet-400 mb-4 tracking-wider uppercase border-b border-violet-500/10 pb-2">
                ნავიგაცია
              </h3>
              <nav className="flex flex-col gap-2">
                {MENU_ITEMS.map(item => {
                  const isActive = page === item.page;
                  return (
                    <button
                      key={item.page}
                      onClick={() => navigate(item.page)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-violet-500/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10 translate-x-1'
                          : 'text-gray-400 hover:text-white hover:bg-violet-500/5 hover:translate-x-1 border border-transparent'
                      }`}
                    >
                      <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-pink-500' : 'text-violet-400'}`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Center Main Content Area */}
          <main className="lg:col-span-6 w-full glass-panel p-5 md:p-6 rounded-2xl border border-violet-500/20 shadow-2xl min-h-[500px] overflow-hidden">
            <div key={page} className="page-transition">
              {renderContent()}
            </div>
          </main>

          {/* Right Sidebar - Widgets (Desktop only) */}
          <aside className="lg:col-span-3 hidden lg:flex flex-col gap-5 sticky top-6">
            
            {/* Online Users Widget */}
            <div className="glass-panel p-5 rounded-2xl border border-violet-500/20 shadow-xl">
              <h3 className="font-extrabold text-sm text-violet-400 mb-4 tracking-wider uppercase border-b border-violet-500/10 pb-2 flex items-center gap-2">
                <Users size={16} className="text-pink-500 animate-pulse" />
                <span>აქტიური წევრები</span>
              </h3>
              <div className="flex flex-col gap-3.5 max-h-[250px] overflow-y-auto pr-1">
                {allUsers.filter(u => u.isOnline).slice(0, 6).map(u => (
                  <div
                    key={u.id}
                    onClick={() => navigate('profile', { userId: u.id })}
                    className="flex items-center gap-3 group cursor-pointer hover:bg-violet-500/5 p-1.5 rounded-lg transition-all"
                    title={`აკეთებს: ${u.currentAction}`}
                  >
                    <div className="relative">
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-8 h-8 rounded-full object-cover border border-violet-500/30 group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-[#06040a] rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold group-hover:text-violet-400 transition-colors truncate">
                        {u.username}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {u.currentAction}
                      </div>
                    </div>
                  </div>
                ))}
                {allUsers.filter(u => u.isOnline).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-4">საიტზე არავინაა</div>
                )}
              </div>
            </div>

            {/* Latest News Widget */}
            <div className="glass-panel p-5 rounded-2xl border border-violet-500/20 shadow-xl">
              <h3 className="font-extrabold text-sm text-violet-400 mb-3 tracking-wider uppercase border-b border-violet-500/10 pb-2">
                ბოლო სიახლე
              </h3>
              {news[0] ? (
                <div 
                  onClick={() => news[0] && navigate('news_detail', { newsId: news[0].id })}
                  className="group cursor-pointer hover:bg-violet-500/5 p-2 rounded-xl transition-all"
                >
                  <h4 className="text-xs font-bold text-gray-200 group-hover:text-violet-400 transition-colors mb-1 truncate">
                    {news[0].title}
                  </h4>
                  <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                    {news[0].content}
                  </p>
                  <span className="text-[9px] text-violet-400 mt-2 block font-medium">
                    კომენტარები ({news[0].comments.length})
                  </span>
                </div>
              ) : (
                <div className="text-xs text-gray-500 py-2">სიახლეები არ არის</div>
              )}
            </div>

          </aside>
        </div>

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <NavProvider>
      <AuthProvider>
        <DBProvider>
          <AppContent />
        </DBProvider>
      </AuthProvider>
    </NavProvider>
  );
}

export default App;
