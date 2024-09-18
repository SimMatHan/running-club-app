import React from "react";
import { Link } from "react-router-dom";
import './TopNavBar.css';

const TopNavBar = () => {
  return (
    <div className="top-navbar">
      <ul>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </div>
  );
};

export default TopNavBar;
