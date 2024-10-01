import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { doc, getDoc } from "firebase/firestore";  // Firestore methods
import './MemberDetail.css';
import defaultProfilePic from '../assets/ProfileGrey.svg';  // Default profile picture
import close from '../assets/close.svg';

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

        {/* Profile Picture and Close Button */}
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
              borderRadius: '50%',
              overflow: 'hidden' 
            }}
          >
            {member.profileImageUrl ? (
              <span className="avatar-emoji">{member.profileImageUrl}</span>
            ) : (
              <img src={defaultProfilePic} alt="Profile" />
            )}
          </div>
          <button className="close-button" onClick={handleClose}>
            <img src={close} alt="Close" className="EventDetails-icon" />
          </button>
        </div>

        {/* Username */}
        <div className="member-username">
          <h2>{member.username}</h2>
        </div>

        {/* First Row: Running Brand and Total Runs */}
        <div className="member-row">
          <div className="member-data">
            <p>Favorite Running Brand</p>
            <h3>{member.preferredGear || "Not specified"}</h3>
          </div>
          <div className="member-data">
            <p>Total Runs for CSI</p>
            <h3>{member.totalRuns || "0"}</h3>
          </div>
        </div>

        {/* Second Row: Preferred Distance and Total KM */}
        <div className="member-row">
          <div className="member-data">
            <p>Favorite Distance</p>
            <h3>{member.preferredDistance ? `${member.preferredDistance} km` : "Not specified"}</h3>
          </div>
          <div className="member-data">
            <p>Total KMs for CSI</p>
            <h3>{member.totalKM ? `${member.totalKM} km` : "0 km"}</h3>
          </div>
        </div>

        {/* Running Goals */}
        {member.runningGoals && (
          <div className="member-goals">
            <p><strong>Goal for the season</strong></p>
            <h3>{member.runningGoals}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
