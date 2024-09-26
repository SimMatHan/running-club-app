import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";  // Firestore and Firebase Auth
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, where } from "firebase/firestore";  // Firestore methods
import { onAuthStateChanged } from "firebase/auth";  // Firebase Auth methods
import './CreateRun.css';
import EventEdit from '../components/EventEdit';  // Import the EventEdit component

const CreateRun = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrangements, setArrangements] = useState([]);
  const [user, setUser] = useState(null);  // To store the logged-in user
  const [username, setUsername] = useState("");  // To store the username (this was missing)
  const [editingId, setEditingId] = useState(null);  // Track which arrangement is being edited
  const [isEditing, setIsEditing] = useState(false); // Toggle to show or hide edit panel
  const [isClosing, setIsClosing] = useState(false); // Track whether the panel is closing

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
      if (editingId) {
        // Update existing arrangement
        const arrangementRef = doc(db, "arrangements", editingId);
        await updateDoc(arrangementRef, {
          title,
          date,
          time,
          location,
          distance,
          description,
        });
        setMessage("Run successfully updated!");
        closeEditPanel();  // Close edit panel after submission
      } else {
        // Add new arrangement
        await addDoc(collection(db, "arrangements"), {
          title,
          date,
          time,
          location,
          distance,
          description,
          createdAt: new Date().toISOString(),
          createdBy: username,  // Use the username fetched from Firestore
          userId: user.uid,  // Store the user's unique ID for reference
        });
        setMessage("Run successfully created!");
      }

      // Reset form
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDistance("");
      setDescription("");
      setEditingId(null);

      fetchArrangements();
    } catch (err) {
      console.error("Error creating run: ", err);
      setError("Failed to create run. Please try again.");
    }
  };

  const fetchArrangements = async () => {
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
  };

  // Load arrangements when user is set
  useEffect(() => {
    fetchArrangements();
  }, [user]);

  // Start editing an arrangement
  const startEditing = (arrangement) => {
    setEditingId(arrangement.id);
    setTitle(arrangement.title);
    setDate(arrangement.date);
    setTime(arrangement.time);
    setLocation(arrangement.location);
    setDistance(arrangement.distance);
    setDescription(arrangement.description || "");
    setIsEditing(true);  // Show edit panel when editing starts
    setIsClosing(false);  // Ensure it's not in closing state
  };

  const closeEditPanel = () => {
    setIsClosing(true);  // This will trigger the slide-down animation
    setTimeout(() => {
      setIsEditing(false);  // Remove the edit panel after the animation completes
      setEditingId(null);  // Clear the editing state after animation completes
    }, 500);  // The timeout should match the slide-down animation duration
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

          <button type="submit">{editingId ? "Update Run" : "Create Run"}</button>
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
                <p>
                  <strong>Date:</strong> {arrangement.date}<br />
                  <strong>Time:</strong> {arrangement.time}<br />
                  <strong>Location:</strong> {arrangement.location}<br />
                  <strong>Distance:</strong> {arrangement.distance}<br />
                </p>
              </div>
            ))
          ) : (
            <p className="no-arrangements">No upcoming arrangements found.</p>
          )}
        </div>
      </div>

      {/* Render EventEdit component when editing */}
      {isEditing && (
        <EventEdit
          event={editingId}
          title={title}
          date={date}
          time={time}
          location={location}
          distance={distance}
          description={description}
          onTitleChange={(e) => setTitle(e.target.value)}
          onDateChange={(e) => setDate(e.target.value)}
          onTimeChange={(e) => setTime(e.target.value)}
          onLocationChange={(e) => setLocation(e.target.value)}
          onDistanceChange={(e) => setDistance(e.target.value)}
          onDescriptionChange={(e) => setDescription(e.target.value)}
          handleSubmit={handleSubmit}
          onClose={closeEditPanel}
          isClosing={isClosing}
        />
      )}
    </div>
  );
};

export default CreateRun;
