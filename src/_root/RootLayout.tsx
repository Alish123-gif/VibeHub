import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Topbar from '@/components/shared/Topbar';
import Bottombar from '@/components/shared/Bottombar';
import Leftbar from '@/components/shared/Leftbar';

const RootLayout = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [showBottombar, setShowBottombar] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      if (prevScrollPos > currentScrollPos) {
        setShowBottombar(true);
      } else {
        setShowBottombar(false);
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

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
