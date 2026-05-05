// layout/Homelayout.jsx

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const Homelayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">

      {/* Sidebar - fixed width */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Header - sticky */}
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <Header />
        </header>

        {/* Page Content */}

        <div className="overflow-y-auto h-full scrollbar-thin  ">
          <Outlet />
        </div>

      </div>

    </div>
  );
};

export default Homelayout;