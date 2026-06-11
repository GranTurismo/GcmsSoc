import React, { createContext, useContext, useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from './AuthContext';

// Structs

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  date: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  comments: Comment[];
}

export interface ForumPost {
  id: string;
  username: string;
  avatar: string;
  text: string;
  date: string;
  likes: string[];
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  posts: ForumPost[];
}

export interface ForumCategory {
  id: string;
  title: string;
  description: string;
  topics: ForumTopic[];
}

export interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  date: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  description: string;
  messages: ChatMessage[];
}

export interface FileItem {
  id: string;
  name: string;
  category: string;
  size: string;
  description: string;
  author: string;
  date: string;
  downloads: number;
  likes: number;
  screenshot?: string;
  comments: Comment[];
}

export interface Diary {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  comments: Comment[];
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  author: string;
  date: string;
  likes: string[];
  comments: Comment[];
}

export interface LibraryArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
}

interface DBContextType {
  news: NewsItem[];
  forumCategories: ForumCategory[];
  chatRooms: ChatRoom[];
  guestbook: ChatMessage[];
  files: FileItem[];
  diaries: Diary[];
  photos: PhotoItem[];
  library: LibraryArticle[];
  
  addNewsComment: (newsId: string, username: string, avatar: string, text: string) => void;
  incrementNewsViews: (newsId: string) => void;
  
  addForumTopic: (categoryId: string, title: string, username: string, avatar: string, text: string) => void;
  addForumPost: (categoryId: string, topicId: string, username: string, avatar: string, text: string) => void;
  likeForumPost: (categoryId: string, topicId: string, postId: string, username: string) => void;
  incrementTopicViews: (categoryId: string, topicId: string) => void;
  
  addChatMessage: (roomId: string, username: string, avatar: string, text: string) => void;
  addGuestbookPost: (username: string, avatar: string, text: string) => void;
  
  uploadFile: (name: string, category: string, size: string, description: string, author: string, screenshot?: string) => void;
  downloadFile: (fileId: string) => void;
  addFileComment: (fileId: string, username: string, avatar: string, text: string) => void;
  
  addDiary: (title: string, content: string, author: string) => void;
  addDiaryComment: (diaryId: string, username: string, avatar: string, text: string) => void;
  
  addPhoto: (url: string, caption: string, author: string) => void;
  likePhoto: (photoId: string, username: string) => void;
  addPhotoComment: (photoId: string, username: string, avatar: string, text: string) => void;
  fetchData: () => Promise<void>;
}

const API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const DBContext = createContext<DBContextType | undefined>(undefined);

