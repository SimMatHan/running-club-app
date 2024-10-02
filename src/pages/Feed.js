import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import GuidePopup from "../components/GuidePopup";
import './Feed.css';
import EventDetails from "../components/EventDetails";
import { getRunTypeColor } from '../utils/utils';

import defaultProfilePic from '../assets/ProfileGrey.svg';  // Path to your default profile picture
import { formatDistanceToNow } from 'date-fns';  // Date-fns for formatting timestamps

const Feed = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [showGuidePopup, setShowGuidePopup] = useState(false);  // For controlling popup visibility
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});  // Store user data from Firebase
  const [comments, setComments] = useState([]);  // To store comments for the next event
  const [usersData, setUsersData] = useState({});  // To store user profile data from Firestore

  const navigate = useNavigate();
  const user = auth.currentUser;  // Get the currently logged-in user

  // Function to fetch user data, including the showGuide field
  const fetchUserData = useCallback(async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));  // Fetch user document using logged-in user's UID
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);  // Store fetched user data

          // Only show popup if showGuide is true or undefined (if it's not set to false)
          if (data.showGuide === true || data.showGuide === undefined) {
            setTimeout(() => {
              setShowGuidePopup(true);  // Delay the popup appearance by 2 seconds
            }, 2000);  // 2000 ms = 2 seconds
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);  // Stop loading when data is fetched
      }
    }
  }, [user]);

  // Function to fetch comments for the next event
  const fetchCommentsForNextEvent = useCallback(async (nextEventId) => {
    if (!nextEventId) return;

    try {
      const commentsRef = collection(db, "arrangements", nextEventId, "comments");
      const q = query(commentsRef, orderBy("timestamp", "desc"));

      onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      });

      // Fetch user profile data for the users who made the comments
      const usersRef = collection(db, "users");
      onSnapshot(usersRef, (snapshot) => {
        const usersDataObj = snapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});
        setUsersData(usersDataObj);
      });

    } catch (err) {
      console.error("Error fetching comments for event:", err);
    }
  }, []);

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

      // Fetch comments for the next upcoming event
      if (fetchedEvents.length > 0) {
        const nextEvent = fetchedEvents[0];  // Get the next upcoming event
        fetchCommentsForNextEvent(nextEvent.id);  // Fetch comments for this event
      }

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
          <div className="upcoming-runs">
            <h2>Upcoming Runs</h2>
          </div>
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
        <div className="SeeAllBtn">
          <button className="see-all-events-btn" onClick={goToCalendar}>
            See All Events
          </button>
        </div>
        <h2 className="comments-on-events">Comments on events</h2>
        <section className="message-list">
          <div>
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div
                    className="comment-profile-img"
                    style={{
                      background: usersData[comment.userId]?.profileBackgroundColor || '#f0f0f0', // Fallback background color
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '50%',
                      overflow: 'hidden'
                    }}
                  >
                    {usersData[comment.userId]?.profileImageUrl ? (
                      <span className="feed-avatar-emoji">{usersData[comment.userId].profileImageUrl}</span>
                    ) : (
                      <img src={defaultProfilePic} alt="Profile" />
                    )}
                  </div>
                  <div className="comment-info">
                    <div className="comment-header">
                      <span className="comment-username">{comment.userName}</span>
                      <span className="comment-timestamp">
                        {comment.timestamp ? (
                          `${formatDistanceToNow(new Date(comment.timestamp.seconds * 1000))} ago`
                        ) : (
                          'Unknown time'
                        )}
                      </span>
                    </div>
                    <p className="feed-comment-text">{comment.commentText}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet for the next event.</p>
            )}
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
