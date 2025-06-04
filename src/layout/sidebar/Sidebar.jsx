import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import MET_logo from '../../assets/images/MET-logo.png';

function Sidebar({ isOpen, toggleSidebar }) {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'Masters',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      subItems: [
        { name: 'Financial Year', path: '/masters/financial-year', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { name: 'Institute', path: '/masters/institute', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Location', path: '/masters/location', icon: 'M12 2C8.134 2 5 5.134 5 9c0 3.866 7 13 7 13s7-9.134 7-13c0-3.866-3.134-7-7-7zm0 9a2.5 2.5 0 110-5 2.5 2.5 0 010 5z' },
        { name: 'Vendor', path: '/masters/vendor', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
        { name: 'Unit', path: '/masters/unit', icon: 'M20 7l-10-4-10 4v10l10 4 10-4V7z' },
        { name: 'Category', path: '/masters/category', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
        { name: 'Item', path: '/masters/item', icon: 'M16 4v12l-4-2-4 2V4h8z' },
      ],
    },
    {
      name: 'Purchase',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      subItems: [
        { name: 'Purchase Order', path: '/purchase/purchase-order', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
        { name: 'GRN', path: '/purchase/grn', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { name: 'Invoice', path: '/purchase/invoice', icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z' },
      ],
    },
    {
      name: 'Quick Purchase',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      subItems: [
        { name: 'Quick GRN', path: '/quick-purchase/quick-grn', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.414a2 2 0 01-2.828 0l-4.586-4.586a2 2 0 112.828-2.828l4.586 4.586a2 2 0 002.828 0z' },
        { name: 'Quick Invoice', path: '/quick-purchase/quick-invoice', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      ],
    },
    {
      name: 'Distribution',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      subItems: [
        { name: 'Stock Storage', path: '/stock/stock-storage', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z' },
        { name: 'Distribution Item', path: '/distribution/distribution-item', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
        { name: 'Return Item', path: '/distribution/return-item', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
      ],
    },
    {
      name: 'Report',
      path: '/reports',
      icon: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
    },
  ];

  return (
    <>
      <aside
        className={`sidebar fixed top-0 left-0 h-screen bg-white shadow-md z-50 
          ${isOpen ? 'w-64' : 'w-16 md:w-16'} 
          md:${isOpen ? 'w-64' : 'w-16'} 
          lg:w-64 transition-all duration-300 
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-4">
          <img src={MET_logo} alt="MET Logo" className=" w-auto" />
          <nav className="mt-6 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  {item.path ? (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`
                      }
                      onClick={() => isOpen && toggleSidebar()} // Close sidebar on mobile after click
                    >
                      <svg
                        className="w-5 h-5 mr-3 nav-icon flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      <span className={`${isOpen ? 'block' : 'hidden md:hidden lg:block'}`}>{item.name}</span>
                    </NavLink>
                  ) : (
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className="flex items-center w-full px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <svg
                        className="w-5 h-5 mr-3 nav-icon flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      <span className={`${isOpen ? 'block' : 'hidden md:hidden lg:block'} flex-1 text-left`}>{item.name}</span>
                      <svg
                        className={`w-4 h-4 ml-auto nav-icon transform ${openMenus[item.name] ? 'rotate-180' : ''} ${isOpen ? 'block' : 'hidden md:hidden lg:block'
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                  {item.subItems && openMenus[item.name] && (
                    <ul className={`ml-6 mt-2 space-y-2 ${isOpen ? 'block' : 'hidden md:hidden lg:block'}`}>
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-brand-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                              }`
                            }
                            onClick={() => isOpen && toggleSidebar()} // Close sidebar on mobile after click
                          >
                            <svg
                              className="w-4 h-4 mr-3 nav-icon flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={subItem.icon} />
                            </svg>
                            <span className={`${isOpen ? 'block' : 'hidden md:hidden lg:block'}`}>{subItem.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      {isOpen && (
        <div
          className="sidebar-overlay md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;