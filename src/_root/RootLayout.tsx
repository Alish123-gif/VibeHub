import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Topbar from '@/components/shared/Topbar';
import Bottombar from '@/components/shared/Bottombar';
import Leftbar from '@/components/shared/Leftbar';

const RootLayout = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [showBottombar, setShowBottombar] = useState(true);
  const location = useLocation();

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (location.pathname.startsWith('/chat/')) {
      setShowBottombar(false);
      return;
    }

    if (currentScrollPos >= scrollableHeight - 100) {
      setShowBottombar(false);
    } else if (prevScrollPos > currentScrollPos) {
      setShowBottombar(true);
    } else {
      setShowBottombar(false);
    }

    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos, location.pathname]);

  return (
    <div className="flex flex-col h-screen w-full">
      <Topbar />
      <div className="flex h-full">
        <Leftbar />
        <main className="flex-1 md:ml-[270px] h-[calc(100vh-4rem)] max-w-full"> {/* Adjusted margin-left and height */}
          <Outlet />
        </main>
      </div>
      {!location.pathname.startsWith('/chat/') && (
        <div className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ${showBottombar ? 'translate-y-0' : 'translate-y-full'}`}>
          <Bottombar />
        </div>
      )}
    </div>
  );
};

export default RootLayout;
