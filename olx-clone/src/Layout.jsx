import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import { Outlet } from 'react-router-dom';


const Layout = () => {
  return (
    <>
      <Navbar />
      <div className=" px-4"> {/* Add padding to push content below fixed navbar */}
        <Outlet />
      </div>
    </>
  );
};

export default Layout;