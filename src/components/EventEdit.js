import React from "react";
import './EventEdit.css';  // Make sure to use the appropriate CSS

const EventEdit = ({
  event,
  title,
  date,
  time,
  location,
  distance,
  description,
  onTitleChange,
  onDateChange,
  onTimeChange,
  onLocationChange,
  onDistanceChange,
  onDescriptionChange,
  handleSubmit,
  onClose,
  isClosing
}) => {
  if (!event) return null;  // Don't render if there's no event to show

  return (
    <div>
      {/* Overlay */}
      <div
        className={`edit-overlay ${isClosing ? "overlay-hide" : ""}`}
        onClick={onClose}
      ></div>

      {/* Edit Panel */}
      <div className={`edit-panel ${isClosing ? "slide-down" : "slide-up"}`}>
        <button className="close-button" onClick={onClose}>X</button>
        <form onSubmit={handleSubmit} className="arrangement-form">
          <h2>Update Your Run</h2>

          <div>
            <label>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={onTitleChange}
              required
              placeholder="Enter the title of the event"
            />
          </div>

          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={onDateChange}
              required
            />
          </div>

          <div>
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={onTimeChange}
              required
            />
          </div>

          <div>
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={onLocationChange}
              required
              placeholder="Enter the location of the event"
            />
          </div>

          <div>
            <label>Distance (e.g., 5K, 10K)</label>
            <input
              type="text"
              value={distance}
              onChange={onDistanceChange}
              required
              placeholder="Enter the distance of the run"
            />
          </div>

          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={onDescriptionChange}
              placeholder="Any additional information or notes"
            />
          </div>

          <button type="submit">Update Arrangement</button>
        </form>
      </div>
    </div>
  );
};

export default EventEdit;
