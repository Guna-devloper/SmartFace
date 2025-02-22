import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/ProtectedRoutes";
import AttendanceTracker from "./components/AttendanceTracker";
import React from 'react'
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AttendanceReport from "./components/AttendanceReport";
import Home from "./pages/Home";

const App = () => {
  return (
    <div>
      <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route element={<PrivateRoute />}>
      <Route path="/home" element={<Home />} />
    </Route>
    <Route path="/attendance-tracker" element={<AttendanceTracker />} />
    <Route path="/report" element={<AttendanceReport />} />

  </Routes>
</Router>
    </div>
  )
}

export default App


