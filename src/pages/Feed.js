import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // Ensure you import useNavigate
import { db } from "../firebaseConfig";  // Firestore
import { collection, getDocs } from "firebase/firestore";  // Firestore methods
import './Feed.css';

const messages = [
  { id: 1, user: "John", text: "Who's joining the marathon this weekend?" },
  { id: 2, user: "Sara", text: "Great trail run yesterday!" },
];

const Feed = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]); // State to store fetched events
  const [error, setError] = useState("");  // Error handling state
  const navigate = useNavigate();  // Create a navigate function to use for routing

  // Function to fetch upcoming events from Firestore and sort by date
  const fetchUpcomingEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));  // Fetch data from the 'arrangements' collection
      const currentDate = new Date(); // Get current date

      const fetchedEvents = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(event => new Date(event.date) >= currentDate) // Filter out past events
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort the events based on the closest upcoming date

      setUpcomingEvents(fetchedEvents);  // Set the filtered and sorted events in the state
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again later.");
    }
  };

  // Use effect to fetch events on component mount
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  // Function to handle button click to navigate to the Calendar page
  const goToCalendar = () => {
    navigate("/calendar");  // Navigate to the calendar page
  };

  return (
    <div className="feed-page">
      {/* Title Section */}
      <div className="feed-title">
        <h1>Feed</h1>
      </div>

      {/* Main Content Section */}
      <div className="feed-content">
        {/* Section for Upcoming Events */}
        <section className="event-list">
          <h2>Upcoming Runs</h2>
          {error && <p className="error-message">{error}</p>}
          {upcomingEvents.length > 0 ? (
            <div className="scroll-container">
              <ul>
                {upcomingEvents.map(event => (
                  <li key={event.id} className="event-item">
                    <h3>{event.title}</h3>
                    <p>Date: {event.date}</p>
                    <p>Distance: {event.distance}</p>
                    <p>Location: {event.location}</p>
                    <p>Organizer: {event.createdBy}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="no-events">No upcoming events found.</p>
          )}
        </section>

        {/* See All Events Button */}
        <button className="see-all-events-btn" onClick={goToCalendar}>
          See All Events
        </button>

        {/* Divider */}
        <hr />

        {/* Section for Messages */}
        <section className="message-list">
          <h2>Messages</h2>
          <div>
            {messages.map(message => (
              <div key={message.id} className="message-item">
                <strong>{message.user}:</strong>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Feed;
