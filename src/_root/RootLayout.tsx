import { Outlet, useLocation } from 'react-router-dom';
import { useRef } from 'react';

import Topbar from '@/components/shared/Topbar';
import Bottombar from '@/components/shared/Bottombar';
import Leftbar from '@/components/shared/Leftbar';

const RootLayout = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="flex flex-col h-screen w-full">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Leftbar />
        <main ref={mainRef} className="flex-1 md:ml-[270px] h-full max-w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
      {!location.pathname.startsWith('/chat/') && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
          <Bottombar />
        </div>
      )}
    </div>
  );
};

export default RootLayout;
