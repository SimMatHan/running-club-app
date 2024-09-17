import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/feed">Feed</Link>
        </li>
        <li>
          <Link to="/calendar">Calendar</Link>
        </li>
        <li>
          <Link to="/members">Members</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
