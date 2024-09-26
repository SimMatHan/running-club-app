import React, { useState } from "react";
import './GuidePopup.css';

const GuidePopup = ({ onClose, onDoNotShowAgain }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [selectedBrowser, setSelectedBrowser] = useState('Safari'); // Initial state is Safari

  const handleCheckboxChange = () => {
    setDontShowAgain(!dontShowAgain);
  };

  const handleClose = () => {
    if (dontShowAgain) {
      onDoNotShowAgain(); // Trigger the update to Firebase
    }
    onClose(); // Close the popup
  };

  const handleToggleChange = (browser) => {
    setSelectedBrowser(browser); // Change to the selected browser
  };

  // Safari Guide
  const safariGuide = (
    <div>
      <h3>How to Add Website to Home Screen in Safari</h3>
      <ol>
        <li>Open Safari on your iPhone.</li>
        <li>Visit the website.</li>
        <li>Tap the <strong>Share</strong> button (square with an arrow).</li>
        <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
        <li>If you don't see this, tap <strong>Edit Actions</strong> and add <strong>Add to Home Screen</strong>.</li>
      </ol>
    </div>
  );

  // Chrome Guide
  const chromeGuide = (
    <div>
      <h3>How to Add Website to Home Screen in Chrome</h3>
      <ol>
        <li>Open Chrome on your phone.</li>
        <li>Visit the website.</li>
        <li>Tap the three vertical dots in the top-right corner.</li>
        <li>Tap <strong>Add to Home screen</strong>.</li>
      </ol>
    </div>
  );

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {/* Buttons for selecting browser */}
        <div className="browser-toggle">
          <button
            className={selectedBrowser === 'Safari' ? 'active' : ''}
            onClick={() => handleToggleChange('Safari')}
          >
            Safari
          </button>
          <button
            className={selectedBrowser === 'Chrome' ? 'active' : ''}
            onClick={() => handleToggleChange('Chrome')}
          >
            Chrome
          </button>
        </div>

        <h2>Welcome to Club Send IT</h2>
        <p>Add this website to your home screen for a more native app experience.</p>

        {/* Display the correct guide based on selected browser */}
        <div className="guide-content">
          {selectedBrowser === 'Safari' ? safariGuide : chromeGuide}
        </div>

        <div className="popup-actions">
          <label>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleCheckboxChange}
            />
            Do not show again
          </label>
          <button onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GuidePopup;
