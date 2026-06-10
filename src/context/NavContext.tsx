import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ScreenState {
  page: string;
  params?: Record<string, any>;
}

interface NavContextType {
  page: string;
  params: Record<string, any>;
  navigate: (page: string, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ScreenState[]>([{ page: 'home' }]);

  const current = history[history.length - 1] || { page: 'home' };

  // Sync back button / navigation with browser hash if wanted,
  // but state history is cleaner for a WAP simulator.
  // We'll support browser navigation history by listening to popstate.
  useEffect(() => {
    const handlePopState = () => {
      if (history.length > 1) {
        setHistory(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [history]);

  const navigate = (page: string, params?: Record<string, any>) => {
    // Scroll to top of layout on navigate
    const container = document.querySelector('.wap-content');
    if (container) {
      container.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setHistory(prev => [...prev, { page, params }]);
    window.history.pushState(null, '', '');
  };

  const goBack = () => {
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
      // scroll smoothly to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const canGoBack = history.length > 1;

  return (
    <NavContext.Provider value={{
      page: current.page,
      params: current.params || {},
      navigate,
      goBack,
      canGoBack
    }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  const context = useContext(NavContext);
  if (!context) throw new Error('useNav must be used within a NavProvider');
  return context;
};
