import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { doc, getDoc } from "firebase/firestore";  // Firestore methods
import './MemberDetail.css';
import defaultProfilePic from '../assets/ProfileGrey.svg';  // Default profile picture

const MemberDetail = ({ memberId, onClose }) => {
  const [member, setMember] = useState(null);  // State to store the member data
  const [isClosing, setIsClosing] = useState(false);  // State to track if the panel is closing

  useEffect(() => {
    // Fetch the member's profile data when the component mounts
    const fetchMemberData = async () => {
      if (memberId) {
        const memberDocRef = doc(db, "users", memberId);
        const memberDocSnap = await getDoc(memberDocRef);
        if (memberDocSnap.exists()) {
          setMember(memberDocSnap.data());
        }
      }
    };

    fetchMemberData();
  }, [memberId]);

  // Function to handle the close action with slide-down animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(); // Trigger the actual close after the animation completes
      setIsClosing(false);  // Reset the closing state
    }, 500);  // Duration should match the animation-duration in CSS
  };

  if (!member) {
    return <p>Loading member details...</p>;
  }

  return (
    <div>
      {/* Overlay */}
      <div
        className={`member-details-overlay ${isClosing ? "overlay-hide" : ""}`}
        onClick={handleClose}
      ></div>

      {/* Member Details Panel */}
      <div className={`member-details-panel ${isClosing ? "slide-down" : "slide-up"}`}>
        <button className="close-button" onClick={handleClose}>X</button>

        {/* Profile Picture */}
        <div className="memberdetail-picture">
          <div
            className="memberdetail-profile-image"
            style={{
              background: member.profileBackgroundColor || '#f0f0f0', // Fallback background color
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
            {member.profileImageUrl ? (
              <span className="avatar-emoji">{member.profileImageUrl}</span>
            ) : (
              <img src={defaultProfilePic} alt="Profile" />
            )}
          </div>
        </div>

        {/* Username */}
        <div className="member-username">
          <h2>{member.username}</h2>
        </div>

        {/* Email */}
        <div className="member-email">
          <p><strong>Email:</strong> {member.email}</p>
        </div>

        {/* Preferred Running Brand */}
        <div className="member-brand">
          <p><strong>Preferred Running Brand:</strong> {member.preferredGear || "Not specified"}</p>
        </div>

        {/* Preferred Running Distance */}
        <div className="member-distance">
          <p><strong>Preferred Running Distance:</strong> {member.preferredDistance ? `${member.preferredDistance} km` : "Not specified"}</p>
        </div>

        {/* Running Goals */}
        {member.runningGoals && (
          <div className="member-goals">
            <p><strong>Running Goals:</strong> {member.runningGoals}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
