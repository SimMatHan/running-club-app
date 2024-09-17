import React from "react";
import { Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Navbar from "./components/Navbar"; 

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/members" element={<Members />} />
      </Routes>
    </div>
  );
}

export default App;
