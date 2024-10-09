import React from 'react';
import './ConfirmDelete.css'; // Import CSS for styling

const ConfirmDelete = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirm-delete">
      <div className="confirm-delete-dialog">
        <p>Are you sure you want to delete this run?</p>
        <div className="confirm-delete-buttons">
          <button className="button-yes" onClick={onConfirm}>Yes</button>
          <button className="button-cancel-confirmdelete" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
