import React from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Navbar from "./components/Navbar"; 
import TopNavBar from "./components/TopNavBar";  // Updated import
import './App.css';  // Ensure this is imported to apply the CSS styles

function App() {
  return (
    <div className="app-container">
      <div className="content">
        <TopNavBar />  {/* Use the updated component name here */}
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/members" element={<Members />} />
        </Routes>
      </div>
      <Navbar />
    </div>
  );
}

export default App;
