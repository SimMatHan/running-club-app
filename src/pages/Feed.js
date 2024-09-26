import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import './Feed.css';
import EventDetails from "../components/EventDetails";  // Import the new component

const messages = [
  { id: 1, user: "John", text: "Who's joining the marathon this weekend?" },
  { id: 2, user: "Sara", text: "Great trail run yesterday!" },
];

const Feed = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // State to store the selected event for viewing
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUpcomingEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));
      const currentDate = new Date();

      const fetchedEvents = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(event => new Date(event.date) >= currentDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again later.");
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const goToCalendar = () => {
    navigate("/calendar");
  };

  // Function to handle closing the event details
  const closeEventDetails = () => {
    setSelectedEvent(null);  // Set selectedEvent to null to close the panel
  };

  return (
    <div className="feed-page">
      <div className="feed-title">
        <h1>Feed</h1>
      </div>

      <div className="feed-content">
        <section className="event-list">
          <h2>Upcoming Runs</h2>
          {error && <p className="error-message">{error}</p>}
          {upcomingEvents.length > 0 ? (
            <div className="scroll-container">
              <ul>
                {upcomingEvents.map(event => (
                  <li
                    key={event.id}
                    className="event-item"
                    onClick={() => setSelectedEvent(event)}  // Set the selected event on click
                  >
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

        <button className="see-all-events-btn" onClick={goToCalendar}>
          See All Events
        </button>

        <hr />

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

      {/* Render the EventDetails component when an event is selected */}
      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={closeEventDetails} />
      )}
    </div>
  );
};

export default Feed;
