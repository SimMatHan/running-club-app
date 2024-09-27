import React, { useState, useEffect, useCallback } from "react";
import { auth, db, storage } from "../firebaseConfig";  // Firebase auth, Firestore, and Storage
import { doc, getDoc, updateDoc } from "firebase/firestore";  // Firestore methods
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";  // Firebase Storage methods
import './Profile.css';
import defaultProfilePic from '../assets/ProfileGrey.svg';  // Assuming you have a default image in your assets

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [preferredGear, setPreferredGear] = useState("");
  const [preferredDistance, setPreferredDistance] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(""); // Profile image URL
  const [runningGoals, setRunningGoals] = useState(""); // Running goals
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
        setProfileImageUrl(data.profileImageUrl || "");  // Fetch stored profile image URL
        setRunningGoals(data.runningGoals || "");  // Fetch running goals
      }
    } catch (err) {
      console.error("Error fetching user data: ", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Function to handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profilePictures/${user.uid}`);  // Create a storage reference
      await uploadBytes(storageRef, file);  // Upload the file to Firebase Storage
      const downloadURL = await getDownloadURL(storageRef);  // Get the file's download URL
      setProfileImageUrl(downloadURL);  // Set the image URL in state
    }
  };

  // Function to update user data
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferredGear,
        preferredDistance,
        profileImageUrl,  // Save the profile image URL to Firestore
        runningGoals    // Save the running goals
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile: ", err);
      setMessage("Failed to update profile.");
    }
  };

  // Set timeout to clear the message after 7 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 7000);  // 7 seconds delay
      return () => clearTimeout(timer); // Clean up the timer on unmount
    }
  }, [message]);

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
        <form onSubmit={handleSave} className="profile-form">
          {/* Profile Picture Section with Upload Button and Image Preview */}
          <div className="profile-picture-section">
            <div className="upload-container">
              <label>Profile Picture</label>
              <div className="upload-btn-wrapper">
                <button className="upload-btn">Upload Image</button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}  // Image upload handler
                />
              </div>
            </div>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="profile-image-preview"
              />
            ) : (
              <img
                src={defaultProfilePic}
                alt="Default Profile"
                className="profile-image-preview"
              />
            )}
          </div>

          {/* Username - visually disabled */}
          <div>
            <label>Username</label>
            <input type="text" value={userData.username || ""} disabled className="disabled-input" />
          </div>

          {/* Email - visually disabled */}
          <div>
            <label>Email</label>
            <input type="email" value={userData.email || ""} disabled className="disabled-input" />
          </div>

          {/* Preferred Running Brand */}
          <div>
            <label>Preferred Running Brand</label>
            <select
              value={preferredGear}
              onChange={(e) => setPreferredGear(e.target.value)}
            >
              <option value="" disabled>Select your preferred brand</option>
              {/* Options here */}
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
              {/* Options here */}
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
    </div>
  );
};

export default Profile;
