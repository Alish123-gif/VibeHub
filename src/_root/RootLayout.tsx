import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Topbar from '@/components/shared/Topbar';
import Bottombar from '@/components/shared/Bottombar';
import Leftbar from '@/components/shared/Leftbar';

const RootLayout = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [showBottombar, setShowBottombar] = useState(true);

  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

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

  // Attach scroll event listener directly in the component
  window.addEventListener('scroll', handleScroll);

  // Clean up the event listener manually when the component is removed
  const cleanup = () => {
    window.removeEventListener('scroll', handleScroll);
  };

  // Use cleanup function in case of component unmount
  window.addEventListener('beforeunload', cleanup);

  return (
    <div className="w-full flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Leftbar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <div className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ${showBottombar ? 'translate-y-0' : 'translate-y-full'}`}>
        <Bottombar />
      </div>
    </div>
  );
};

export default RootLayout;