export const DBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { fetchUsers } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [guestbook, setGuestbook] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [library, setLibrary] = useState<LibraryArticle[]>([]);

  // 1. Fetch portal data from C# API
  const fetchData = async () => {
    try {
      const [resNews, resForum, resChat, resGuestbook, resFiles, resDiaries, resPhotos, resLibrary] = await Promise.all([
        fetch(`${API_URL}/portal/news`),
        fetch(`${API_URL}/portal/forum`),
        fetch(`${API_URL}/portal/chat`),
        fetch(`${API_URL}/portal/guestbook`),
        fetch(`${API_URL}/portal/files`),
        fetch(`${API_URL}/portal/diaries`),
        fetch(`${API_URL}/portal/photos`),
        fetch(`${API_URL}/portal/library`)
      ]);

      if (resNews.ok) {
        const newsData = await resNews.json();
        const mappedNews = (newsData || []).map((item: any) => ({
          ...item,
          comments: item.comments || []
        }));
        setNews(mappedNews);
      }
      
      if (resForum.ok) {
        const categoriesData = await resForum.json();
        const mappedCategories = (categoriesData || []).map((cat: any) => ({
          ...cat,
          topics: (cat.topics || []).map((t: any) => ({
            ...t,
            posts: (t.posts || []).map((p: any) => ({
              ...p,
              likes: (p.likes || []).map((l: any) => l.username)
            }))
          }))
        }));
        setForumCategories(mappedCategories);
      }

      if (resChat.ok) {
        const chatData = await resChat.json();
        const mappedChat = (chatData || []).map((room: any) => ({
          ...room,
          messages: room.messages || []
        }));
        setChatRooms(mappedChat);
      }

      if (resGuestbook.ok) {
        const guestData = await resGuestbook.json();
        setGuestbook(guestData || []);
      }

      if (resFiles.ok) {
        const filesData = await resFiles.json();
        const mappedFiles = (filesData || []).map((f: any) => ({
          ...f,
          comments: f.comments || []
        }));
        setFiles(mappedFiles);
      }

      if (resDiaries.ok) {
        const diariesData = await resDiaries.json();
        const mappedDiaries = (diariesData || []).map((d: any) => ({
          ...d,
          comments: d.comments || []
        }));
        setDiaries(mappedDiaries);
      }
      
      if (resPhotos.ok) {
        const photosData = await resPhotos.json();
        const mappedPhotos = (photosData || []).map((ph: any) => ({
          ...ph,
          likes: (ph.likes || []).map((l: any) => l.username),
          comments: ph.comments || []
        }));
        setPhotos(mappedPhotos);
      }

      if (resLibrary.ok) {
        const libraryData = await resLibrary.json();
        setLibrary(libraryData || []);
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Establish SignalR hub connection
    const HUB_URL = `${window.location.protocol}//${window.location.hostname}:5000/hub/chat`;
    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => localStorage.getItem('dcms_auth_token') || ""
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveChatMessage", (roomId: string, message: ChatMessage) => {
      setChatRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === roomId) {
            // Avoid duplicates
            if (room.messages.some(m => m.id === message.id)) {
              return room;
            }
            return {
              ...room,
              messages: [...room.messages, message]
            };
          }
          return room;
        });
      });
    });

    connection.on("ReceiveGuestbookPost", (message: ChatMessage) => {
      setGuestbook(prevGuestbook => {
        // Avoid duplicates
        if (prevGuestbook.some(m => m.id === message.id)) {
          return prevGuestbook;
        }
        return [message, ...prevGuestbook]; // Guestbook is descending order
      });
    });

    connection.start()
      .then(() => console.log("SignalR Connected to ChatHub"))
      .catch(err => console.error("SignalR Connection Error: ", err));

    return () => {
      connection.stop();
    };
  }, []);



  const addNewsComment = async (newsId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/news/${newsId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding news comment:', err);
    }
  };

  const incrementNewsViews = async (newsId: string) => {
    try {
      const res = await fetch(`${API_URL}/portal/news/${newsId}/views`, { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Error incrementing news views:', err);
    }
  };

  const addForumTopic = async (categoryId: string, title: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/forum/${categoryId}/topic`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding forum topic:', err);
    }
  };

  const addForumPost = async (categoryId: string, topicId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/forum/${categoryId}/topic/${topicId}/post`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding forum post:', err);
    }
  };

  const likeForumPost = async (categoryId: string, topicId: string, postId: string, username: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/forum/${categoryId}/topic/${topicId}/post/${postId}/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Error liking forum post:', err);
    }
  };

  const incrementTopicViews = async (categoryId: string, topicId: string) => {
    try {
      const res = await fetch(`${API_URL}/portal/forum/${categoryId}/topic/${topicId}/views`, { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Error incrementing topic views:', err);
    }
  };

  const addChatMessage = async (roomId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/chat/${roomId}/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const addGuestbookPost = async (username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/guestbook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding guestbook post:', err);
    }
  };

  const uploadFile = async (name: string, category: string, size: string, description: string, author: string, screenshot?: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/files`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, category, size, description, author, screenshot })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  };

  const downloadFile = async (fileId: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/files/${fileId}/download`, { 
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error registering file download:', err);
    }
  };

  const addFileComment = async (fileId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/files/${fileId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding file comment:', err);
    }
  };

  const addDiary = async (title: string, content: string, author: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/diaries`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, author })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error creating diary entry:', err);
    }
  };

  const addDiaryComment = async (diaryId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/diaries/${diaryId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding diary comment:', err);
    }
  };

  const addPhoto = async (url: string, caption: string, author: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/photos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url, caption, author })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error publishing photo:', err);
    }
  };

  const likePhoto = async (photoId: string, username: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/photos/${photoId}/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Error liking photo:', err);
    }
  };

  const addPhotoComment = async (photoId: string, username: string, avatar: string, text: string) => {
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/portal/photos/${photoId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, avatar, text })
      });
      if (res.ok) {
        await fetchData();
        fetchUsers();
      }
    } catch (err) {
      console.error('Error adding photo comment:', err);
    }
  };

  return (
    <DBContext.Provider value={{
      news,
      forumCategories,
      chatRooms,
      guestbook,
      files,
      diaries,
      photos,
      library,
      
      addNewsComment,
      incrementNewsViews,
      
      addForumTopic,
      addForumPost,
      likeForumPost,
      incrementTopicViews,
      
      addChatMessage,
      addGuestbookPost,
      
      uploadFile,
      downloadFile,
      addFileComment,
      
      addDiary,
      addDiaryComment,
      
      addPhoto,
      likePhoto,
      addPhotoComment,
      fetchData
    }}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => {
  const context = useContext(DBContext);
  if (!context) throw new Error('useDB must be used within a DBProvider');
  return context;
};
