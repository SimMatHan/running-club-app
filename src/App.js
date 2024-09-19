import React from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Login from "./pages/Login";  // Import the Login page
import Navbar from "./components/Navbar";
import TopNavBar from "./components/TopNavBar";
import './App.css';

function App() {
  return (
    <div className="app-container">
      <TopNavBar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/members" element={<Members />} />
        <Route path="/login" element={<Login />} />  {/* Add the login route */}
      </Routes>
      <Navbar />
    </div>
  );
}

export default App;
