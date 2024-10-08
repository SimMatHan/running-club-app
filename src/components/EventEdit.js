import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore"; // Firestore methods
import { db } from "../firebaseConfig"; // Import db from firebaseConfig
import './EventEdit.css'; // Ensure appropriate CSS for the edit modal

import close from '../assets/close.svg';

const EventEdit = ({ event, onClose, refreshEvents }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [typeOfRun, setTypeOfRun] = useState(""); // New state for type of run
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isClosing, setIsClosing] = useState(false); // To track closing animation

  // Update state when event prop changes (populate the form fields)
  useEffect(() => {
    if (event) {
      // Pre-fill form fields with event data
      setTitle(event.title || "");
      setDate(event.date || "");
      setTime(event.time || "");
      setLocation(event.location || "");
      setDistance(event.distance || "");
      setTypeOfRun(event.typeOfRun || ""); // Populate type of run
      setDescription(event.description || "");
    }
  }, [event]); // Re-run this effect whenever the event prop changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Update the arrangement in Firestore
      const arrangementRef = doc(db, "arrangements", event.id);
      await updateDoc(arrangementRef, {
        title,
        date,
        time,
        location,
        distance,
        typeOfRun, // Include type of run in the update
        description,
      });

      setMessage("Run successfully updated!");
      handleClose(); // Close the edit panel after successful update
      refreshEvents(); // Refresh the list of events
    } catch (err) {
      console.error("Error updating run: ", err);
      setError("Failed to update run. Please try again.");
    }
  };

  const handleClose = () => {
    setIsClosing(true);  // Trigger the slide-down animation
    setTimeout(() => {
      onClose();  // Close the modal after the animation completes
      setIsClosing(false);  // Reset the closing state
    }, 500);  // Duration should match the animation-duration in CSS
  };

  return (
    <div>
      {/* Overlay */}
      <div className={`edit-overlay ${isClosing ? "overlay-hide" : ""}`} onClick={handleClose}></div>

      {/* Edit Panel with slide-up and slide-down animation */}
      <div className={`edit-panel ${isClosing ? "slide-down" : "slide-up"}`}>
        <div className="EventEdit-header">
          <h2>Update Your Run</h2>
          <button className="EventDetails-close-button" onClick={handleClose}>
            <img src={close} alt="Close" className="EventDetails-icon" />
          </button>
        </div> 
        <form onSubmit={handleSubmit} className="arrangement-form">

          <div>
            <label>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter the title of the event"
            />
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Enter the location of the event"
            />
          </div>

          <div>
            <label>Distance of Run</label>
            <input
              type="text"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              placeholder="Enter the distance of the run"
            />
          </div>

          {/* New Dropdown for Type of Run */}
          <div>
            <label>Type of Run</label>
            <select
              value={typeOfRun}
              onChange={(e) => setTypeOfRun(e.target.value)}
              required
            >
              <option value="">Select Type of Run</option>
              <option value="Interval">Interval</option>
              <option value="Easy Run">Easy Run</option>
              <option value="Race Run">Race Run</option>
              <option value="Long Run">Long Run</option>
              <option value="Hygge">Hygge</option>
            </select>
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional information or notes"
            />
          </div>

          <button type="submit" className="button-primary">Update Run</button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default EventEdit;
