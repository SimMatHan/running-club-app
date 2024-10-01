import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebaseConfig";  // Firebase auth, Firestore
import { doc, getDoc } from "firebase/firestore";  // Firestore methods
import './Profile.css';
import defaultProfilePic from '../assets/ProfileGrey.svg';  // Default image
import DesignProfilePicPopup from '../components/DesignProfilePicPopup'; // Import the new popup component

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [preferredGear, setPreferredGear] = useState("");
  const [preferredDistance, setPreferredDistance] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // Profile image URL (avatar)
  const [profileBackgroundColor, setProfileBackgroundColor] = useState(""); // Background color for the avatar
  const [runningGoals, setRunningGoals] = useState(""); // Running goals
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");  // Success or error message
  const [showDesignPopup, setShowDesignPopup] = useState(false); // State to show/hide avatar design popup

  const user = auth.currentUser;  // Get the currently logged-in user

  // Function to fetch user data from Firestore
  const fetchUserData = useCallback(async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));  // Get the user's document from Firestore
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setPreferredGear(data.preferredGear || "");
        setPreferredDistance(data.preferredDistance || "");
        setProfileImageUrl(data.profileImageUrl || "");  // Fetch stored profile image (avatar)
        setProfileBackgroundColor(data.profileBackgroundColor || "");  // Fetch stored background color
        setRunningGoals(data.runningGoals || "");  // Fetch running goals
      }
    } catch (err) {
      console.error("Error fetching user data: ", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to handle opening the avatar design popup
  const handleOpenDesignPopup = () => {
    setShowDesignPopup(true); // Show the design popup
  };

  // Function to handle closing the avatar design popup
  const handleCloseDesignPopup = () => {
    setShowDesignPopup(false); // Close the popup
    fetchUserData(); // Re-fetch data to update the avatar in the profile
  };

  // Fetch user data when the component mounts
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profile-page">
      {/* Title Section */}
      <div className="profile-title">
        <h1>Profile</h1>
      </div>

      {/* Main Content Section */}
      <div className="profile-content">
        {/* Profile Form */}
        <form className="profile-form">
          {/* Profile Picture Section with Avatar Preview */}
          <div className="profile-picture-section">
            <div className="profile-details-container">
              <label>Profile Picture</label>
              <button
                type="button"
                className="design-profile-btn"
                onClick={handleOpenDesignPopup}
              >
                Design Profile Pic
              </button>
            </div>

            <div
              className="profile-image-preview"
              style={{
                background: profileBackgroundColor || "linear-gradient(135deg, #f0f0f0, #f0f0f0)", // Default background if no color is set
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100px',
                height: '100px',
                borderRadius: '50%', // Make it a circle
                fontSize: '48px', // Emoji size
                overflow: 'hidden' // Ensure content fits inside the circle
              }}
            >
              <span className="avatar-emoji">{profileImageUrl || "👤"}</span> {/* Fallback emoji */}
            </div>
          </div>

          {/* Username - visually disabled */}
          <div>
            <label>Username</label>
            <input
              type="text"
              value={userData.username || ""}
              disabled
              className="disabled-input"
            />
          </div>

          {/* Email - visually disabled */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={userData.email || ""}
              disabled
              className="disabled-input"
            />
          </div>

          {/* Preferred Running Brand */}
          <div>
            <label>Preferred Running Brand</label>
            <select
              value={preferredGear}
              onChange={(e) => setPreferredGear(e.target.value)}
            >
              <option value="" disabled>Select your preferred brand</option>
              <option value="Nike">Nike</option>
              <option value="Adidas">Adidas</option>
              <option value="Asics">Asics</option>
              <option value="Brooks">Brooks</option>
              <option value="Hoka">Hoka</option>
              <option value="New Balance">New Balance</option>
              <option value="Saucony">Saucony</option>
              <option value="Puma">Puma</option>
              <option value="Under Armour">Under Armour</option>
              <option value="Mizuno">Mizuno</option>
            </select>
          </div>

          {/* Preferred Running Distance */}
          <div>
            <label>Preferred Running Distance</label>
            <select
              value={preferredDistance}
              onChange={(e) => setPreferredDistance(e.target.value)}
            >
              <option value="" disabled>Select your preferred distance</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="21">21 km (Half Marathon)</option>
              <option value="30">30 km</option>
              <option value="42">42 km (Marathon)</option>
            </select>
          </div>

          {/* Running Goals */}
          <div>
            <label>Running Goals</label>
            <textarea
              value={runningGoals}
              onChange={(e) => setRunningGoals(e.target.value)}
              placeholder="Enter your running goals"
              rows="4"
            />
          </div>

          <div className="save-btn-wrapper">{/* Save Button */}
            <button type="submit" className="save-button">Save Changes</button>
          </div>
          {/* Success/Error Message */}
          {message && <p className="message">{message}</p>}
        </form>
      </div>

      {/* Avatar Design Popup */}
      {showDesignPopup && (
        <DesignProfilePicPopup onClose={handleCloseDesignPopup} />
      )}
    </div>
  );
};

export default Profile;
