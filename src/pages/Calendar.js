import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, getDocs } from "firebase/firestore";  // Firestore methods
import './Calendar.css';  // Reuse the CreateRun CSS for the same styling
import EventDetails from '../components/EventDetails';  // Import the EventDetails component

const Calendar = () => {
  const [arrangements, setArrangements] = useState([]);  // Store all upcoming events
  const [selectedEvent, setSelectedEvent] = useState(null);  // Track selected event for details view
  const [error, setError] = useState("");  // Error handling state

  // Function to fetch all upcoming events from Firestore and sort by date
  const fetchArrangements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));  // Fetch data from the 'arrangements' collection

      // Get the current date
      const currentDate = new Date();

      // Filter out past events and sort by the closest upcoming date
      const fetchedArrangements = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(arrangement => new Date(arrangement.date) >= currentDate) // Exclude past events
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by closest date

      setArrangements(fetchedArrangements);  // Set the filtered and sorted events in the state
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again later.");
    }
  };

  // Use effect to fetch events on component mount
  useEffect(() => {
    fetchArrangements();
  }, []);

  // Function to handle opening event details
  const openEventDetails = (arrangement) => {
    setSelectedEvent(arrangement);
  };

  // Function to handle closing event details
  const closeEventDetails = () => {
    setSelectedEvent(null);  // Close the event details
  };

  return (
    <div className="calendar-page">
      {/* Title Section */}
      <div className="calendar-title">
        <h1>Upcoming Runs</h1>
      </div>

      {/* Main Content Section */}
      <div className="calendar-content">
        {error && <p className="error-message">{error}</p>}
        <div className="run-list">
          {arrangements.length > 0 ? (
            arrangements.map((arrangement) => (
              <div
                key={arrangement.id}
                className="run-item"
                onClick={() => openEventDetails(arrangement)}  // Open event details on click
              >
                <h3>{arrangement.title}</h3>
                <p>
                  <strong>Date:</strong> {arrangement.date}<br />
                  <strong>Time:</strong> {arrangement.time}<br />
                  <strong>Location:</strong> {arrangement.location}<br />
                  <strong>Distance:</strong> {arrangement.distance}<br />
                  <strong>Organizer:</strong> {arrangement.createdBy}
                </p>
              </div>
            ))
          ) : (
            <p className="no-arrangements">No upcoming events found.</p>
          )}
        </div>
      </div>

      {/* Render EventDetails component when an event is selected */}
      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={closeEventDetails} />
      )}
    </div>
  );
};

export default Calendar;
