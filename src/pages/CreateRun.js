import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebaseConfig"; // Firestore and Firebase Auth
import { collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore"; // Firestore methods
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth methods
import './CreateRun.css';
import EventEdit from '../components/EventEdit'; // Import the EventEdit component

const CreateRun = () => {
  // State for creating a new run
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [typeOfRun, setTypeOfRun] = useState(""); // New state for type of run
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrangements, setArrangements] = useState([]);
  const [user, setUser] = useState(null); // To store the logged-in user
  const [username, setUsername] = useState(""); // To store the username

  // State for editing an event
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Store the event object being edited

  // Fetch the current logged-in user and retrieve their username
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch the user's username from Firestore using the user's UID
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUsername(userDocSnap.data().username);
        } else {
          console.error("No such user document!");
          setUsername("Anonymous");
        }
      } else {
        setUser(null);
        setUsername("Anonymous");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!user) {
      setError("You must be logged in to create an arrangement.");
      return;
    }

    try {
      // Add new arrangement logic only
      await addDoc(collection(db, "arrangements"), {
        title,
        date,
        time,
        location,
        distance,
        typeOfRun, // Added type of run to Firestore
        description,
        createdAt: new Date().toISOString(),
        createdBy: username, // Use the username fetched from Firestore
        userId: user.uid, // Store the user's unique ID for reference
      });
      setMessage("Run successfully created!");

      // Reset form
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDistance("");
      setTypeOfRun(""); // Reset type of run
      setDescription("");

      fetchArrangements();
    } catch (err) {
      console.error("Error creating run: ", err);
      setError("Failed to create run. Please try again.");
    }
  };

  // Memoize fetchArrangements function to avoid re-renders
  const fetchArrangements = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch arrangements only for the logged-in user
      const q = query(collection(db, "arrangements"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

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

      setArrangements(fetchedArrangements);
    } catch (err) {
      console.error("Error fetching arrangements: ", err);
      setError("Failed to fetch arrangements.");
    }
  }, [user]);

  // Use effect to fetch events when the user is set
  useEffect(() => {
    fetchArrangements();
  }, [fetchArrangements]);

  // Start editing an arrangement
  const startEditing = (arrangement) => {
    setEditingEvent(arrangement); // Set the event object for editing
    setIsEditing(true); // Show the edit panel
  };

  const closeEditPanel = () => {
    setIsEditing(false); // Hide the edit panel
    setEditingEvent(null); // Clear the editing event
  };

  return (
    <div className="createrun-page">
      {/* Title Section */}
      <div className="createrun-title">
        <h1>Create a Run</h1>
      </div>

      {/* Main Content Section */}
      <div className="createrun-content">

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

          {/* Distance Dropdown */}
          <div>
            <label>Distance of Run</label>
            <input
              value="text"
              onChange={(e) => setDistance(e.target.value)}
              required
              placeholder="Enter the distance of the run"
            />
          </div>

          {/* Type of Run Dropdown */}
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

          <button type="submit" className="button-primary">Create Run</button>
        </form>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <h2>Your Created Runs</h2>
        <div className="arrangements-list">
          {arrangements.length > 0 ? (
            arrangements.map((arrangement) => (
              <div
                key={arrangement.id}
                className="arrangement-item"
                onClick={() => startEditing(arrangement)} // Make the item clickable
              >
                <h3>{arrangement.title}</h3>
                <p> Date: {arrangement.date} </p>
                <p> Time: {arrangement.time} </p>
                <p> Location: {arrangement.location} </p>
                <p> Distance: {arrangement.distance} </p>
                <p> Type of Run: {arrangement.typeOfRun} </p> {/* Display the type of run */}
              </div>
            ))
          ) : (
            <p className="no-arrangements">No upcoming arrangements found.</p>
          )}
        </div>
      </div>

      {/* Render EventEdit component when editing */}
      {isEditing && editingEvent && (
        <EventEdit
          event={editingEvent}
          onClose={closeEditPanel}
          refreshEvents={fetchArrangements} // To fetch updated events list after editing
        />
      )}
    </div>
  );
};

export default CreateRun;
