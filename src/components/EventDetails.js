import React, { useState } from "react";
import "./EventDetails.css";

const EventDetails = ({ event, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);  // State to track if the panel is closing

  if (!event) return null;

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
        <h2>{event.title}</h2>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Time:</strong> {event.time}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p><strong>Distance:</strong> {event.distance}</p>
        <p><strong>Description:</strong> {event.description}</p>
        <p><strong>Organizer:</strong> {event.createdBy}</p>
      </div>
    </div>
  );
};

export default EventDetails;
