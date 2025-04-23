import React from 'react';
import Logo from '../../assets/images/MET-logo.png';

const Sidebar = () => {
  return (
    <>
      <div className=' h-screen w-full  grid grid-rows-[5%_95%] '>
        <div className='bg-navbar text-center bold h-full'>
          <img className='w-full h-full object-fit' src={Logo} alt="" />
          {/* <p className='p-2 bold text-white'>Asset Management System</p> */}
        </div>
        <div className='border-r border-gray-300'>
          <hr className='border-gray-300' />
         
        </div>
      </div>
    </>

  )
}

export default Sidebar