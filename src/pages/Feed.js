import React from "react";
import './Feed.css';

// Dummy data for now (you'll eventually fetch this from Firebase)
const upcomingEvents = [
  { id: 1, title: "5K Marathon", date: "2024-09-25", location: "Central Park" },
  { id: 2, title: "Trail Run", date: "2024-09-30", location: "Mountain Trail" }
];

const messages = [
  { id: 1, user: "John", text: "Who's joining the marathon this weekend?" },
  { id: 2, user: "Sara", text: "Great trail run yesterday!" },
];

const Feed = () => {
  return (
    <div className="feed-container">
      {/* Section for Upcoming Events */}
      <section className="event-list">
        <h2>Upcoming Events</h2>
        <ul>
          {upcomingEvents.map(event => (
            <li key={event.id} className="event-item">
              <h3>{event.title}</h3>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
            </li>
          ))}
        </ul>
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
  );
};

export default Feed;
