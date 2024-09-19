import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, getDocs } from "firebase/firestore";  // Firestore methods
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);  // State to store the list of users
  const [error, setError] = useState("");      // Error handling state

  // Function to fetch members from Firestore
  const fetchMembers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));  // Fetch users from the 'users' collection
      const fetchedMembers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(fetchedMembers);  // Set the fetched members in the state
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
    <div className="members-container">
      <h1>Members List</h1>
      {error && <p className="error-message">{error}</p>}
      {members.length > 0 ? (
        <ul className="members-list">
          {members.map(member => (
            <li key={member.id} className="member-item">
              <h3>{member.username}</h3>
              <p>Email: {member.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-members">No members found.</p>
      )}
    </div>
  );
};

export default Members;
