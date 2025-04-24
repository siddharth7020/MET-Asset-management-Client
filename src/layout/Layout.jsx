import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
    <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    <div
      className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-16 lg:ml-64' : 'ml-0 md:ml-16 lg:ml-64'
      }`}
    >
      <Navbar toggleSidebar={toggleSidebar} />
      <main className="flex-1 ">
        <div className="py-4 px-4">
          <div className="">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  </div>
  );
}

export default Layout;