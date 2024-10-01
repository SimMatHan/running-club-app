import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import GuidePopup from "../components/GuidePopup";
import './Feed.css';
import EventDetails from "../components/EventDetails";
import { getRunTypeColor } from '../utils/utils';

const Feed = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [showGuidePopup, setShowGuidePopup] = useState(false);  // For controlling popup visibility
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});  // Store user data from Firebase

  const navigate = useNavigate();
  const user = auth.currentUser;  // Get the currently logged-in user

  // Function to fetch user data, including the showGuide field
  const fetchUserData = useCallback(async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));  // Fetch user document using logged-in user's UID
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("Fetched user data:", data);  // Debug: Check fetched data
          setUserData(data);  // Store fetched user data

          // Only show popup if showGuide is true or undefined (if it's not set to false)
          if (data.showGuide === true || data.showGuide === undefined) {
            setTimeout(() => {
              setShowGuidePopup(true);  // Delay the popup appearance by 2 seconds
            }, 2000);  // 2000 ms = 2 seconds
            console.log("Guide popup will appear after 2 seconds.");
          } else {
            console.log("Guide popup is disabled for this user.");
          }
        } else {
          console.log("No such document!");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);  // Stop loading when data is fetched
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();  // Fetch user data on component mount
    fetchUpcomingEvents();  // Fetch events

    return () => {
      // Clear the timeout when the component unmounts to prevent memory leaks
      clearTimeout();
    };
  }, [fetchUserData]);

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

  const closeGuidePopup = () => {
    setShowGuidePopup(false);
  };

  const disableGuidePopup = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          showGuide: false,
        });
        console.log("Guide popup preference updated!");
        setShowGuidePopup(false);
      } catch (error) {
        console.error("Error updating preference:", error);
      }
    }
  };

  const goToCalendar = () => {
    navigate("/calendar");
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }


  return (
    <div className="feed-page">
      {/* Render GuidePopup if showGuidePopup is true */}
      {showGuidePopup && (
        <GuidePopup onClose={closeGuidePopup} onDoNotShowAgain={disableGuidePopup} />
      )}

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
                    onClick={() => setSelectedEvent(event)}
                    style={{ background: getRunTypeColor(event.typeOfRun) }} // Dynamic background color
                  >
                    <div className="event-header">
                      <h3 className="event-title">{event.title}</h3>
                      <div className="event-datetime">
                        <p>{event.time}</p>
                        <p>{event.date}</p>
                      </div>
                    </div>
                    <div className="event-details">
                      <div className="event-type-distance">
                        <p className="event-type">{event.typeOfRun}</p>
                        <p className="event-distance">
                          {event.distance}
                        </p>
                      </div>
                      <div className="event-attendees">
                        <p>Attendees</p>
                        <p className="attendees-count">{event.attendees?.length || 0}</p>
                      </div>
                    </div>
                    {/* New organizer div */}
                    <div className="event-organizer">
                      <small>Organised by {event.createdBy}</small>
                    </div>
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
        <section className="message-list">
          <h2>Messages</h2>
          <div>
            <div className="message-item">
              <strong>John:</strong>
              <p>Who's joining the marathon this weekend?</p>
            </div>
            <div className="message-item">
              <strong>Sara:</strong>
              <p>Great trail run yesterday!</p>
            </div>
          </div>
        </section>
      </div>

      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={closeEventDetails} />
      )}
    </div>
  );
};

export default Feed;
