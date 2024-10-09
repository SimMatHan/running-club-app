import React, { useState, useEffect, useCallback } from "react";
import { db, auth } from "../firebaseConfig"; // Firestore and Firebase Auth
import { collection, addDoc, getDocs, doc, getDoc, query, where, deleteDoc, updateDoc } from "firebase/firestore"; // Firestore methods
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth methods
import './CreateRun.css';
import ConfirmDelete from '../components/ConfirmDelete'; // Import ConfirmDelete component
import EventEdit from '../components/EventEdit'; // Import EventEdit component
import deleteFilled from '../assets/DeleteFilled.svg'

const CreateRun = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("");
  const [typeOfRun, setTypeOfRun] = useState(""); 
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [arrangements, setArrangements] = useState([]);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false); 
  const [deleteEventId, setDeleteEventId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

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
      if (isEditing && editingEvent) {
        await updateDoc(doc(db, "arrangements", editingEvent.id), {
          title,
          date,
          time,
          location,
          distance,
          typeOfRun,
          description,
        });
        setMessage("Run successfully updated!");
      } else {
        await addDoc(collection(db, "arrangements"), {
          title,
          date,
          time,
          location,
          distance,
          typeOfRun, 
          description,
          createdAt: new Date().toISOString(),
          createdBy: username, 
          userId: user.uid, 
        });
        setMessage("Run successfully created!");
      }

      handleReset();
      setIsEditing(false);
      fetchArrangements();
    } catch (err) {
      console.error("Error creating or updating run: ", err);
      setError("Failed to create or update run. Please try again.");
    }
  };

  const fetchArrangements = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(collection(db, "arrangements"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const currentDate = new Date();

      const fetchedArrangements = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(arrangement => new Date(arrangement.date) >= currentDate) 
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setArrangements(fetchedArrangements);
    } catch (err) {
      console.error("Error fetching arrangements: ", err);
      setError("Failed to fetch arrangements.");
    }
  }, [user]);

  useEffect(() => {
    fetchArrangements();
  }, [fetchArrangements]);

  const handleReset = () => {
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setDistance("");
    setTypeOfRun("");
    setDescription("");
    setError("");
    setMessage("");
  };

  const startEditing = (arrangement) => {
    setIsEditing(true);
    setEditingEvent(arrangement);
    setTitle(arrangement.title);
    setDate(arrangement.date);
    setTime(arrangement.time);
    setLocation(arrangement.location);
    setDistance(arrangement.distance);
    setTypeOfRun(arrangement.typeOfRun);
    setDescription(arrangement.description);
  };

  const closeEditPanel = () => {
    setIsEditing(false);
    setEditingEvent(null);
    handleReset();
  };

  const handleDeleteClick = (arrangementId) => {
    setDeleteEventId(arrangementId); 
    setShowConfirmDelete(true); 
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "arrangements", deleteEventId));
      setMessage("Run successfully deleted!");
      fetchArrangements(); 
      setShowConfirmDelete(false); 
    } catch (err) {
      console.error("Error deleting arrangement: ", err);
      setError("Failed to delete arrangement.");
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false); 
    setDeleteEventId(null); 
  };

  return (
    <div className="createrun-page">
      <div className="createrun-title">
        <h1>{isEditing ? "Edit Run" : "Create a Run"}</h1>
      </div>

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
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              placeholder="HH:MM"
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
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
              placeholder="Enter the distance of the run"
              min="0"
              step="any"
            />
          </div>

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

          <div className="button-container">
            <button type="submit" className="button-primary">
              {isEditing ? "Update Run" : "Create Run"}
            </button>
            <button type="button" className="button-reset" onClick={handleReset}>Reset</button>
          </div>
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
                onClick={() => startEditing(arrangement)}
              >
                <h3>{arrangement.title}</h3>
                <p> Date: {arrangement.date} </p>
                <p> Time: {arrangement.time} </p>
                <p> Location: {arrangement.location} </p>
                <p> Distance: {arrangement.distance} </p>
                <p> Type of Run: {arrangement.typeOfRun} </p> 
                <img
                  src={deleteFilled}
                  alt="Delete"
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(arrangement.id);
                  }}
                />
              </div>
            ))
          ) : (
            <p className="no-arrangements">No upcoming arrangements found.</p>
          )}
        </div>
      </div>

      {showConfirmDelete && (
        <ConfirmDelete
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {isEditing && editingEvent && (
        <EventEdit
          event={editingEvent}
          onClose={closeEditPanel}
          refreshEvents={fetchArrangements}
        />
      )}
    </div>
  );
};

export default CreateRun;
