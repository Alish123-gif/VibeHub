import { Outlet } from "react-router-dom";

import Topbar from "@/components/shared/Topbar";
import Bottombar from "@/components/shared/Bottombar";
import Leftbar from "@/components/shared/Leftbar";

const RootLayout = () => {
  return (
    <div className="w-full flex flex-col h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Leftbar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <Bottombar />
    </div>
  );
};

export default RootLayout;
