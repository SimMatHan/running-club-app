import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import CreateRun from "./pages/CreateRun";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Login from "./pages/Login";  // Import the Login page
import Navbar from "./components/Navbar";
import TopNavBar from "./components/TopNavBar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebaseConfig";  // Import Firebase authentication
import './App.css';

function App() {
  const [user, loading] = useAuthState(auth);  // Track authentication state

  if (loading) {
    return <p>Loading...</p>;  // Show a loading state while Firebase checks authentication
  }

  return (
    <div className="app-container">
      {/* Only show the navigation bars when the user is authenticated */}
      {user && <TopNavBar />}
      
      <Routes>
        {/* Redirect to Feed if user is authenticated, otherwise go to Login */}
        {/* Updated the default route to redirect authenticated users to /feed */}
        <Route path="/" element={user ? <Navigate to="/feed" /> : <Navigate to="/login" />} />
        <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/createrun" element={user ? <CreateRun /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <Calendar /> : <Navigate to="/login" />} />
        <Route path="/members" element={user ? <Members /> : <Navigate to="/login" />} />
        
        {/* Handle the login route - if already logged in, redirect to /feed */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />  
      </Routes>

      {/* Only show the bottom Navbar when the user is authenticated */}
      {user && <Navbar />}
    </div>
  );
}

export default App;
