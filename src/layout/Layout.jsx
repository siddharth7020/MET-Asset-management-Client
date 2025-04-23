import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar/Navbar';
import Sidebar from './sidebar/Sidebar';

const Layout = () => {
  return (
    <>
      <div className="h-screen w-full grid grid-cols-[15%_85%] md:grid-cols-[20%_80%] lg:grid-cols-[15%_85%] bg-background">
        <div className="">
          <Sidebar className="col-span-1" />
        </div>
        <div className="col-span-1 grid grid-rows-[5%_95%] ">
          <Navbar className="row-span-1" />
          <div className="row-span-1 bg-background"><hr className='border-gray-300' /><Outlet /></div>
        </div>
      </div>
    </>

  )
}

export default Layout