import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoHome, IoLogOutOutline } from "react-icons/io5";
import { TbPasswordFingerprint  } from "react-icons/tb";
import { ImProfile } from "react-icons/im";
import { PiUserListFill } from "react-icons/pi";
import { logout } from "../../store/actions/authActions"
import { useDispatch } from 'react-redux'; // Import useDispatch

function Footer() {
  const dispatch = useDispatch(); // Initialize useDispatch
  const navigate = useNavigate();
  const location = useLocation(); // To get the current path
  const [activePage, setActivePage] = useState('home'); // State to track the active page

  // Effect to set active page based on the current location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/home') {
      setActivePage('home');
    } else if (path === '/profile') {
      setActivePage('profile');
    } else if (path === '/changePassword') {
      setActivePage('changePassword');
    } else if (path === '/withdrawal') {
      setActivePage('withdrawal');
    }
  }, [location]);

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
    navigate("/login"); // Redirect to the login page
  };

  // Function to handle page changes
  const handlePageChange = (page, path) => {
    setActivePage(page); // Set the active page
    navigate(path); // Navigate to the new path
  };

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg bg-black flex justify-around items-center z-10 text-xs py-2 shadow-lg">
    <div className="text-center text-white w-1/5">
      <Link
        className="flex flex-col items-center"
        to="/home"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange('home', '/home');
        }}
      >
        <IoHome size={20} className={`transition-opacity duration-200 ${activePage === 'home' ? 'opacity-100' : 'opacity-50'}`} />
        <span className={`text-xs mt-1 ${activePage === 'home' ? 'font-bold' : 'opacity-50'}`}>Home</span>
      </Link>
    </div>
    {/* <div className="text-center text-white w-1/5 mt-1">
      <Link
        className="flex flex-col items-center cursor-pointer"
        to="/profile"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange('profile', '/profile');
        }}
      >
        <ImProfile  size={20}  className={` transition-opacity duration-200 ${activePage === 'profile' ? 'opacity-100' : 'opacity-50'}`} />
        <span className={`text-xs mt-1 ${activePage === 'profile' ? 'font-bold' : 'opacity-50'}`}>Profile</span>
      </Link>
    </div> */}
    <div className="text-center text-white w-1/5 mt-1">
      <Link
        className="flex flex-col items-center"
        to="/changePassword"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange('changePassword', '/changePassword');
        }}
      >
        <TbPasswordFingerprint size={22} className={`transition-opacity duration-200 ${activePage === 'changePassword' ? 'opacity-100' : 'opacity-50'}`} />
        <span className={`text-xs mt-1 ${activePage === 'changePassword' ? 'font-bold' : 'opacity-50'}`}>Password</span>
      </Link>
    </div>
    <div className="text-center flex flex-col items-center text-white w-1/5">
      <Link
        className="flex flex-col items-center"
        to="/withdrawal"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange('withdrawal', '/withdrawal');
        }}
      >
        <PiUserListFill 
          size={22}
          alt="Wallet"
          className={` transition-opacity duration-200 ${activePage === 'withdrawal' ? 'opacity-100' : 'opacity-50'}`}
        />
        <span className={`text-xs mt-1  ${activePage === 'withdrawal' ? 'font-bold' : 'opacity-50'}`}>User</span>
      </Link>
    </div>
  <div className="text-center text-white w-1/5">
      <div
        className="flex flex-col items-center cursor-pointer"
        onClick={handleLogout}
      >
        <IoLogOutOutline size={22} className={`transition-opacity duration-200 ${activePage === 'logout' ? 'opacity-100' : 'opacity-50'}`} />
        <span className={`text-xs mt-1 ${activePage === 'logout' ? 'font-bold' : 'opacity-50'}`}>Logout</span>
      </div>
    </div>
  </div>
  );
}

export default Footer;
