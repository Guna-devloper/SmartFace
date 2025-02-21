import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/ProtectedRoutes";
import AttendanceTracker from "./components/AttendanceTracker";
import React from 'react'
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const App = () => {
  return (
    <div>
      <Router>
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route element={<PrivateRoute />}>
      <Route path="/attendance-tracker" element={<AttendanceTracker />} />
    </Route>
  </Routes>
</Router>
    </div>
  )
}

export default App


