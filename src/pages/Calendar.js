import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, addDoc, getDocs } from "firebase/firestore";  // Firestore methods
import './Calendar.css';

const Calendar = () => {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");  // Success message
  const [error, setError] = useState("");      // Error message
  const [arrangements, setArrangements] = useState([]); // State to store fetched arrangements

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");  // Clear any previous errors
    setMessage("");  // Clear any previous success message

    try {
      // Add the arrangement to Firestore
      await addDoc(collection(db, "arrangements"), {
        title,
        date,
        time,
        location,
        distance,
        description,
        createdAt: new Date().toISOString(),  // Add a timestamp for when the event was created
      });

      // Clear the form fields
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDistance("");
      setDescription("");
      setMessage("Arrangement successfully created!");

      // Fetch updated arrangements after adding a new one
      fetchArrangements();

    } catch (err) {
      console.error("Error creating arrangement: ", err);
      setError("Failed to create arrangement. Please try again.");
    }
  };

  // Function to fetch arrangements from Firestore
  const fetchArrangements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));
      const fetchedArrangements = querySnapshot.docs.map(doc => ({
        id: doc.id, // The document ID
        ...doc.data(), // All the document data
      }));
      setArrangements(fetchedArrangements);
    } catch (err) {
      console.error("Error fetching arrangements: ", err);
      setError("Failed to fetch arrangements.");
    }
  };

  // Use effect to fetch arrangements on component mount
  useEffect(() => {
    fetchArrangements();
  }, []);

  return (
    <div className="calendar-container">
      <h1>Create a Running Arrangement</h1>
      
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
          <p>No upcoming arrangements found.</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
