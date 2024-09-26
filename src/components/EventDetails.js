import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";  // Firestore methods
import { auth } from "../firebaseConfig";  // Firebase Auth for user info
import "./EventDetails.css";

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
        className={`event-details-overlay ${isClosing ? "overlay-hide" : ""}`}
        onClick={handleClose}
      ></div>

      {/* Event Details Panel */}
      <div className={`event-details-panel ${isClosing ? "slide-down" : "slide-up"}`}>
        <button className="close-button" onClick={handleClose}>X</button>

        {/* Event Title */}
        <div className="event-title">
          <h2>{event.title}</h2>
        </div>

        {/* Event Date */}
        <div className="event-date">
          <p><strong>Date:</strong> {event.date}</p>
        </div>

        {/* Event Time */}
        <div className="event-time">
          <p><strong>Time:</strong> {event.time}</p>
        </div>

        {/* Event Location */}
        <div className="event-location">
          <p><strong>Location:</strong> {event.location}</p>
        </div>

        {/* Event Distance */}
        <div className="event-distance">
          <p><strong>Distance:</strong> {event.distance}</p>
        </div>

        {/* Event Description */}
        <div className="event-description">
          <p><strong>Description:</strong> {event.description}</p>
        </div>

        {/* Event Organizer */}
        <div className="event-organizer">
          <p><strong>Organizer:</strong> {event.createdBy}</p>
        </div>

        {/* Show the list of attendees */}
        <div className="attendees-section">
          <h3>Attendees ({attendees.length}):</h3>
          {attendees.length > 0 ? (
            <ul>
              {attendees.map((attendee, index) => (
                <li key={index}>{attendee}</li>
              ))}
            </ul>
          ) : (
            <p>No attendees yet.</p>
          )}
        </div>

        {/* Registration and Unregistration buttons placed at the bottom */}
        <div className="event-buttons">
          <button
            className="register-button"
            onClick={handleRegister}
            disabled={isRegistered}  // Disable if already registered
          >
            Register
          </button>
          <button className="unregister-button" onClick={handleUnregister}>
            Unregister
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
