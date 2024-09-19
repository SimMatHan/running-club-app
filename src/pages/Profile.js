import React, { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebaseConfig";  // Firebase auth and Firestore
import { doc, getDoc, updateDoc } from "firebase/firestore";  // Firestore methods
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [preferredGear, setPreferredGear] = useState("");
  const [preferredDistance, setPreferredDistance] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");  // Success or error message

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
        setPhone(data.phone || "");
      }
    } catch (err) {
      console.error("Error fetching user data: ", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to update user data
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferredGear,
        preferredDistance,
        phone
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile: ", err);
      setMessage("Failed to update profile.");
    }
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
        {/* Success/Error Message */}
        {message && <p className="message">{message}</p>}

        {/* Profile Form */}
        <form onSubmit={handleSave} className="profile-form">
          {/* Username - disabled */}
          <div>
            <label>Username</label>
            <input type="text" value={userData.username || ""} disabled />
          </div>

          {/* Email - disabled */}
          <div>
            <label>Email</label>
            <input type="email" value={userData.email || ""} disabled />
          </div>

          {/* Phone Number */}
          <div>
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          {/* Preferred Running Gear */}
          <div>
            <label>Preferred Running Gear</label>
            <input
              type="text"
              value={preferredGear}
              onChange={(e) => setPreferredGear(e.target.value)}
              placeholder="Enter your preferred running gear"
            />
          </div>

          {/* Preferred Distance */}
          <div>
            <label>Preferred Running Distance (e.g., 5K, 10K)</label>
            <input
              type="text"
              value={preferredDistance}
              onChange={(e) => setPreferredDistance(e.target.value)}
              placeholder="Enter your preferred distance"
            />
          </div>

          {/* Save Button */}
          <button type="submit" className="save-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
