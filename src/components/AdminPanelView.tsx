import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDB } from '../context/DBContext';
import { useNav } from '../context/NavContext';
import { 
  Shield, Users, FileText, MessageSquare, Download, 
  Award, Sparkles, Trash2, Edit3, Save, Search, 
  PlusCircle, AlertCircle, Check, HelpCircle
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalTopics: number;
  totalPosts: number;
  totalNews: number;
  totalFiles: number;
  totalDiaries: number;
  totalPhotos: number;
}

export const AdminPanelView: React.FC = () => {
  const { currentUser, allUsers, fetchUsers } = useAuth();
  const { 
    news, forumCategories, chatRooms, files, diaries, photos, fetchData 
  } = useDB();
  const { navigate, goBack } = useNav();

  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'news' | 'forum' | 'chat' | 'files' | 'diaries' | 'photos'>('stats');
  
  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Search/Filters
  const [userQuery, setUserQuery] = useState('');
  
  // Edit forms
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCoins, setEditCoins] = useState<number>(0);
  const [editRating, setEditRating] = useState<number>(0);
  const [editRole, setEditRole] = useState<string>('user');

  // News form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  
  // Chat Room form
  const [chatRoomTitle, setChatRoomTitle] = useState('');
  const [chatRoomDesc, setChatRoomDesc] = useState('');

  // Status/Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('home');
      return;
    }
    loadStats();
  }, [currentUser]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // User Actions
  const handleSaveUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      
      // Update role
      const resRole = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: editRole })
      });

      // Update coins
      const resCoins = await fetch(`${API_URL}/admin/users/${userId}/coins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: editCoins })
      });

      // Update rating
      const resRating = await fetch(`${API_URL}/admin/users/${userId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: editRating })
      });

      if (resRole.ok && resCoins.ok && resRating.ok) {
        showSuccess('მომხმარებლის მონაცემები წარმატებით განახლდა!');
        setEditingUserId(null);
        await fetchUsers();
        await loadStats();
      } else {
        showError('მონაცემების განახლება ვერ მოხერხდა.');
      }
    } catch (err) {
      showError('შეცდომა განახლებისას.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('დარწმუნებული ხართ, რომ გსურთ ამ მომხმარებლის წაშლა?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('მომხმარებელი წაიშალა!');
        await fetchUsers();
        await loadStats();
      } else {
        showError('წაშლა ვერ მოხერხდა.');
      }
    } catch (err) {
      showError('შეცდომა წაშლისას.');
    }
  };

  // News Actions
  const handleCreateOrUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) {
      showError('შეავსეთ სათაური და შინაარსი.');
      return;
    }
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const method = editingNewsId ? 'PUT' : 'POST';
      const url = editingNewsId ? `${API_URL}/admin/news/${editingNewsId}` : `${API_URL}/admin/news`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newsTitle.trim(), content: newsContent.trim() })
      });

      if (res.ok) {
        showSuccess(editingNewsId ? 'სიახლე განახლდა!' : 'სიახლე დაემატა!');
        setNewsTitle('');
        setNewsContent('');
        setEditingNewsId(null);
        await fetchData();
      } else {
        showError('ოპერაცია ჩაიშალა.');
      }
    } catch (err) {
      showError('შეცდომა სერვერთან.');
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/news/${newsId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('სიახლე წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteNewsComment = async (commentId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/news/comment/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('კომენტარი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Forum Actions
  const handleDeleteTopic = async (topicId: string) => {
    if (!window.confirm('თემის წაშლა წაშლის ყველა მასში შემავალ პოსტს. დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/forum/topic/${topicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('თემა წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteForumPost = async (postId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/forum/post/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('პოსტი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Chat Actions
  const handleCreateChatRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatRoomTitle.trim() || !chatRoomDesc.trim()) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/chat/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: chatRoomTitle.trim(), description: chatRoomDesc.trim() })
      });
      if (res.ok) {
        showSuccess('ჩეთ ოთახი დაემატა!');
        setChatRoomTitle('');
        setChatRoomDesc('');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteChatRoom = async (roomId: string) => {
    if (!window.confirm('ოთახის წაშლით წაიშლება ყველა მესიჯი. დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/chat/room/${roomId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('ჩეთ ოთახი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteChatMessage = async (msgId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/chat/message/${msgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('მესიჯი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Files Actions
  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('ფაილი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteFileComment = async (commId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/files/comment/${commId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('კომენტარი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Diaries Actions
  const handleDeleteDiary = async (diaryId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/diaries/${diaryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('დღიური წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeleteDiaryComment = async (commId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/diaries/comment/${commId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('კომენტარი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Photos Actions
  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('სურათი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  const handleDeletePhotoComment = async (commId: string) => {
    if (!window.confirm('დარწმუნებული ხართ?')) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/admin/photos/comment/${commId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showSuccess('კომენტარი წაიშალა.');
        await fetchData();
      }
    } catch (err) {
      showError('შეცდომა.');
    }
  };

  // Filtered lists
  const filteredUsers = allUsers.filter(u => 
    u.username.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.city.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-violet-500/10 pb-4">
        <div className="flex items-center gap-3">
          <Shield className="text-red-500 w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            ადმინისტრატორის მართვის პანელი
          </h2>
        </div>
        <button 
          onClick={goBack}
          className="px-4 py-2 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-300 transition-all"
        >
          უკან
        </button>
      </div>

      {/* Success/Error Alerts */}
      {successMsg && (
        <div className="liquid-alert-success p-5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 max-w-md mx-auto my-3">
          <Check className="w-5 h-5 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="liquid-alert-error p-5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2.5 max-w-md mx-auto my-3">
          <AlertCircle className="w-5 h-5 animate-bounce" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Selectors */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap border-b border-violet-500/5">
        {[
          { id: 'stats', label: 'სტატისტიკა', icon: <Award size={14} /> },
          { id: 'users', label: 'წევრები', icon: <Users size={14} /> },
          { id: 'news', label: 'სიახლეები', icon: <FileText size={14} /> },
          { id: 'forum', label: 'ფორუმი', icon: <MessageSquare size={14} /> },
          { id: 'chat', label: 'ჩეთი', icon: <Sparkles size={14} /> },
          { id: 'files', label: 'ფაილები', icon: <Download size={14} /> },
          { id: 'diaries', label: 'დღიურები', icon: <FileText size={14} /> },
          { id: 'photos', label: 'სურათები', icon: <HelpCircle size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTab === tab.id
                ? 'bg-red-500/20 text-red-300 border-red-500/30 shadow-lg shadow-red-500/5'
                : 'text-gray-400 border-transparent hover:bg-violet-500/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      
      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'მომხმარებელი', count: stats?.totalUsers ?? '...', color: 'text-violet-400' },
              { title: 'სიახლე', count: stats?.totalNews ?? '...', color: 'text-pink-400' },
              { title: 'ფორუმის თემა', count: stats?.totalTopics ?? '...', color: 'text-amber-400' },
              { title: 'პოსტი/კომენტარი', count: stats?.totalPosts ?? '...', color: 'text-emerald-400' },
              { title: 'ფაილი', count: stats?.totalFiles ?? '...', color: 'text-blue-400' },
              { title: 'დღიური', count: stats?.totalDiaries ?? '...', color: 'text-cyan-400' },
              { title: 'სურათი', count: stats?.totalPhotos ?? '...', color: 'text-rose-400' }
            ].map((card, idx) => (
              <div key={idx} className="glass-panel p-4 rounded-xl border border-violet-500/10 hover:border-violet-500/20 transition-all flex flex-col justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{card.title}</span>
                <span className={`text-2xl font-black ${card.color} mt-2`}>
                  {loadingStats ? '...' : card.count}
                </span>
              </div>
            ))}
          </div>
          
          <div className="glass-panel p-5 rounded-xl border border-violet-500/10">
            <h3 className="text-sm font-bold text-gray-200 mb-3 uppercase tracking-wider">სწრაფი ადმინისტრაციული ქმედებები</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              გამოიყენეთ შესაბამისი ტაბები მომხმარებელთა წასაშლელად, როლების დასანიშნად, მონეტების გასაზრდელად ან ნებისმიერი სხვა კონტენტის მოდერაციისთვის.
            </p>
          </div>
        </div>
      )}

      {/* 2. USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="მოძებნე მომხმარებელი (სახელით, ქალაქით)..."
                value={userQuery}
                onChange={e => setUserQuery(e.target.value)}
                className="w-full bg-[#0a0712] border border-violet-500/10 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/30"
              />
            </div>
          </div>

          <div className="glass-panel rounded-xl border border-violet-500/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-violet-500/10 bg-violet-950/20 text-gray-400 font-bold">
                    <th className="p-3">სახელი</th>
                    <th className="p-3">როლი</th>
                    <th className="p-3">მონეტა</th>
                    <th className="p-3">რეიტინგი</th>
                    <th className="p-3">ქალაქი / ასაკი</th>
                    <th className="p-3 text-right">მოქმედება</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/5">
                  {filteredUsers.map(u => {
                    const isEditing = editingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-violet-500/5 transition-colors">
                        <td className="p-3 font-semibold text-gray-200">
                          <div className="flex items-center gap-2">
                            <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-violet-500/30" />
                            <span>{u.username}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editRole}
                              onChange={e => setEditRole(e.target.value)}
                              className="bg-[#0f0b1a] border border-violet-500/20 text-xs rounded p-1 text-gray-300 focus:outline-none"
                            >
                              <option value="user">User</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                              u.role === 'moderator' ? 'bg-amber-500/20 text-amber-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editCoins}
                              onChange={e => setEditCoins(parseInt(e.target.value) || 0)}
                              className="bg-[#0f0b1a] border border-violet-500/20 text-xs rounded p-1 w-16 text-gray-300 text-center"
                            />
                          ) : (
                            <span className="text-yellow-400 font-bold">{u.coins}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editRating}
                              onChange={e => setEditRating(parseInt(e.target.value) || 0)}
                              className="bg-[#0f0b1a] border border-violet-500/20 text-xs rounded p-1 w-16 text-gray-300 text-center"
                            />
                          ) : (
                            <span className="text-green-400 font-bold">{u.rating}</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {u.city} / {u.age}წ.
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-2 justify-end">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveUser(u.id)}
                                  className="p-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 transition-all"
                                  title="შენახვა"
                                >
                                  <Save size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="p-1 rounded bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 transition-all"
                                >
                                  X
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditCoins(u.coins);
                                    setEditRating(u.rating);
                                    setEditRole(u.role);
                                  }}
                                  className="p-1 rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 transition-all"
                                  title="რედაქტირება"
                                >
                                  <Edit3 size={14} />
                                </button>
                                {u.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all"
                                    title="წაშლა"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. NEWS TAB */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Create/Edit form */}
          <form onSubmit={handleCreateOrUpdateNews} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {editingNewsId ? 'სიახლის რედაქტირება' : 'ახალი სიახლის დამატება'}
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">სათაური</label>
              <input
                type="text"
                placeholder="სიახლის სათაური..."
                value={newsTitle}
                onChange={e => setNewsTitle(e.target.value)}
                className="w-full bg-[#0a0712] border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">ტექსტი</label>
              <textarea
                placeholder="სიახლის შინაარსი..."
                value={newsContent}
                onChange={e => setNewsContent(e.target.value)}
                rows={4}
                className="w-full bg-[#0a0712] border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/20 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="liquid-btn text-xs font-semibold px-4 py-2 rounded-xl text-white">
                {editingNewsId ? 'სიახლის განახლება' : 'დამატება'}
              </button>
              {editingNewsId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNewsId(null);
                    setNewsTitle('');
                    setNewsContent('');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-violet-500/20 hover:bg-violet-500/10 text-gray-400"
                >
                  გაუქმება
                </button>
              )}
            </div>
          </form>

          {/* List News */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">სიახლეები და კომენტარები</h3>
            {news.map(n => (
              <div key={n.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{n.title}</h4>
                    <span className="text-[10px] text-gray-500 font-medium">ავტორი: {n.author} | {n.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingNewsId(n.id);
                        setNewsTitle(n.title);
                        setNewsContent(n.content);
                      }}
                      className="p-1.5 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 transition-all"
                      title="რედაქტირება"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(n.id)}
                      className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      title="წაშლა"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed bg-black/10 p-2.5 rounded-lg border border-violet-500/5">
                  {n.content}
                </p>

                {/* News Comments */}
                <div className="space-y-2 pl-4 border-l border-violet-500/10">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">კომენტარები ({n.comments.length})</span>
                  {n.comments.map(c => (
                    <div key={c.id} className="flex justify-between items-start text-xs bg-violet-950/5 p-2 rounded-lg border border-violet-500/5">
                      <div className="flex gap-2">
                        <img src={c.avatar} className="w-5 h-5 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-gray-300 block">{c.username}</span>
                          <p className="text-gray-400 mt-0.5">{c.text}</p>
                          <span className="text-[9px] text-gray-500 mt-1 block">{c.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteNewsComment(c.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="კომენტარის წაშლა"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FORUM TAB */}
      {activeTab === 'forum' && (
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">ფორუმის თემებისა და პოსტების მოდერაცია</h3>
          {forumCategories.map(cat => (
            <div key={cat.id} className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-violet-400 tracking-wider border-b border-violet-500/10 pb-1">{cat.title}</h4>
              
              <div className="space-y-3">
                {cat.topics.map(t => (
                  <div key={t.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-gray-200 block">{t.title}</span>
                        <span className="text-[9px] text-gray-500">ავტორი: {t.author} | {t.date}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteTopic(t.id)}
                        className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1"
                        title="თემის წაშლა"
                      >
                        <Trash2 size={12} />
                        <span>თემის წაშლა</span>
                      </button>
                    </div>

                    {/* Replies */}
                    <div className="space-y-2 pl-4 border-l border-violet-500/10 mt-2">
                      <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">პოსტები ({t.posts.length})</span>
                      {t.posts.map(p => (
                        <div key={p.id} className="flex justify-between items-start text-[11px] bg-violet-950/5 p-2 rounded-lg border border-violet-500/5">
                          <div>
                            <span className="font-bold text-gray-300 block">{p.username}</span>
                            <p className="text-gray-400 mt-0.5">{p.text}</p>
                            <span className="text-[8px] text-gray-500 mt-1 block">{p.date}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteForumPost(p.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="პოსტის წაშლა"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. CHAT TAB */}
      {activeTab === 'chat' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateChatRoom} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">ახალი ჩეთ ოთახის შექმნა</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="ოთახის სახელი..."
                value={chatRoomTitle}
                onChange={e => setChatRoomTitle(e.target.value)}
                className="w-full bg-[#0a0712] border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/20"
              />
              <input
                type="text"
                placeholder="აღწერა..."
                value={chatRoomDesc}
                onChange={e => setChatRoomDesc(e.target.value)}
                className="w-full bg-[#0a0712] border border-violet-500/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-violet-500/20"
              />
            </div>
            <button type="submit" className="liquid-btn text-xs font-semibold px-4 py-2 rounded-xl text-white flex items-center gap-1">
              <PlusCircle size={14} />
              <span>ოთახის შექმნა</span>
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">ოთახები და მესიჯები</h3>
            {chatRooms.map(room => (
              <div key={room.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-gray-200">{room.title}</h4>
                    <p className="text-[10px] text-gray-500">{room.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteChatRoom(room.id)}
                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>ოთახის წაშლა</span>
                  </button>
                </div>

                {/* Messages list */}
                <div className="space-y-1.5 pl-4 border-l border-violet-500/10 max-h-[200px] overflow-y-auto pr-1">
                  <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">ბოლო მესიჯები ({room.messages.length})</span>
                  {room.messages.map(m => (
                    <div key={m.id} className="flex justify-between items-center text-[10px] bg-violet-950/5 p-1.5 rounded border border-violet-500/5">
                      <div>
                        <span className="font-bold text-gray-300">{m.username}:</span>
                        <span className="text-gray-400 ml-1.5">{m.text}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteChatMessage(m.id)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FILES TAB */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">ფაილების მოდერაცია</h3>
          <div className="space-y-3">
            {files.map(f => (
              <div key={f.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{f.name} ({f.size})</h4>
                    <span className="text-[9px] text-gray-500">ავტორი: {f.author} | კატეგორია: {f.category}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(f.id)}
                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>წაშლა</span>
                  </button>
                </div>

                {/* Comments */}
                <div className="space-y-1.5 pl-4 border-l border-violet-500/10">
                  <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">კომენტარები ({f.comments.length})</span>
                  {f.comments.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-[10px] bg-violet-950/5 p-1.5 rounded border border-violet-500/5">
                      <div>
                        <span className="font-bold text-gray-300">{c.username}:</span>
                        <span className="text-gray-400 ml-1.5">{c.text}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteFileComment(c.id)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. DIARIES TAB */}
      {activeTab === 'diaries' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">დღიურების მოდერაცია</h3>
          <div className="space-y-3">
            {diaries.map(d => (
              <div key={d.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{d.title}</h4>
                    <span className="text-[9px] text-gray-500">ავტორი: {d.author} | {d.date}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteDiary(d.id)}
                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>დღიურის წაშლა</span>
                  </button>
                </div>
                <p className="text-xs text-gray-400 italic bg-black/10 p-2 rounded-lg border border-violet-500/5">
                  {d.content}
                </p>

                {/* Comments */}
                <div className="space-y-1.5 pl-4 border-l border-violet-500/10">
                  <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">კომენტარები ({d.comments.length})</span>
                  {d.comments.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-[10px] bg-violet-950/5 p-1.5 rounded border border-violet-500/5">
                      <div>
                        <span className="font-bold text-gray-300">{c.username}:</span>
                        <span className="text-gray-400 ml-1.5">{c.text}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteDiaryComment(c.id)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PHOTOS TAB */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">ფოტოალბომების მოდერაცია</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map(ph => (
              <div key={ph.id} className="glass-panel p-4 rounded-xl border border-violet-500/10 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <span className="text-[9px] text-gray-500 font-bold uppercase">ავტორი: {ph.author}</span>
                      <p className="text-xs text-gray-300 font-medium line-clamp-1">{ph.caption}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(ph.id)}
                      className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      title="სურათის წაშლა"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <img src={ph.url} className="w-full h-32 object-cover rounded-lg border border-violet-500/10 mb-2" />
                </div>

                {/* Comments */}
                <div className="space-y-1 pl-2 border-l border-violet-500/10">
                  <span className="text-[8px] text-gray-500 font-bold uppercase block mb-1">კომენტარები ({ph.comments.length})</span>
                  {ph.comments.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-[9px] bg-violet-950/5 p-1 rounded border border-violet-500/5">
                      <div>
                        <span className="font-bold text-gray-300">{c.username}:</span>
                        <span className="text-gray-400 ml-1">{c.text}</span>
                      </div>
                      <button
                        onClick={() => handleDeletePhotoComment(c.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
