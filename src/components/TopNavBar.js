import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebaseConfig";  // Firebase auth, Firestore
import { doc, getDoc } from "firebase/firestore";  // Firestore methods
import './TopNavBar.css';

const TopNavBar = () => {
  const [profileImageUrl, setProfileImageUrl] = useState(""); // Profile avatar (emoji)
  const [profileBackgroundColor, setProfileBackgroundColor] = useState(""); // Background color
  const user = auth.currentUser;  // Get the currently logged-in user

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileImageUrl(data.profileImageUrl || "");  // Load avatar
          setProfileBackgroundColor(data.profileBackgroundColor || "");  // Load background color
        }
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="top-navbar">
      <div className="logo-placeholder">
        <h1>CLUB SEND IT</h1>
      </div>
      <ul>
        <li>
          <Link to="/profile" className="profile-link">
            {/* Render the user's avatar and background color */}
            <div
              className="topnav-profile-pic"
              style={{ background: profileBackgroundColor }}
            >
              <span className="topbarnav-avatar-emoji">{profileImageUrl}</span>
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TopNavBar;
