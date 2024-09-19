import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, addDoc, getDocs } from "firebase/firestore";  // Firestore methods
import './Calendar.css';

const Calendar = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrangements, setArrangements] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await addDoc(collection(db, "arrangements"), {
        title,
        date,
        time,
        location,
        distance,
        description,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDistance("");
      setDescription("");
      setMessage("Arrangement successfully created!");

      fetchArrangements();
    } catch (err) {
      console.error("Error creating arrangement: ", err);
      setError("Failed to create arrangement. Please try again.");
    }
  };

  const fetchArrangements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));
      const fetchedArrangements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArrangements(fetchedArrangements);
    } catch (err) {
      console.error("Error fetching arrangements: ", err);
      setError("Failed to fetch arrangements.");
    }
  };

  useEffect(() => {
    fetchArrangements();
  }, []);

  return (
    <div className="calendar-page">
      {/* Title Section */}
      <div className="calendar-title">
        <h1>Create a Run</h1>
      </div>

      {/* Main Content Section */}
      <div className="calendar-content">
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

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
            <label>Distance (e.g., 5K, 10K)</label>
            <input
              type="text"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              placeholder="Enter the distance of the run"
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional information or notes"
            />
          </div>

          <button type="submit">Create Arrangement</button>
        </form>

        <h2>Upcoming Arrangements</h2>
        <div className="arrangements-list">
          {arrangements.length > 0 ? (
            arrangements.map((arrangement) => (
              <div key={arrangement.id} className="arrangement-item">
                <h3>{arrangement.title}</h3>
                <p>
                  <strong>Date:</strong> {arrangement.date}<br />
                  <strong>Time:</strong> {arrangement.time}<br />
                  <strong>Location:</strong> {arrangement.location}<br />
                  <strong>Distance:</strong> {arrangement.distance}<br />
                  {arrangement.description && <p><strong>Description:</strong> {arrangement.description}</p>}
                </p>
              </div>
            ))
          ) : (
            <p className="no-arrangements">No upcoming arrangements found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
