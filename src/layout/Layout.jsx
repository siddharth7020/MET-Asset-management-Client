import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';

const Layout = () => {
  return (
    <>
      <div className="h-screen w-full grid grid-cols-[15%_85%] md:grid-cols-[20%_80%] lg:grid-cols-[15%_85%]">
        <Sidebar className="col-span-1" />
        <div className="col-span-1 grid grid-rows-[10%_90%] md:grid-rows-[15%_85%] lg:grid-rows-[5%_95%]">
          <Navbar className="row-span-1" />
          <div className="row-span-1 bg-white"><Outlet /></div>
        </div>
      </div>
    </>

  )
}

export default Layout