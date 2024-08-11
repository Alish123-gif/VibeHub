import { useState } from 'react';
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
      // Hide Bottombar when in a chat route
      setShowBottombar(false);
      return;
    }

    if (currentScrollPos >= scrollableHeight - 100) {
      // Hide Bottombar when at the bottom of the page
      setShowBottombar(false);
    } else if (prevScrollPos > currentScrollPos) {
      // Show Bottombar when scrolling up
      setShowBottombar(true);
    } else {
      // Hide Bottombar when scrolling down
      setShowBottombar(false);
    }

    setPrevScrollPos(currentScrollPos);
  };

  // Attach scroll event listener directly in the render function
  window.addEventListener('scroll', handleScroll);

  // Clean up the event listener manually when the component is removed
  window.addEventListener('beforeunload', () => {
    window.removeEventListener('scroll', handleScroll);
  });

  return (
    <div className="w-full flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Leftbar />
        <main className="flex-1 overflow-hidden">
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
