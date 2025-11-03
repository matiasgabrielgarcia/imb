import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'; 
import './Dashboard.css';


import { Link } from 'react-router-dom';
import './DropdownMenu.css';

export const DropdownMenu = () => {
  const [open, setOpen] = useState(false);

  const { user, logout } = useAuth(); 
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="menu-container">
      <div className="profile-trigger" onClick={() => setOpen(!open)}>
        <img src="/profile-img.png" alt="Profile" className="profile-icon" />
        <span>My Profile</span>
      </div>

      {open && (
        <div className="dropdown">
          <Link to="/profile" className="dropdown-item">Profile</Link>
          <Link to="/dashboard" className="dropdown-item">Dashboard</Link>
          <a onClick={handleLogout} className="dropdown-item" >
            Logout
          </a>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;