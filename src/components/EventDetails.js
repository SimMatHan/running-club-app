import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";  // Firestore methods
import { auth } from "../firebaseConfig";  // Firebase Auth for user info
import "./EventDetails.css";

// Importing SVG icons
import close from '../assets/close.svg';
import comment from '../assets/comment.svg';

const EventDetails = ({ event, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);  // State to track if the panel is closing
  const [isRegistered, setIsRegistered] = useState(false);  // Track if the user is registered for the event
  const [attendees, setAttendees] = useState([]);  // Track attendees of the event
  const [user, setUser] = useState(null);  // Current logged-in user

  useEffect(() => {
    // Set up the current user
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch the attendees list from the event document when the component mounts
    const fetchAttendees = async () => {
      if (event.id) {
        const eventDocRef = doc(db, "arrangements", event.id);
        const eventDocSnap = await getDoc(eventDocRef);
        if (eventDocSnap.exists()) {
          setAttendees(eventDocSnap.data().attendees || []);
          setIsRegistered(eventDocSnap.data().attendees?.includes(user?.email)); // Check if the current user is already registered
        }
      }
    };

    fetchAttendees();
  }, [event.id, user]);

  // Function to handle event registration
  const handleRegister = async () => {
    if (!user) {
      alert("You need to be logged in to register for this event.");
      return;
    }

    try {
      const eventDocRef = doc(db, "arrangements", event.id);
      await updateDoc(eventDocRef, {
        attendees: arrayUnion(user.email)  // Add the user's email to the attendees array
      });
      setIsRegistered(true);
      setAttendees((prev) => [...prev, user.email]);  // Update local attendees list
    } catch (err) {
      console.error("Error registering for event:", err);
    }
  };

  // Function to handle event unregistration
  const handleUnregister = async () => {
    if (!user) {
      alert("You need to be logged in to unregister from this event.");
      return;
    }

    try {
      const eventDocRef = doc(db, "arrangements", event.id);
      await updateDoc(eventDocRef, {
        attendees: arrayRemove(user.email)  // Remove the user's email from the attendees array
      });
      setIsRegistered(false);
      setAttendees((prev) => prev.filter((email) => email !== user.email));  // Update local attendees list
    } catch (err) {
      console.error("Error unregistering from event:", err);
    }
  };

  // Function to handle the close action with slide-down animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(); // Trigger the actual close after the animation completes
      setIsClosing(false);  // Reset the closing state
    }, 500);  // Duration should match the animation-duration in CSS
  };

  return (
    <div>
      {/* Overlay */}
      <div
        className={`EventDetails-overlay ${isClosing ? "EventDetails-overlay-hide" : ""}`}
        onClick={handleClose}
      ></div>

      {/* Event Details Panel */}
      <div className={`EventDetails-panel ${isClosing ? "EventDetails-slide-down" : "EventDetails-slide-up"}`}>
        
        {/* Event Header */}
        <div className="EventDetails-header">
          <div className="EventDetails-event-title">
            <h2>{event.title}</h2>
            <p>Organized by {event.createdBy}</p>
          </div>
          <div className="EventDetails-header-icons">
            <button className="EventDetails-chat-icon">
              <img src={comment} alt="Comment" className="EventDetails-icon" />
            </button>
            <button className="EventDetails-close-button" onClick={handleClose}>
              <img src={close} alt="Close" className="EventDetails-icon" />
            </button>
          </div>
        </div>

        {/* Event Info */}
        <div className="EventDetails-event-info">
          <div className="EventDetails-event-location">
            <p>{event.location}</p>
          </div>
          <div className="EventDetails-event-date-time">
            <p>{event.time}</p>
            <p>{event.date}</p>
          </div>
        </div>

        {/* Event Type and Distance */}
        <div className="EventDetails-event-details">
          <div className="EventDetails-event-distance">
            <h2>{event.typeOfRun}</h2>
          </div>
          <div className="EventDetails-event-distance">
            <h2>{event.distance}</h2>
          </div>
        </div>

        {/* Attendees */}
        <div className="EventDetails-attendees">
          <ul>
            {attendees.length > 0 ? (
              attendees.map((attendee, index) => <li key={index}>{attendee}</li>)
            ) : (
              <p>No attendees yet.</p>
            )}
          </ul>
        </div>

        {/* Registration and Unregistration buttons placed at the bottom */}
        <div className="EventDetails-buttons">
          <button
            className="EventDetails-register-button"
            onClick={handleRegister}
            disabled={isRegistered}  // Disable if already registered
          >
            Register
          </button>
          <button className="EventDetails-unregister-button" onClick={handleUnregister}>
            Unregister
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
