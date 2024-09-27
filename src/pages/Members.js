import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, getDocs } from "firebase/firestore";  // Firestore methods
import './Members.css';
import defaultProfilePic from '../assets/ProfileGrey.svg';  // Default profile picture
import MemberDetail from '../components/MemberDetail';  // Import the MemberDetail component

const Members = () => {
  const [members, setMembers] = useState([]);  // State to store the list of users
  const [selectedMemberId, setSelectedMemberId] = useState(null);  // State to track selected member for details
  const [error, setError] = useState("");  // Error handling state

  // Function to fetch members from Firestore
  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));  // Fetch users from the 'users' collection
      const fetchedMembers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort the members alphabetically by username
      const sortedMembers = fetchedMembers.sort((a, b) => {
        if (a.username && b.username) {
          return a.username.localeCompare(b.username);
        }
        return 0;
      });

      setMembers(sortedMembers);  // Set the sorted members in the state
    } catch (err) {
      console.error("Error fetching members: ", err);
      setError("Failed to load members. Please try again later.");
    }
  };

  // Use effect to fetch members when component mounts
  useEffect(() => {
    fetchMembers();
  }, []);

  

  return (
    <div className="members-page">
      {/* Title Section */}
      <div className="members-title">
        <h1>Members List</h1>
      </div>

      {/* Main Content Section */}
      <div className="members-content">
        {error && <p className="error-message">{error}</p>}
        {members.length > 0 ? (
          <ul className="members-list">
            {members.map(member => (
              <li 
                key={member.id} 
                className="member-item" 
                onClick={() => setSelectedMemberId(member.id)}  // Open member detail on click
              >
                <div className="member-info">
                  <h3 className="member-username">{member.username}</h3>
                  <p className="member-brand">{member.preferredGear || "..."}</p>
                  <p className="member-distance">{member.preferredDistance ? `${member.preferredDistance}k` : "..."}</p>
                </div>

                {/* Profile Picture Placeholder */}
                <div className="member-picture">
                  <img
                    src={member.profileImageUrl || defaultProfilePic}
                    alt="Profile"
                    className="profile-image"
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-members">No members found.</p>
        )}

        {/* Render the MemberDetail component when a member is selected */}
        {selectedMemberId && (
          <MemberDetail 
            memberId={selectedMemberId} 
            onClose={() => setSelectedMemberId(null)}  // Close the detail view
          />
        )}
      </div>
    </div>
  );
};

export default Members;
