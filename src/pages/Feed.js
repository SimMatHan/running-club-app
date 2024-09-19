import React, { useState, useEffect } from "react";
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

  // Function to fetch upcoming events from Firestore
  const fetchUpcomingEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));  // Fetch data from the 'arrangements' collection
      const fetchedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUpcomingEvents(fetchedEvents);  // Set the fetched events in the state
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again later.");
    }
  };

  // Use effect to fetch events on component mount
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

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
          <h2>Upcoming Events</h2>
          {error && <p className="error-message">{error}</p>}
          {upcomingEvents.length > 0 ? (
            <ul>
              {upcomingEvents.map(event => (
                <li key={event.id} className="event-item">
                  <h3>{event.title}</h3>
                  <p>Date: {event.date}</p>
                  <p>Distance: {event.distance}</p>
                  <p>Location: {event.location}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-events">No upcoming events found.</p>
          )}
        </section>

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
