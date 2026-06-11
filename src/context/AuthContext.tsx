import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  avatar: string;
  status: string;
  coins: number;
  rating: number;
  sex: 'Male' | 'Female';
  age: number;
  city: string;
  regDate: string;
  role: 'admin' | 'moderator' | 'user';
  isOnline: boolean;
  currentAction?: string;
  bio?: string;
}

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, sex: 'Male' | 'Female', age: number, city: string) => Promise<boolean>;
  logout: () => void;
  updateStatus: (status: string) => void;
  updateAvatar: (avatarUrl: string) => void;
  updateBio: (bio: string) => void;
  giveGift: (recipientId: string) => Promise<boolean>;
  unreadMailCount: number;
  clearUnreadMail: () => void;
  fetchUsers: () => Promise<void>;
}

const API_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dcms_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [unreadMailCount, setUnreadMailCount] = useState<number>(3);

  // 1. Fetch all users from C# Web API
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users`);
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dcms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dcms_current_user');
    }
  }, [currentUser]);

  // Keep list updated if current user details change
  useEffect(() => {
    if (currentUser) {
      setAllUsers(prev => prev.map(u => u.id === currentUser.id ? currentUser : u));
    }
  }, [currentUser]);

  // Keep current user in sync with allUsers updates
  useEffect(() => {
    if (currentUser) {
      const freshUser = allUsers.find(u => u.id === currentUser.id);
      if (freshUser && (
        freshUser.coins !== currentUser.coins || 
        freshUser.rating !== currentUser.rating || 
        freshUser.bio !== currentUser.bio || 
        freshUser.status !== currentUser.status || 
        freshUser.avatar !== currentUser.avatar
      )) {
        setCurrentUser(freshUser);
      }
    }
  }, [allUsers, currentUser]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('dcms_auth_token', data.token);
        setCurrentUser(data.user);
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    return false;
  };

  const register = async (username: string, password: string, sex: 'Male' | 'Female', age: number, city: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, sex, age, city })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('dcms_auth_token', data.token);
        setCurrentUser(data.user);
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
    return false;
  };

  const logout = async () => {
    if (currentUser) {
      try {
        const token = localStorage.getItem('dcms_auth_token');
        await fetch(`${API_URL}/auth/logout/${currentUser.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
      localStorage.removeItem('dcms_auth_token');
      setCurrentUser(null);
      await fetchUsers();
    }
  };

  const updateStatus = async (status: string) => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/auth/status/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/auth/avatar/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarUrl })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
    }
  };

  const updateBio = async (bio: string) => {
    if (!currentUser) return;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/auth/bio/${currentUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      }
    } catch (err) {
      console.error('Error updating bio:', err);
    }
  };

  const giveGift = async (recipientId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const token = localStorage.getItem('dcms_auth_token');
      const res = await fetch(`${API_URL}/auth/gift/${recipientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const updatedSender = await res.json();
        setCurrentUser(updatedSender);
        await fetchUsers();
        return true;
      }
    } catch (err) {
      console.error('Error giving gift:', err);
    }
    return false;
  };

  const clearUnreadMail = () => {
    setUnreadMailCount(0);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      allUsers,
      login,
      register,
      logout,
      updateStatus,
      updateAvatar,
      updateBio,
      giveGift,
      unreadMailCount,
      clearUnreadMail,
      fetchUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
