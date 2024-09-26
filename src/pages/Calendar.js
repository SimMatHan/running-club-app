import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";  // Firestore
import { collection, getDocs } from "firebase/firestore";  // Firestore methods
import './Calendar.css';  // Reuse the CreateRun CSS for the same styling
import EventDetails from '../components/EventDetails';  // Import the EventDetails component
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isSameMonth, addMonths, subMonths, isToday, isPast } from 'date-fns';  // Import necessary date-fns functions

import LeftArrow from '../assets/Left-Arrow.svg';
import RightArrow from '../assets/Right-Arrow.svg';

const Calendar = () => {
  const [arrangements, setArrangements] = useState([]);  // Store all upcoming events
  const [selectedEvent, setSelectedEvent] = useState(null);  // Track selected event for details view
  const [error, setError] = useState("");  // Error handling state
  const [calendarDays, setCalendarDays] = useState([]);  // Store the days of the month
  const [isCalendarView, setIsCalendarView] = useState(false);  // Toggle between list view and calendar view
  const [selectedMonth, setSelectedMonth] = useState(new Date());  // Track the selected month

  // Function to fetch all upcoming events from Firestore and sort by date
  const fetchArrangements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "arrangements"));  // Fetch data from the 'arrangements' collection

      const fetchedArrangements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setArrangements(fetchedArrangements);  // Set the events in the state
    } catch (err) {
      console.error("Error fetching events: ", err);
      setError("Failed to load events. Please try again later.");
    }
  };

  // Generate days for the selected month
  const generateCalendarDays = (month) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    setCalendarDays(days);
  };

  // Use effect to fetch events and generate calendar days on component mount
  useEffect(() => {
    fetchArrangements();
    generateCalendarDays(selectedMonth);
  }, [selectedMonth]);

  // Function to get events on a specific date
  const getEventsForDate = (date) => {
    return arrangements.filter(arrangement => isSameDay(new Date(arrangement.date), date));
  };

  // Function to filter events for the selected month
  const getEventsForMonth = (month) => {
    return arrangements.filter(arrangement => isSameMonth(new Date(arrangement.date), month));
  };

  // Function to handle opening event details
  const openEventDetails = (arrangement) => {
    setSelectedEvent(arrangement);
  };

  // Function to handle closing event details
  const closeEventDetails = () => {
    setSelectedEvent(null);  // Close the event details
  };

  // Handle previous month selection
  const handlePreviousMonth = () => {
    const prevMonth = subMonths(selectedMonth, 1);
    setSelectedMonth(prevMonth);
  };

  // Handle next month selection
  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedMonth, 1);
    setSelectedMonth(nextMonth);
  };

  // Function to handle clicking on a calendar day
  const handleDayClick = (date) => {
    const eventsForDay = getEventsForDate(date);
    if (eventsForDay.length === 1) {
      openEventDetails(eventsForDay[0]);  // Open details if there’s exactly one event
    } else if (eventsForDay.length > 1) {
      openEventDetails(eventsForDay[0]);  // For now, just open the first event
    }
  };

  // Get the events for the currently selected month
  const filteredArrangements = getEventsForMonth(selectedMonth);

  return (
    <div className="calendar-page">
      {/* Title Section */}
      <div className="calendar-title">
        <h1>Upcoming Runs</h1>
      </div>

      {/* Main Content Section */}
      <div className="calendar-content">
        {error && <p className="error-message">{error}</p>}

        {/* Toggle Switch and Month Selector */}
        <div className="calendar-controls">
          <div className="calendar-toggle">
            <label htmlFor="calendar-toggle">Calendar</label>
            <label className="switch">
              <input
                type="checkbox"
                id="calendar-toggle"
                checked={isCalendarView}
                onChange={() => setIsCalendarView(!isCalendarView)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="month-selector">
            <button onClick={handlePreviousMonth} className="month-arrow-btn">
              <img src={LeftArrow} alt="Previous Month" />
            </button>
            <span>{format(selectedMonth, 'MMMM yyyy')}</span>
            <button onClick={handleNextMonth} className="month-arrow-btn">
              <img src={RightArrow} alt="Next Month" />
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on the selected view */}
        {isCalendarView ? (
          <div className="calendar-grid">
            {/* Add day abbreviations */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={index} className="calendar-header">
                {day}
              </div>
            ))}
            {calendarDays.map((day) => {
              const eventsForDay = getEventsForDate(day);
              const isCurrentDay = isToday(day);  // Highlight the current day
              const isBeforeToday = isPast(day) && !isToday(day);  // Grey out days before today
              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={`calendar-day ${isCurrentDay ? 'current-day' : ''} ${isBeforeToday ? 'past-day' : ''} ${eventsForDay.length > 0 ? 'has-event' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <span>{format(day, 'd')}</span>
                  {eventsForDay.length > 0 && <div className="event-marker"></div>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="run-list">
            {filteredArrangements.length > 0 ? (
              filteredArrangements.map((arrangement) => (
                <div
                  key={arrangement.id}
                  className="run-item"
                  onClick={() => openEventDetails(arrangement)}  // Open event details on click
                >
                  <h3>{arrangement.title}</h3>
                  <p>
                    <strong>Date:</strong> {arrangement.date}<br />
                    <strong>Time:</strong> {arrangement.time}<br />
                    <strong>Location:</strong> {arrangement.location}<br />
                    <strong>Distance:</strong> {arrangement.distance}<br />
                    <strong>Organizer:</strong> {arrangement.createdBy}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-arrangements">No upcoming events found for this month.</p>
            )}
          </div>
        )}
      </div>

      {/* Render EventDetails component when an event is selected */}
      {selectedEvent && (
        <EventDetails event={selectedEvent} onClose={closeEventDetails} />
      )}
    </div>
  );
};

export default Calendar;