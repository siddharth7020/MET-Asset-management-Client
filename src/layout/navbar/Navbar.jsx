
import MET_logo from '../../assets/images/MET-logo.png';

function Navbar({ toggleSidebar }) {

  return (
    <header className="bg-brand-secondary text-white shadow">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="md:hidden mr-4 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src={MET_logo} alt="MET Logo" className="h-8 mr-3" />
          <h1 className="text-xl font-semibold">MET Asset Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Admin</span>
          <button
            className="bg-brand-primary hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;