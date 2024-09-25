import React from "react";
import { Link, useLocation } from "react-router-dom";
import './Navbar.css';

// Import all the SVGs
import FeedFilled from '../assets/HomeFilled.svg';
import FeedNotFilled from '../assets/HomeNotFilled.svg';
import CalendarFilled from '../assets/CalendarFilled.svg';
import CalendarNotFilled from '../assets/CalendarNotFilled.svg';
import CreateRunFilled from '../assets/CreateFilled.svg';
import CreateRunNotFilled from '../assets/CreateNotFilled.svg';
import MembersFilled from '../assets/MembersFilled.svg';
import MembersNotFilled from '../assets/MembersNotFilled.svg';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav>
      <ul>
        <li className={location.pathname === '/feed' ? 'active' : ''}>
          <Link to="/feed">
            <img 
              src={location.pathname === '/feed' ? FeedFilled : FeedNotFilled} 
              alt="Feed" 
              className="nav-icon"
            />
            <span>Feed</span>
          </Link>
        </li>
        <li className={location.pathname === '/calendar' ? 'active' : ''}>
          <Link to="/calendar">
            <img 
              src={location.pathname === '/calendar' ? CalendarFilled : CalendarNotFilled} 
              alt="Calendar" 
              className="nav-icon"
            />
            <span>Calendar</span>
          </Link>
        </li>
        <li className={location.pathname === '/createrun' ? 'active' : ''}>
          <Link to="/createrun">
            <img 
              src={location.pathname === '/createrun' ? CreateRunFilled : CreateRunNotFilled} 
              alt="Create Run" 
              className="nav-icon"
            />
            <span>Create Run</span>
          </Link>
        </li>
        <li className={location.pathname === '/members' ? 'active' : ''}>
          <Link to="/members">
            <img 
              src={location.pathname === '/members' ? MembersFilled : MembersNotFilled} 
              alt="Members" 
              className="nav-icon"
            />
            <span>Members</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
