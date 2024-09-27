import React from "react";
import { Link } from "react-router-dom";
import ProfilePic from '../assets/Profile.svg'; // Import the SVG file
import './TopNavBar.css';

const TopNavBar = () => {
  return (
    <div className="top-navbar">
      <div className="logo-placeholder">
        <h1>CLUB SEND IT</h1>
      </div>
      <ul>
        <li>
          <Link to="/profile" className="profile-link">
            {/* Render the SVG image */}
            <img src={ProfilePic} alt="Profile" className="profile-pic" />
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TopNavBar;
