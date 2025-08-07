import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';

// Make sure to install react-modal: npm install react-modal

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

// Set the app element (make sure this matches your root element ID)
Modal.setAppElement('#root');

// Custom modal styles
const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    maxWidth: '400px',
    width: '90%',
    padding: '20px',
    borderRadius: '8px',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '0 auto'
  }
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role');
  console.log("Current userRole:", userRole); // Debug line

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get("/username");
        if (response.data.success) {
          setUserData({
            name: response.data.data.name,
            email: response.data.data.email
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const isActive = (path) => location.pathname === path;

const handleLogout = async () => {
  try {
    await api.post("/logout");
    toast.success("Logout successful!");
    
    // Wait for toast to show before clearing storage and redirecting
    setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      window.location.href = "/";
    }, 1500);
  } catch (error) {
    toast.error("Logout failed");
    console.error("Logout error:", error);
  }
};




  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
  };

const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post("/changepassword", passwordForm);
    
    if (response.data.success) {
      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordErrors({});
    }
  } catch (error) {
    console.log("Backend error response:", error.response?.data);
    if (error.response?.data?.data?.errors) {
      // Handle the error structure you provided
      setPasswordErrors(error.response.data.data.errors);
      
      // Also show the general message if available
      if (error.response.data.message) {
       
      }
    } else if (error.response?.data?.errors) {
      // Alternative error structure
      setPasswordErrors(error.response.data.errors);
    } else {
  
    }
  }
};
  // Common navigation links component
  const NavLinks = ({ mobile = false, onClick }) => (
    <>
      <Link
        to="/home"
        onClick={onClick}
        className={`${
          isActive("/home")
            ? mobile 
              ? "font-semibold text-white" 
              : "border-b-2 border-white font-semibold"
            : "hover:text-gray-200"
        }`}
      >
        Home
      </Link>
      <Link
        to="/studentinformation"
        onClick={onClick}
        className={`${
          isActive("/studentinformation")
            ? mobile 
              ? "font-semibold text-white" 
              : "border-b-2 border-white font-semibold"
            : "hover:text-gray-200"
        }`}
      >
        Student Information
      </Link>
      <Link
        to="/marks"
        onClick={onClick}
        className={`${
          isActive("/marks")
            ? mobile 
              ? "font-semibold text-white" 
              : "border-b-2 border-white font-semibold"
            : "hover:text-gray-200"
        }`}
      >
        Marks
      </Link>
{userRole === 'teacher' && (
  <Link
    to="/usermanagement"
    onClick={onClick}
    className={`${
      isActive("/usermanagement")
        ? mobile 
          ? "font-semibold text-white" 
          : "border-b-2 border-white font-semibold"
        : "hover:text-gray-200"
    }`}
  >
    User Management
  </Link>
)}

    </>
  );

  return (
    <nav className="bg-blue-600 text-white shadow-md relative z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold">Student Portal</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <NavLinks />
          
          {/* User Profile Button */}
          {userData.name && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center ml-4 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
            >
              <FaUserCircle className="mr-2" />
              <span className="font-medium">{userData.name}</span>
            </button>
          )}
          
          <button 
            onClick={handleLogout}
            className="ml-4 px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-700 transform transition-transform duration-300 ease-in-out z-40 md:hidden ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-blue-500">
          <div className="text-lg font-bold">Menu</div>
          <button onClick={() => setMenuOpen(false)}>
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col px-6 py-4 space-y-4">
          {userData.name && (
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center pb-4 border-b border-blue-500"
            >
              <FaUserCircle className="mr-2" size={18} />
              <span className="font-medium">{userData.name}</span>
            </button>
          )}
          
          <NavLinks mobile onClick={() => setMenuOpen(false)} />
          
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="mt-4 px-3 py-2 bg-red-500 rounded hover:bg-red-600 transition-colors text-left"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      {/* Profile Modal */}
<Modal
  isOpen={isProfileModalOpen}
  onRequestClose={() => {
    console.log("Closing profile modal"); // Debug log
    setIsProfileModalOpen(false);
  }}
  style={customModalStyles}
  ariaHideApp={false}
>
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">User Profile</h2>
      <button 
        onClick={() => setIsProfileModalOpen(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        <FaTimes size={20} />
      </button>
    </div>
    
    <div className="space-y-3 mb-6">
      <div>
        <p className="text-sm text-gray-600">Name</p>
        <p className="text-gray-800 font-medium">{userData.name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Email</p>
        <p className="text-gray-800 font-medium">{userData.email}</p>
      </div>
    </div>
    
    <div className="flex justify-between">
      <button
        onClick={() => {
          setIsProfileModalOpen(false);
          setIsPasswordModalOpen(true);
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Change Password
      </button>
      <button
        onClick={() => setIsProfileModalOpen(false)}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
</Modal>

      {/* Password Change Modal */}
     {/* Password Change Modal */}
<Modal
  isOpen={isPasswordModalOpen}
  onRequestClose={() => {
    setIsPasswordModalOpen(false);
    setPasswordErrors({}); // Clear errors when closing modal
  }}
  style={customModalStyles}
  ariaHideApp={false}
>
  <div className="p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
      <button 
        onClick={() => {
          setIsPasswordModalOpen(false);
          setPasswordErrors({}); // Clear errors when closing
        }}
        className="text-gray-500 border-blue-300 hover:text-gray-700"
      >
        <FaTimes size={20} />
      </button>
    </div>
    
    {/* General error message */}
    {passwordErrors.message && (
      <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
        {passwordErrors.message}
      </div>
    )}
    
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Current Password
    </label>
    <input
      type="password"
      name="oldPassword"
      value={passwordForm.oldPassword}
      onChange={handlePasswordChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        passwordErrors.oldPassword ? "border-red-500" : "border-gray-300"
      }`}
    />
    {passwordErrors.oldPassword && (
      <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword}</p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      New Password
    </label>
    <input
      type="password"
      name="newPassword"
      value={passwordForm.newPassword}
      onChange={handlePasswordChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
      }`}
    />
    {passwordErrors.newPassword && (
      <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
    )}
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Confirm New Password
    </label>
    <input
      type="password"
      name="confirmPassword"
      value={passwordForm.confirmPassword}
      onChange={handlePasswordChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${
        passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
      }`}
    />
    {passwordErrors.confirmPassword && (
      <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
    )}
  </div>

  <div className="flex justify-end space-x-3 pt-2">
    <button
      type="button"
      onClick={() => {
        setIsPasswordModalOpen(false);
        setPasswordErrors({});
      }}
      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Update Password
    </button>
  </div>
</form>

  </div>
</Modal>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;